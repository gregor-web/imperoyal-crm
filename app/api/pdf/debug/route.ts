import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { createClient } from '@/lib/supabase/server';
import { DebugPDF } from '@/components/pdf/debug-pdf';
import type { Berechnungen } from '@/lib/types';

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

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Nur für Admins zugänglich' }, { status: 403 });
    }

    // Fetch auswertung with objekt
    const { data: auswertung, error: fetchError } = await supabase
      .from('auswertungen')
      .select(`
        *,
        objekte (id, strasse, plz, ort, baujahr, milieuschutz, weg_aufgeteilt, kaufpreis)
      `)
      .eq('id', auswertung_id)
      .single();

    if (fetchError || !auswertung) {
      return NextResponse.json({ error: 'Auswertung nicht gefunden' }, { status: 404 });
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
    const berechnungen = auswertung.berechnungen as Berechnungen;

    // Generate PDF buffer
    const pdfBuffer = await renderToBuffer(
      DebugPDF({
        objekt,
        berechnungen,
        created_at: auswertung.created_at,
      })
    );

    // Create a clean filename
    const cleanAddress = objekt.strasse
      .replace(/[äÄ]/g, 'ae')
      .replace(/[öÖ]/g, 'oe')
      .replace(/[üÜ]/g, 'ue')
      .replace(/ß/g, 'ss')
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
    const dateStr = new Date(auswertung.created_at).toISOString().split('T')[0];
    const filename = `DEBUG_${cleanAddress}_${dateStr}.pdf`;

    // Return PDF as response
    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Debug PDF generation error:', error);
    return NextResponse.json(
      { error: 'Fehler bei der PDF-Generierung' },
      { status: 500 }
    );
  }
}
