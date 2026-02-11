import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { createClient } from '@/lib/supabase/server';
import { AuswertungPDF } from '@/components/pdf/auswertung-pdf';
import type { Berechnungen } from '@/lib/types';
import fs from 'fs';
import path from 'path';
import { runOptimizationAnalysis, type StyleAdjustments, calculateStyleMultipliers } from '@/lib/pdf-optimizer';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!;
const MAX_ATTEMPTS = 3;

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
        objekte (id, strasse, plz, ort, baujahr, milieuschutz, weg_aufgeteilt, kaufpreis),
        mandanten (name, ansprechpartner)
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

    // PDF generation with optimization loop
    let attempts = 0;
    let currentAdjustments: StyleAdjustments = {
      reduceSectionSpacing: false,
      reduceFontSize: false,
      reducePadding: false,
      compactMetricsBar: false,
      reduceMarginBottom: false,
      reduceChartHeights: false,
    };
    let pdfBuffer: Buffer = Buffer.alloc(0);
    let isOptimal = false;
    const optimizationLog: string[] = [];

    console.log('[PDF-OPTIMIZER] ========================================');
    console.log('[PDF-OPTIMIZER] Starting optimization for auswertung:', auswertung_id);
    console.log('[PDF-OPTIMIZER] Objekt:', objekt.strasse, objekt.plz, objekt.ort);
    console.log('[PDF-OPTIMIZER] Max attempts:', MAX_ATTEMPTS);

    while (attempts < MAX_ATTEMPTS && !isOptimal) {
      attempts++;
      console.log('[PDF-OPTIMIZER] ----------------------------------------');
      console.log(`[PDF-OPTIMIZER] Versuch ${attempts}/${MAX_ATTEMPTS}`);
      optimizationLog.push(`Versuch ${attempts}...`);

      // Calculate style multipliers from adjustments
      const multipliers = calculateStyleMultipliers(currentAdjustments);
      console.log('[PDF-OPTIMIZER] Aktuelle Multipliers:', JSON.stringify(multipliers));

      // Generate PDF with current adjustments
      console.log('[PDF-OPTIMIZER] Generiere PDF...');
      const pdfStartTime = Date.now();
      pdfBuffer = await renderToBuffer(
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
          styleMultipliers: multipliers,
        })
      );
      console.log(`[PDF-OPTIMIZER] PDF generiert in ${Date.now() - pdfStartTime}ms`);
      console.log(`[PDF-OPTIMIZER] PDF Größe: ${pdfBuffer.length} bytes`);

      // Run AI analysis
      try {
        console.log('[PDF-OPTIMIZER] Starte KI-Analyse mit Claude Vision...');
        const analysisStartTime = Date.now();
        const { analysis, adjustments } = await runOptimizationAnalysis(
          Buffer.from(pdfBuffer),
          ANTHROPIC_API_KEY
        );
        console.log(`[PDF-OPTIMIZER] KI-Analyse abgeschlossen in ${Date.now() - analysisStartTime}ms`);

        console.log('[PDF-OPTIMIZER] Analyse-Ergebnis:', analysis.isValid ? 'VALID' : 'ISSUES FOUND');
        optimizationLog.push(`Analyse: ${analysis.isValid ? 'OK' : 'Probleme gefunden'}`);

        if (analysis.pageAnalysis && analysis.pageAnalysis.length > 0) {
          console.log('[PDF-OPTIMIZER] Seiten-Analyse:');
          analysis.pageAnalysis.forEach((page) => {
            console.log(`[PDF-OPTIMIZER]   Seite ${page.pageNumber}: Coverage=${page.contentCoverage}%, Whitespace=${page.hasExcessiveWhitespace}, Overflow=${page.hasOverflow}`);
          });
        }

        if (analysis.issues.length > 0) {
          console.log('[PDF-OPTIMIZER] Gefundene Issues:', analysis.issues);
          optimizationLog.push(`Issues: ${analysis.issues.join(', ')}`);
        }

        if (analysis.isValid) {
          isOptimal = true;
          console.log('[PDF-OPTIMIZER] PDF ist optimal formatiert!');
          optimizationLog.push('PDF ist optimal formatiert!');
        } else {
          // Apply new adjustments for next iteration
          currentAdjustments = {
            ...currentAdjustments,
            ...adjustments,
          };
          console.log('[PDF-OPTIMIZER] Neue Anpassungen für nächsten Versuch:', JSON.stringify(adjustments));
          optimizationLog.push(`Anpassungen: ${JSON.stringify(adjustments)}`);
        }
      } catch (analysisError) {
        console.error('[PDF-OPTIMIZER] FEHLER bei Analyse:', analysisError);
        optimizationLog.push(`Analyse-Fehler: ${analysisError}`);
        // Continue with current PDF on analysis error
        isOptimal = true;
      }
    }

    console.log('[PDF-OPTIMIZER] ========================================');
    console.log('[PDF-OPTIMIZER] Optimierung abgeschlossen');
    console.log('[PDF-OPTIMIZER] Versuche gesamt:', attempts);
    console.log('[PDF-OPTIMIZER] Erfolgreich:', isOptimal);
    console.log('[PDF-OPTIMIZER] Log:', optimizationLog);

    // Safety check - ensure we have a valid PDF buffer
    if (!pdfBuffer || pdfBuffer.length === 0) {
      console.error('[PDF-OPTIMIZER] CRITICAL: PDF buffer is empty!');
      return NextResponse.json(
        { error: 'PDF konnte nicht generiert werden' },
        { status: 500 }
      );
    }

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

    console.log('[PDF-OPTIMIZER] Sende Response mit', pdfBuffer.length, 'bytes');

    // Return PDF as response with optimization info in headers
    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
        'X-Optimization-Attempts': attempts.toString(),
        'X-Optimization-Success': isOptimal.toString(),
        'Access-Control-Expose-Headers': 'Content-Disposition, X-Optimization-Attempts, X-Optimization-Success',
      },
    });
  } catch (error) {
    console.error('[PDF-OPTIMIZER] CRITICAL ERROR:', error);
    console.error('[PDF-OPTIMIZER] Stack:', error instanceof Error ? error.stack : 'no stack');
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Fehler bei der PDF-Optimierung' },
      { status: 500 }
    );
  }
}
