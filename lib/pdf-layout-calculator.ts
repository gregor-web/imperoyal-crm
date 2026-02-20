// =====================================================
// PDF Layout Calculator — Deterministic pre-render analysis
// Analyzes content density and returns per-page spacing adjustments
// =====================================================

import type { PdfConfig, PdfSectionId } from '@/lib/types';

// A4 dimensions in points
const A4_HEIGHT = 842;
const A4_WIDTH = 595;

// Page chrome
const PAGE_PADDING_TOP = 55;
const PAGE_PADDING_BOTTOM = 45;
const USABLE_HEIGHT = A4_HEIGHT - PAGE_PADDING_TOP - PAGE_PADDING_BOTTOM; // ~742pt

// Cover page (padding: 0, custom footer)
const COVER_FOOTER_RESERVED = 50;
const COVER_USABLE_HEIGHT = A4_HEIGHT - COVER_FOOTER_RESERVED; // ~792pt

/** Per-page layout adjustment */
export interface PageLayoutAdjustment {
  spacingMultiplier: number;
  paddingMultiplier: number;
  chartHeightMultiplier: number;
}

/** Cover page specific adjustments */
export interface CoverLayoutAdjustment extends PageLayoutAdjustment {
  mapHeight: number;
  objektBoxPadding: number;
  headerBottomPadding: number;
  contentTopPadding: number;
}

/** Mieterhöhung table adjustments */
export interface MieterhohungLayoutAdjustment extends PageLayoutAdjustment {
  tableFontSize: number;
  tableRowPaddingV: number;
}

/** Complete layout result */
export interface PdfLayoutResult {
  cover: CoverLayoutAdjustment;
  steckbrief: PageLayoutAdjustment;
  finanzErtrag: PageLayoutAdjustment;
  mieterhohung: MieterhohungLayoutAdjustment;
  charts: PageLayoutAdjustment;
  afaRoiExit: PageLayoutAdjustment;
  empfehlung: PageLayoutAdjustment;
  erlaeuterungen: PageLayoutAdjustment;
}

interface CalculateLayoutInput {
  hasMap: boolean;
  einheitenCount: number;
  handlungsschritteCount: number;
  chancenCount: number;
  risikenCount: number;
  begruendungLength: number;
  fazitLength: number;
  hasMarktdaten: boolean;
  hasPotenzialaufdeckung: boolean;
  hasWeg: boolean;
  hasMod559: boolean;
  hasZinsaenderung: boolean;
  visibleSections?: PdfSectionId[];
}

/**
 * Estimates text height for a given character count.
 */
function estimateTextHeight(charCount: number, fontSize = 8, containerWidth = A4_WIDTH - 100): number {
  if (charCount === 0) return 0;
  const charsPerLine = Math.floor(containerWidth / (fontSize * 0.45));
  const lines = Math.ceil(charCount / charsPerLine);
  return lines * fontSize * 1.5;
}

/**
 * Clamps a multiplier to a safe range.
 */
function clamp(val: number, min = 0.7, max = 1.4): number {
  return Math.min(max, Math.max(min, val));
}

/**
 * Calculates multiplier from fill ratio.
 * < 0.6 fill → expand (up to 1.4x)
 * 0.6-0.9 fill → normal (1.0x)
 * > 0.9 fill → compress (down to 0.7x)
 */
function fillToMultiplier(fillRatio: number): number {
  if (fillRatio < 0.6) return clamp(1.0 + (0.6 - fillRatio));
  if (fillRatio > 0.9) return clamp(1.0 - (fillRatio - 0.9) * 2);
  return 1.0;
}

/**
 * Pre-analyzes content density and returns per-page layout adjustments.
 * Call this BEFORE rendering the PDF component.
 */
export function calculatePdfLayout(input: CalculateLayoutInput): PdfLayoutResult {
  const {
    hasMap,
    einheitenCount,
    handlungsschritteCount,
    chancenCount,
    risikenCount,
    begruendungLength,
    fazitLength,
    hasMarktdaten,
    hasPotenzialaufdeckung,
    hasWeg,
    hasMod559,
    hasZinsaenderung,
  } = input;

  // ─── COVER PAGE ───
  let coverHeight = 160; // header: logo + title + subtitle
  if (hasMap) coverHeight += 200; // map image
  coverHeight += 120; // objekt info box
  coverHeight += 60;  // mandant + date row

  const coverFill = coverHeight / COVER_USABLE_HEIGHT;
  const coverDeficit = Math.max(0, COVER_USABLE_HEIGHT - coverHeight);

  let mapHeight = hasMap ? 200 : 0;
  let headerBottomPadding = 35;
  let objektBoxPadding = 20;
  let contentTopPadding = 30;

  if (coverFill < 0.7) {
    if (!hasMap) {
      // No map — distribute extra space
      headerBottomPadding = Math.round(35 + Math.min(coverDeficit * 0.25, 55));
      objektBoxPadding = Math.round(20 + Math.min(coverDeficit * 0.15, 25));
      contentTopPadding = Math.round(30 + Math.min(coverDeficit * 0.15, 30));
    } else {
      // Has map but still sparse — expand map and spacing
      mapHeight = Math.round(Math.min(280, 200 + coverDeficit * 0.35));
      headerBottomPadding = Math.round(35 + Math.min(coverDeficit * 0.1, 20));
      contentTopPadding = Math.round(30 + Math.min(coverDeficit * 0.1, 20));
    }
  }

  const cover: CoverLayoutAdjustment = {
    spacingMultiplier: 1,
    paddingMultiplier: 1,
    chartHeightMultiplier: 1,
    mapHeight,
    objektBoxPadding,
    headerBottomPadding,
    contentTopPadding,
  };

  // ─── STECKBRIEF PAGE ───
  let steckbriefHeight = 30 + 130; // title row + Objektsteckbrief table
  if (hasPotenzialaufdeckung) steckbriefHeight += 85;
  steckbriefHeight += 55;  // metrics bar
  steckbriefHeight += 45;  // Beleihungswert
  if (hasMarktdaten) steckbriefHeight += 85;

  const steckbriefFill = steckbriefHeight / USABLE_HEIGHT;
  const steckbrief: PageLayoutAdjustment = {
    spacingMultiplier: fillToMultiplier(steckbriefFill),
    paddingMultiplier: fillToMultiplier(steckbriefFill),
    chartHeightMultiplier: 1,
  };

  // ─── FINANCE/ERTRAG PAGE (2x2 grid) ───
  // Side-by-side sections: take max height of each row
  let financeRow1 = Math.max(180, hasZinsaenderung ? 250 : 180); // Finanzierung (+ Zinsaenderung)
  let financeRow2 = Math.max(170, 190); // Cashflow / Kosten
  let financeHeight = financeRow1 + financeRow2 + 12; // + gaps

  const financeFill = financeHeight / USABLE_HEIGHT;
  const finanzErtrag: PageLayoutAdjustment = {
    spacingMultiplier: fillToMultiplier(financeFill),
    paddingMultiplier: fillToMultiplier(financeFill),
    chartHeightMultiplier: 1,
  };

  // ─── MIETERHOHUNG PAGE ───
  let mietHeight = 30 + 22; // header + table header
  mietHeight += einheitenCount * 18; // data rows
  mietHeight += 22; // footer row
  mietHeight += 70; // §558 hint box
  mietHeight += 50; // Mietvertragsart hint

  const mietFill = mietHeight / USABLE_HEIGHT;

  // Adaptive table sizing based on unit count
  let tableFontSize = 8;
  let tableRowPaddingV = 4;
  if (einheitenCount > 25) {
    tableFontSize = 6;
    tableRowPaddingV = 2;
  } else if (einheitenCount > 15) {
    tableFontSize = 7;
    tableRowPaddingV = 3;
  } else if (einheitenCount <= 5) {
    tableFontSize = 9;
    tableRowPaddingV = 6;
  }

  const mieterhohung: MieterhohungLayoutAdjustment = {
    spacingMultiplier: fillToMultiplier(mietFill),
    paddingMultiplier: fillToMultiplier(mietFill),
    chartHeightMultiplier: 1,
    tableFontSize,
    tableRowPaddingV,
  };

  // ─── CHARTS PAGE (2x2 grid) ───
  const chartsRow1 = 180; // Cashflow chart / Wertentwicklung
  const chartsRow2 = 165; // CAPEX / WEG
  const chartsHeight = chartsRow1 + chartsRow2 + 12;

  const chartsFill = chartsHeight / USABLE_HEIGHT;
  const charts: PageLayoutAdjustment = {
    spacingMultiplier: fillToMultiplier(chartsFill),
    paddingMultiplier: fillToMultiplier(chartsFill),
    chartHeightMultiplier: clamp(1.0 / chartsFill, 0.85, 1.3),
  };

  // ─── AFA/ROI/EXIT PAGE ───
  const afaRow1 = 190; // AfA / ROI
  const exitSection = 180; // Exit chart
  const investmentDash = 120; // Investment overview
  const afaHeight = afaRow1 + exitSection + investmentDash + 18;

  const afaFill = afaHeight / USABLE_HEIGHT;
  const afaRoiExit: PageLayoutAdjustment = {
    spacingMultiplier: fillToMultiplier(afaFill),
    paddingMultiplier: fillToMultiplier(afaFill),
    chartHeightMultiplier: clamp(1.0 / afaFill, 0.85, 1.25),
  };

  // ─── EMPFEHLUNG PAGE ───
  let empfehlungHeight = 140; // Zusammenfassung box
  empfehlungHeight += 60;     // Empfehlung badge
  if (begruendungLength > 0) {
    empfehlungHeight += 30 + estimateTextHeight(begruendungLength);
  }
  empfehlungHeight += handlungsschritteCount * 30 + 25; // steps
  if (chancenCount > 0 || risikenCount > 0) {
    empfehlungHeight += 40 + Math.max(chancenCount, risikenCount) * 16;
  }
  if (fazitLength > 0) {
    empfehlungHeight += 40 + estimateTextHeight(fazitLength);
  }

  const empfehlungFill = empfehlungHeight / USABLE_HEIGHT;
  const empfehlung: PageLayoutAdjustment = {
    spacingMultiplier: fillToMultiplier(empfehlungFill),
    paddingMultiplier: fillToMultiplier(empfehlungFill),
    chartHeightMultiplier: 1,
  };

  // ─── ERLAEUTERUNGEN PAGE ───
  const erlaeuterungenHeight = 30 + 6 * 55 + 120; // title + 6 sections + disclaimer
  const erlaeuterungenFill = erlaeuterungenHeight / USABLE_HEIGHT;
  const erlaeuterungen: PageLayoutAdjustment = {
    spacingMultiplier: fillToMultiplier(erlaeuterungenFill),
    paddingMultiplier: fillToMultiplier(erlaeuterungenFill),
    chartHeightMultiplier: 1,
  };

  const result: PdfLayoutResult = {
    cover,
    steckbrief,
    finanzErtrag,
    mieterhohung,
    charts,
    afaRoiExit,
    empfehlung,
    erlaeuterungen,
  };

  console.log('[PDF Layout] Fill ratios:', {
    cover: Math.round(coverFill * 100) + '%',
    steckbrief: Math.round(steckbriefFill * 100) + '%',
    finanzErtrag: Math.round(financeFill * 100) + '%',
    mieterhohung: Math.round(mietFill * 100) + '%',
    charts: Math.round(chartsFill * 100) + '%',
    afaRoiExit: Math.round(afaFill * 100) + '%',
    empfehlung: Math.round(empfehlungFill * 100) + '%',
    erlaeuterungen: Math.round(erlaeuterungenFill * 100) + '%',
  });

  return result;
}
