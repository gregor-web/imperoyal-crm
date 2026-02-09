import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    // Verify user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 });
    }

    // Fetch auswertung with mandant and objekt
    const { data: auswertung, error: fetchError } = await supabase
      .from('auswertungen')
      .select(`
        *,
        objekte (strasse, plz, ort),
        mandanten (name, ansprechpartner, email)
      `)
      .eq('id', auswertung_id)
      .single();

    if (fetchError || !auswertung) {
      return NextResponse.json({ error: 'Auswertung nicht gefunden' }, { status: 404 });
    }

    const mandant = auswertung.mandanten as { name: string; ansprechpartner: string; email: string } | null;
    const objekt = auswertung.objekte as { strasse: string; plz: string; ort: string } | null;

    if (!mandant?.email) {
      return NextResponse.json({ error: 'Mandant hat keine E-Mail-Adresse' }, { status: 400 });
    }

    // Check if webhook URL is configured
    const webhookUrl = process.env.MAKE_WEBHOOK_URL;
    if (!webhookUrl) {
      console.warn('MAKE_WEBHOOK_URL not configured, skipping email');
      return NextResponse.json({
        success: true,
        message: 'E-Mail-Versand nicht konfiguriert (MAKE_WEBHOOK_URL fehlt)',
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
        pdf_url: auswertung.pdf_url,
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
    await supabase
      .from('auswertungen')
      .update({ status: 'versendet' })
      .eq('id', auswertung_id);

    return NextResponse.json({
      success: true,
      message: 'Auswertungs-E-Mail wurde versendet',
    });
  } catch (error) {
    console.error('Auswertung email error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Versenden der Auswertungs-E-Mail' },
      { status: 500 }
    );
  }
}
