import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { renderToBuffer } from '@react-pdf/renderer';
import { AuswertungPDF } from '@/components/pdf/auswertung-pdf';
import type { Berechnungen } from '@/lib/types';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { auswertung_id } = await request.json();

    if (!auswertung_id) {
      return NextResponse.json(
        { error: 'auswertung_id ist erforderlich' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    // Verify user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 });
    }

    // Fetch auswertung with full data for PDF generation
    const { data: auswertung, error: fetchError } = await supabase
      .from('auswertungen')
      .select(`
        *,
        objekte (id, strasse, plz, ort, baujahr, milieuschutz, weg_aufgeteilt, kaufpreis),
        mandanten (id, name, ansprechpartner, email, anrede)
      `)
      .eq('id', auswertung_id)
      .single();

    if (fetchError || !auswertung) {
      return NextResponse.json({ error: 'Auswertung nicht gefunden' }, { status: 404 });
    }

    const mandant = auswertung.mandanten as {
      id: string;
      name: string;
      ansprechpartner: string;
      email: string;
      anrede?: string | null;
    } | null;
    const objekt = auswertung.objekte as {
      id: string;
      strasse: string;
      plz: string;
      ort: string;
      baujahr?: number | null;
      milieuschutz?: boolean;
      weg_aufgeteilt?: boolean;
      kaufpreis?: number;
    } | null;

    if (!mandant?.email) {
      return NextResponse.json({ error: 'Mandant hat keine E-Mail-Adresse' }, { status: 400 });
    }

    // Generate and upload PDF if not already stored
    let pdfUrl = auswertung.pdf_url;

    if (!pdfUrl && objekt) {
      console.log('[EMAIL] Generating PDF for auswertung:', auswertung_id);

      // Fetch einheiten for PDF
      const { data: einheiten } = await supabase
        .from('einheiten')
        .select('position, nutzung, flaeche, kaltmiete, vergleichsmiete, mietvertragsart')
        .eq('objekt_id', objekt.id)
        .order('position');

      // Read logo file
      let logoUrl: string | undefined;
      try {
        const logoPath = path.join(process.cwd(), 'public', 'logo_imperoyal.png');
        const logoBuffer = fs.readFileSync(logoPath);
        logoUrl = `data:image/png;base64,${logoBuffer.toString('base64')}`;
      } catch {
        console.warn('[EMAIL] Logo not found');
      }

      // Generate PDF
      const berechnungen = auswertung.berechnungen as Berechnungen;
      const pdfBuffer = await renderToBuffer(
        AuswertungPDF({
          objekt,
          mandant: { name: mandant.name, ansprechpartner: mandant.ansprechpartner, anrede: mandant.anrede as 'Herr' | 'Frau' | null | undefined },
          einheiten: einheiten || [],
          berechnungen,
          empfehlung: auswertung.empfehlung,
          empfehlung_begruendung: auswertung.empfehlung_begruendung,
          empfehlung_prioritaet: auswertung.empfehlung_prioritaet,
          empfehlung_handlungsschritte: auswertung.empfehlung_handlungsschritte as string[] | undefined,
          empfehlung_chancen: auswertung.empfehlung_chancen as string[] | undefined,
          empfehlung_risiken: auswertung.empfehlung_risiken as string[] | undefined,
          empfehlung_fazit: auswertung.empfehlung_fazit,
          created_at: auswertung.created_at,
          logoUrl,
        })
      );

      console.log('[EMAIL] PDF generated, size:', pdfBuffer.length, 'bytes');

      // Create filename
      const cleanName = (mandant.name || 'Unbekannt')
        .replace(/[äÄ]/g, 'ae')
        .replace(/[öÖ]/g, 'oe')
        .replace(/[üÜ]/g, 'ue')
        .replace(/ß/g, 'ss')
        .replace(/[^a-zA-Z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
      const dateStr = new Date(auswertung.created_at).toISOString().split('T')[0];
      const filename = `${auswertung_id}/${dateStr}_${cleanName}.pdf`;

      // Upload to Supabase Storage using admin client
      const { error: uploadError } = await adminSupabase.storage
        .from('auswertungen-pdfs')
        .upload(filename, Buffer.from(pdfBuffer), {
          contentType: 'application/pdf',
          upsert: true,
        });

      if (uploadError) {
        console.error('[EMAIL] Upload error:', uploadError);
        throw new Error(`PDF Upload fehlgeschlagen: ${uploadError.message}`);
      }

      // Get public URL
      const { data: urlData } = adminSupabase.storage
        .from('auswertungen-pdfs')
        .getPublicUrl(filename);

      pdfUrl = urlData.publicUrl;
      console.log('[EMAIL] PDF uploaded, URL:', pdfUrl);

      // Update auswertung with pdf_url
      await adminSupabase
        .from('auswertungen')
        .update({ pdf_url: pdfUrl })
        .eq('id', auswertung_id);
    }

    // Check if webhook URL is configured
    const webhookUrl = process.env.MAKE_WEBHOOK_URL;
    if (!webhookUrl) {
      console.warn('MAKE_WEBHOOK_URL not configured, skipping email');

      // Still update status to versendet and update anfrage status
      await adminSupabase
        .from('auswertungen')
        .update({ status: 'versendet' })
        .eq('id', auswertung_id);

      // Update anfrage status
      await adminSupabase
        .from('anfragen')
        .update({ status: 'versendet' })
        .eq('objekt_id', objekt?.id);

      return NextResponse.json({
        success: true,
        message: 'PDF gespeichert. E-Mail-Versand nicht konfiguriert (MAKE_WEBHOOK_URL fehlt)',
        pdf_url: pdfUrl,
        skipped: true,
      });
    }

    // Send to Make.com webhook
    const webhookPayload = {
      actionId: 2, // Auswertungs-Mail
      type: 'auswertung',
      to_email: mandant.email,
      to_name: mandant.ansprechpartner || mandant.name,
      subject: `Ihre Immobilienauswertung: ${objekt?.strasse}`,
      data: {
        auswertung_id,
        mandant_name: mandant.name,
        objekt_adresse: `${objekt?.strasse}, ${objekt?.plz} ${objekt?.ort}`,
        empfehlung: auswertung.empfehlung,
        empfehlung_begruendung: auswertung.empfehlung_begruendung,
        pdf_url: pdfUrl,
        view_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auswertungen/${auswertung_id}`,
      },
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookPayload),
    });

    if (!response.ok) {
      throw new Error(`Webhook returned ${response.status}`);
    }

    // Update auswertung status to 'versendet'
    await adminSupabase
      .from('auswertungen')
      .update({ status: 'versendet' })
      .eq('id', auswertung_id);

    // Update anfrage status to 'versendet'
    await adminSupabase
      .from('anfragen')
      .update({ status: 'versendet' })
      .eq('objekt_id', objekt?.id);

    return NextResponse.json({
      success: true,
      message: 'Auswertungs-E-Mail wurde versendet',
      pdf_url: pdfUrl,
    });
  } catch (error) {
    console.error('Auswertung email error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Fehler beim Versenden der Auswertungs-E-Mail' },
      { status: 500 }
    );
  }
}
