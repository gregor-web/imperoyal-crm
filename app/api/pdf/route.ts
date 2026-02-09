import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { createClient } from '@/lib/supabase/server';
import { AuswertungPDF } from '@/components/pdf/auswertung-pdf';
import type { Berechnungen, Erlaeuterungen } from '@/lib/types';

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

    // Fetch auswertung with objekt and mandant
    const { data: auswertung, error: fetchError } = await supabase
      .from('auswertungen')
      .select(`
        *,
        objekte (strasse, plz, ort),
        mandanten (name)
      `)
      .eq('id', auswertung_id)
      .single();

    if (fetchError || !auswertung) {
      return NextResponse.json({ error: 'Auswertung nicht gefunden' }, { status: 404 });
    }

    const objekt = auswertung.objekte as { strasse: string; plz: string; ort: string };
    const mandant = auswertung.mandanten as { name: string };
    const berechnungen = auswertung.berechnungen as Berechnungen;
    const erlaeuterungen = auswertung.erlaeuterungen as Erlaeuterungen | undefined;

    // Generate PDF buffer
    const pdfBuffer = await renderToBuffer(
      AuswertungPDF({
        objekt,
        mandant,
        berechnungen,
        erlaeuterungen,
        empfehlung: auswertung.empfehlung,
        empfehlung_begruendung: auswertung.empfehlung_begruendung,
        empfehlung_prioritaet: auswertung.empfehlung_prioritaet,
        empfehlung_handlungsschritte: auswertung.empfehlung_handlungsschritte as string[] | undefined,
        empfehlung_chancen: auswertung.empfehlung_chancen as string[] | undefined,
        empfehlung_risiken: auswertung.empfehlung_risiken as string[] | undefined,
        empfehlung_fazit: auswertung.empfehlung_fazit,
        created_at: auswertung.created_at,
      })
    );

    // Return PDF as response
    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Auswertung_${objekt.strasse.replace(/\s+/g, '_')}.pdf"`,
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
