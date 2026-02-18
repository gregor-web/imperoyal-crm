import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { createClient } from '@/lib/supabase/server';
import { AuswertungPDF } from '@/components/pdf/auswertung-pdf';
import type { Berechnungen, PdfConfig } from '@/lib/types';
import fs from 'fs';
import path from 'path';

// Vercel serverless: increase max duration
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { auswertung_id } = await request.json();

    if (!auswertung_id) {
      return NextResponse.json({ error: 'auswertung_id ist erforderlich' }, { status: 400 });
    }

    console.log('[PDF] Starting generation for:', auswertung_id);

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
        objekte (id, strasse, plz, ort, baujahr, milieuschutz, weg_aufgeteilt, kaufpreis, grundstueck, wohneinheiten, gewerbeeinheiten, geschosse, gebaeudetyp, heizungsart, denkmalschutz, kernsanierung_jahr, wohnflaeche, gewerbeflaeche, aufzug),
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
      grundstueck?: number | null;
      wohneinheiten?: number | null;
      gewerbeeinheiten?: number | null;
      geschosse?: number | null;
      gebaeudetyp?: string | null;
      heizungsart?: string | null;
      denkmalschutz?: boolean | null;
      kernsanierung_jahr?: number | null;
      wohnflaeche?: number | null;
      gewerbeflaeche?: number | null;
      aufzug?: boolean | null;
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
      if (fs.existsSync(logoPath)) {
        const logoBuffer = fs.readFileSync(logoPath);
        logoUrl = `data:image/png;base64,${logoBuffer.toString('base64')}`;
        console.log('[PDF] Logo loaded from filesystem');
      } else {
        // Fallback: load from URL (Vercel might not have public/ in cwd)
        const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const logoRes = await fetch(`${APP_URL}/logo_imperoyal.png`);
        if (logoRes.ok) {
          const logoBuf = Buffer.from(await logoRes.arrayBuffer());
          logoUrl = `data:image/png;base64,${logoBuf.toString('base64')}`;
          console.log('[PDF] Logo loaded from URL');
        }
      }
    } catch (logoError) {
      console.warn('[PDF] Logo not found, using text fallback:', logoError);
    }

    // Generate topographic map image
    let mapUrl: string | undefined;
    try {
      const { fetchTopographicMap } = await import('@/lib/map-utils');
      mapUrl = await fetchTopographicMap(objekt.strasse, objekt.plz, objekt.ort) || undefined;
      console.log('[PDF] Map loaded:', mapUrl ? 'yes' : 'no');
    } catch (mapError) {
      console.warn('[PDF] Map image could not be loaded:', mapError);
    }

    console.log('[PDF] Rendering PDF buffer...');

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
        mapUrl,
        pdfConfig: (auswertung.pdf_config as PdfConfig) || undefined,
      })
    );

    console.log('[PDF] Generated successfully:', pdfBuffer.length, 'bytes');

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
    console.error('[PDF] Generation error:', error instanceof Error ? error.message : error);
    console.error('[PDF] Stack:', error instanceof Error ? error.stack : 'no stack');
    return NextResponse.json(
      { error: `Fehler bei der PDF-Generierung: ${error instanceof Error ? error.message : 'Unbekannt'}` },
      { status: 500 }
    );
  }
}
