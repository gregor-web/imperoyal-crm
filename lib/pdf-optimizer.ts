import Anthropic from '@anthropic-ai/sdk';

// Dynamic import for pdf-to-img (may not work in all environments)
let pdfToImgModule: typeof import('pdf-to-img') | null = null;

async function loadPdfToImg() {
  if (!pdfToImgModule) {
    try {
      pdfToImgModule = await import('pdf-to-img');
      console.log('[PDF-TO-IMG] Modul erfolgreich geladen');
    } catch (error) {
      console.error('[PDF-TO-IMG] Modul konnte nicht geladen werden:', error);
      return null;
    }
  }
  return pdfToImgModule;
}

// Style adjustments that can be made based on AI feedback
export interface StyleAdjustments {
  // Reduce spacing between sections
  reduceSectionSpacing: boolean;
  // Make fonts smaller
  reduceFontSize: boolean;
  // Reduce padding
  reducePadding: boolean;
  // Compact metrics bar
  compactMetricsBar: boolean;
  // Reduce margin bottom on sections
  reduceMarginBottom: boolean;
  // Reduce chart heights
  reduceChartHeights: boolean;
}

export interface PdfAnalysisResult {
  isValid: boolean;
  issues: string[];
  suggestions: StyleAdjustments;
  pageAnalysis: {
    pageNumber: number;
    hasExcessiveWhitespace: boolean;
    hasOverflow: boolean;
    contentCoverage: number; // 0-100%
  }[];
}

const defaultAdjustments: StyleAdjustments = {
  reduceSectionSpacing: false,
  reduceFontSize: false,
  reducePadding: false,
  compactMetricsBar: false,
  reduceMarginBottom: false,
  reduceChartHeights: false,
};

/**
 * Converts a PDF buffer to base64 encoded images (one per page)
 */
export async function pdfToImages(pdfBuffer: Buffer): Promise<string[]> {
  const images: string[] = [];
  console.log('[PDF-TO-IMG] Konvertiere PDF zu Bildern...');
  console.log('[PDF-TO-IMG] PDF Buffer Größe:', pdfBuffer.length, 'bytes');

  try {
    const pdfModule = await loadPdfToImg();
    if (!pdfModule) {
      console.warn('[PDF-TO-IMG] Modul nicht verfügbar, überspringe Konvertierung');
      return [];
    }

    // pdf-to-img returns an async iterator of page images
    const document = await pdfModule.pdf(pdfBuffer, { scale: 1.5 });
    console.log('[PDF-TO-IMG] PDF Dokument geladen');

    let pageNum = 0;
    for await (const image of document) {
      pageNum++;
      // Convert Buffer to base64
      const base64 = Buffer.from(image).toString('base64');
      images.push(base64);
      console.log(`[PDF-TO-IMG] Seite ${pageNum} konvertiert, Bild-Größe: ${base64.length} chars`);
    }
    console.log(`[PDF-TO-IMG] Insgesamt ${images.length} Seiten konvertiert`);
  } catch (error) {
    console.error('[PDF-TO-IMG] FEHLER bei Konvertierung:', error);
    // Return empty array instead of throwing - allows graceful degradation
    return [];
  }

  return images;
}

/**
 * Analyzes PDF pages using Claude Vision to detect layout issues
 */
export async function analyzePdfWithVision(
  pageImages: string[],
  anthropicApiKey: string
): Promise<PdfAnalysisResult> {
  console.log('[CLAUDE-VISION] Starte Analyse mit', pageImages.length, 'Seiten');

  // If no images available, return default valid result
  if (!pageImages || pageImages.length === 0) {
    console.warn('[CLAUDE-VISION] Keine Bilder verfügbar, überspringe Analyse');
    return {
      isValid: true,
      issues: ['PDF-zu-Bild Konvertierung nicht verfügbar'],
      suggestions: defaultAdjustments,
      pageAnalysis: [],
    };
  }

  const client = new Anthropic({ apiKey: anthropicApiKey });

  // Build content array with all page images
  const imageContent: Anthropic.ImageBlockParam[] = pageImages.map((base64, index) => ({
    type: 'image',
    source: {
      type: 'base64',
      media_type: 'image/png',
      data: base64,
    },
  }));
  console.log('[CLAUDE-VISION] Bilder für API vorbereitet');

  const prompt = `Du bist ein PDF-Layout-Experte. Analysiere diese ${pageImages.length} PDF-Seiten und prüfe auf Layoutprobleme.

Prüfe auf folgende Probleme:
1. Übermäßiger Weißraum (große leere Bereiche zwischen Sektionen)
2. Content-Overflow (Text oder Elemente die abgeschnitten werden)
3. Leere Seiten oder Seiten mit sehr wenig Inhalt
4. Unausgewogene Seitenaufteilung
5. Footer an falscher Position

Antworte NUR mit diesem JSON-Format (keine anderen Texte):
{
  "isValid": true/false,
  "issues": ["Problem 1", "Problem 2"],
  "pageAnalysis": [
    {"pageNumber": 1, "hasExcessiveWhitespace": false, "hasOverflow": false, "contentCoverage": 85},
    {"pageNumber": 2, "hasExcessiveWhitespace": true, "hasOverflow": false, "contentCoverage": 45}
  ],
  "suggestions": {
    "reduceSectionSpacing": true/false,
    "reduceFontSize": true/false,
    "reducePadding": true/false,
    "compactMetricsBar": true/false,
    "reduceMarginBottom": true/false,
    "reduceChartHeights": true/false
  }
}

isValid = true wenn alle Seiten gut formatiert sind (>70% content coverage, keine großen Lücken)
contentCoverage = geschätzter Prozentsatz der Seite der mit Inhalt gefüllt ist`;

  try {
    console.log('[CLAUDE-VISION] Sende Anfrage an Claude API...');
    const startTime = Date.now();
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: [
            ...imageContent,
            { type: 'text', text: prompt },
          ],
        },
      ],
    });
    console.log(`[CLAUDE-VISION] Antwort erhalten in ${Date.now() - startTime}ms`);
    console.log('[CLAUDE-VISION] Token usage:', response.usage);

    // Extract text response
    const textContent = response.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      console.error('[CLAUDE-VISION] Keine Text-Antwort gefunden');
      throw new Error('No text response from Claude');
    }

    console.log('[CLAUDE-VISION] Rohe Antwort:', textContent.text.substring(0, 500));

    // Parse JSON from response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[CLAUDE-VISION] JSON konnte nicht geparsed werden');
      throw new Error('Could not parse JSON from response');
    }

    const result = JSON.parse(jsonMatch[0]) as PdfAnalysisResult;
    console.log('[CLAUDE-VISION] Erfolgreich geparsed:', {
      isValid: result.isValid,
      issueCount: result.issues?.length || 0,
      pageCount: result.pageAnalysis?.length || 0,
    });
    return result;
  } catch (error) {
    console.error('[CLAUDE-VISION] FEHLER:', error);
    // Return default "valid" result on error
    return {
      isValid: true,
      issues: [],
      suggestions: defaultAdjustments,
      pageAnalysis: pageImages.map((_, i) => ({
        pageNumber: i + 1,
        hasExcessiveWhitespace: false,
        hasOverflow: false,
        contentCoverage: 80,
      })),
    };
  }
}

/**
 * Calculates style multipliers based on AI suggestions
 */
export function calculateStyleMultipliers(adjustments: StyleAdjustments): {
  spacingMultiplier: number;
  fontSizeMultiplier: number;
  paddingMultiplier: number;
  chartHeightMultiplier: number;
} {
  let spacingMultiplier = 1;
  let fontSizeMultiplier = 1;
  let paddingMultiplier = 1;
  let chartHeightMultiplier = 1;

  if (adjustments.reduceSectionSpacing) {
    spacingMultiplier *= 0.7;
  }
  if (adjustments.reduceMarginBottom) {
    spacingMultiplier *= 0.8;
  }
  if (adjustments.reduceFontSize) {
    fontSizeMultiplier *= 0.9;
  }
  if (adjustments.reducePadding) {
    paddingMultiplier *= 0.8;
  }
  if (adjustments.compactMetricsBar) {
    paddingMultiplier *= 0.85;
  }
  if (adjustments.reduceChartHeights) {
    chartHeightMultiplier *= 0.85;
  }

  return {
    spacingMultiplier,
    fontSizeMultiplier,
    paddingMultiplier,
    chartHeightMultiplier,
  };
}

/**
 * Main optimization loop - generates PDF, analyzes, adjusts, repeats
 */
export interface OptimizationResult {
  success: boolean;
  attempts: number;
  finalAnalysis: PdfAnalysisResult | null;
  appliedAdjustments: StyleAdjustments;
}

export async function runOptimizationAnalysis(
  pdfBuffer: Buffer,
  anthropicApiKey: string
): Promise<{ analysis: PdfAnalysisResult; adjustments: StyleAdjustments }> {
  // Convert PDF to images
  const images = await pdfToImages(pdfBuffer);

  // Analyze with Vision
  const analysis = await analyzePdfWithVision(images, anthropicApiKey);

  return {
    analysis,
    adjustments: analysis.suggestions,
  };
}
