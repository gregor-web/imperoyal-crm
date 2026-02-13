import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { createClient } from '@/lib/supabase/server';
import { AuswertungPDF } from '@/components/pdf/auswertung-pdf';
import type { Berechnungen } from '@/lib/types';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { auswertung_id } = await request.json();

    if (!auswertung_id) {
      return NextResponse.json({ error: 'auswertung_id ist erforderlich' }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify user has access
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    // SECURITY: Verify user is admin or owns the auswertung
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role, mandant_id')
      .eq('id', user.id)
      .single();

    // Fetch auswertung with objekt and mandant
    const { data: auswertung, error: fetchError } = await supabase
      .from('auswertungen')
      .select(`
        *,
        objekte (id, strasse, plz, ort, baujahr, milieuschutz, weg_aufgeteilt, kaufpreis),
        mandanten (name, ansprechpartner)
      `)
      .eq('id', auswertung_id)
      .single();

    if (fetchError || !auswertung) {
      return NextResponse.json({ error: 'Auswertung nicht gefunden' }, { status: 404 });
    }

    // SECURITY: Verify user has access to this specific auswertung
    if (userProfile?.role !== 'admin' && auswertung.mandant_id !== userProfile?.mandant_id) {
      return NextResponse.json({ error: 'Kein Zugriff auf diese Auswertung' }, { status: 403 });
    }

    const objekt = auswertung.objekte as {
      id: string;
      strasse: string;
      plz: string;
      ort: string;
      baujahr?: number | null;
      milieuschutz?: boolean;
      weg_aufgeteilt?: boolean;
      kaufpreis?: number;
    };
    const mandant = auswertung.mandanten as { name: string; ansprechpartner?: string | null };
    const berechnungen = auswertung.berechnungen as Berechnungen;

    // Fetch einheiten for this objekt
    const { data: einheiten } = await supabase
      .from('einheiten')
      .select('position, nutzung, flaeche, kaltmiete, vergleichsmiete, mietvertragsart')
      .eq('objekt_id', objekt.id)
      .order('position');

    // Read logo file and convert to base64
    let logoUrl: string | undefined;
    try {
      const logoPath = path.join(process.cwd(), 'public', 'logo_imperoyal.png');
      const logoBuffer = fs.readFileSync(logoPath);
      logoUrl = `data:image/png;base64,${logoBuffer.toString('base64')}`;
    } catch (logoError) {
      console.warn('Logo not found, using text fallback:', logoError);
    }

    // Generate PDF buffer
    const pdfBuffer = await renderToBuffer(
      AuswertungPDF({
        objekt,
        mandant,
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

    // Create a clean filename: auswertung_datum_Name
    const cleanName = (mandant.name || 'Unbekannt')
      .replace(/[äÄ]/g, 'ae')
      .replace(/[öÖ]/g, 'oe')
      .replace(/[üÜ]/g, 'ue')
      .replace(/ß/g, 'ss')
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
    const dateStr = new Date(auswertung.created_at).toISOString().split('T')[0];
    const filename = `auswertung_${dateStr}_${cleanName}.pdf`;

    // Return PDF as response
    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Access-Control-Expose-Headers': 'Content-Disposition',
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Fehler bei der PDF-Generierung' },
      { status: 500 }
    );
  }
}
