import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
  Svg,
  Path,
  Circle,
  Line,
  G,
} from '@react-pdf/renderer';
import type { Berechnungen, PdfConfig, PdfSectionId } from '@/lib/types';
import { DEFAULT_PDF_SECTIONS } from '@/lib/types';
import { getZinsaenderungHinweis, getMietvertragsartZusammenfassung, MIETVERTRAGSART_HINWEISE } from '@/lib/erlaeuterungen';

// ─── Font: Helvetica (PDF-Builtin, kein externes Font-Loading nötig) ───
// Hyphenation callback to prevent word-break issues in German text
Font.registerHyphenationCallback((word) => [word]);

// =====================================================
// GRAFISCHE KOMPONENTEN
// =====================================================

// Fortschrittsbalken
const ProgressBar = ({
  value,
  max = 100,
  color = '#2a4a6a', // Growth Blue
  bgColor = '#c8d6e5', // Blue Bone border
  height = 8,
  showLabel = true,
}: {
  value: number;
  max?: number;
  color?: string;
  bgColor?: string;
  height?: number;
  showLabel?: boolean;
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <View style={{
        flex: 1,
        height,
        backgroundColor: bgColor,
        borderRadius: height / 2,
        overflow: 'hidden',
      }}>
        <View style={{
          width: `${percentage}%`,
          height: '100%',
          backgroundColor: color,
          borderRadius: height / 2,
        }} />
      </View>
      {showLabel && (
        <Text style={{ fontSize: 8, color: '#2a4a6a', width: 30, textAlign: 'right' }}>
          {percentage.toFixed(0)}%
        </Text>
      )}
    </View>
  );
};

// Vergleichsbalken (IST vs SOLL)
const ComparisonBar = ({
  ist,
  soll,
  label,
  colorIst = '#9eb3c8', // Blue Bone lighter
  colorSoll = '#16a34a',
}: {
  ist: number;
  soll: number;
  label: string;
  colorIst?: string;
  colorSoll?: string;
}) => {
  const max = Math.max(ist, soll);
  const istWidth = max > 0 ? (ist / max) * 100 : 0;
  const sollWidth = max > 0 ? (soll / max) * 100 : 0;
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={{ fontSize: 7, color: '#2a4a6a', marginBottom: 3 }}>{label}</Text>
      <View style={{ gap: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={{ fontSize: 6, color: '#9eb3c8', width: 20 }}>IST</Text>
          <View style={{ flex: 1, height: 6, backgroundColor: colors.neutralBg, borderRadius: 3 }}>
            <View style={{ width: `${istWidth}%`, height: '100%', backgroundColor: colorIst, borderRadius: 3 }} />
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={{ fontSize: 6, color: '#16a34a', width: 20 }}>SOLL</Text>
          <View style={{ flex: 1, height: 6, backgroundColor: colors.neutralBg, borderRadius: 3 }}>
            <View style={{ width: `${sollWidth}%`, height: '100%', backgroundColor: colorSoll, borderRadius: 3 }} />
          </View>
        </View>
      </View>
    </View>
  );
};

// Ampel-Indikator (Rot/Gelb/Grün)
const TrafficLight = ({
  status
}: {
  status: 'green' | 'yellow' | 'red'
}) => {
  const getColor = () => {
    switch(status) {
      case 'green': return '#16a34a';
      case 'yellow': return '#eab308';
      case 'red': return '#dc2626';
    }
  };
  return (
    <View style={{
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: getColor(),
      borderWidth: 2,
      borderColor: 'white',
    }} />
  );
};



// Trend-Pfeil
const TrendArrow = ({
  value,
  showValue = true,
}: {
  value: number;
  showValue?: boolean;
}) => {
  const direction = value > 0.5 ? 'up' : value < -0.5 ? 'down' : 'stable';
  const arrowColor = direction === 'up' ? '#16a34a' : direction === 'down' ? '#dc2626' : '#9eb3c8';
  const symbol = direction === 'up' ? '▲' : direction === 'down' ? '▼' : '●';
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
      <Text style={{ fontSize: 8, color: arrowColor }}>{symbol}</Text>
      {showValue && (
        <Text style={{ fontSize: 7, fontWeight: 'bold', color: arrowColor }}>
          {value > 0 ? '+' : ''}{value.toFixed(1)}%
        </Text>
      )}
    </View>
  );
};

// Color constants - Dark Royal Navy Design
// Imperoyal Brand Colors: Royal Navy (Haupt), Dark Blue (Sekundär), Blue Bone (Tertiär)
const colors = {
  // Brand Primary - Royal Navy (dunkles Markenblau)
  primary: '#1a2744',
  // Brand Secondary - Dark Growth Blue (kräftiger)
  primaryLight: '#2a4a6a',
  // Brand Tertiary - Blue Bone
  blueBone: '#9eb3c8',
  // Text colors
  text: '#1a2744',           // Royal Navy
  textMuted: '#2a4a6a',      // Dark Growth Blue (kräftiger)
  textLight: '#9eb3c8',      // Blue Bone
  // Status colors – EINE Variante pro Farbe
  success: '#16a34a',        // Grün (green-600)
  successBg: '#f0fdf4',      // Tint Positiv
  danger: '#dc2626',         // Rot (red-600)
  dangerBg: '#fef2f2',       // Tint Negativ
  warning: '#d4a017',
  warningBg: '#fef9c3',
  // Accent - Royal Navy (kräftig)
  accent: '#1a2744',
  accentBg: '#f0f4f7',
  // Page & Card backgrounds
  pageBg: '#f8fafc',         // Page Background einheitlich
  cardWhite: '#ffffff',      // Karten/Boxen die sich abheben
  neutralBg: '#f0f4f7',      // Tint Neutral / Sekundär-BG
  // Borders and backgrounds - Kräftigere Blue Bone Töne
  border: '#dce8f0',
  borderLight: '#dce8f0',
  bgLight: '#f0f4f7',
  bgBlue: '#dce8f0',
  bgGreen: '#f0fdf4',        // Tint Positiv
  bgRed: '#fef2f2',          // Tint Negativ
};

// Styles - Liquid Glass Design
const styles = StyleSheet.create({
  page: {
    padding: 25,
    paddingTop: 55, // Reserve space for fixed header with logo
    paddingBottom: 45, // Reserve space for footer
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: colors.text,
    backgroundColor: colors.pageBg,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  headerLeft: {},
  headerRight: {
    textAlign: 'right',
  },
  date: {
    fontSize: 10,
    color: colors.textMuted,
  },
  mainTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 700,
    color: colors.primary,
    marginTop: 2,
  },
  objektInfo: {
    textAlign: 'right',
  },
  objektLabel: {
    fontSize: 8,
    color: colors.textMuted,
  },
  objektAddress: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.text,
  },
  // Key Metrics Bar
  metricsBar: {
    flexDirection: 'row',
    backgroundColor: colors.neutralBg,
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricItem: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  metricItemLast: {
    borderRightWidth: 0,
  },
  metricLabel: {
    fontSize: 8,
    color: colors.textMuted,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text,
  },
  metricValueGreen: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.success,
  },
  metricValueRed: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.danger,
  },
  empfehlungBadge: {
    backgroundColor: colors.primary,
    color: 'white',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 3,
    fontSize: 7,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // Sections
  sectionRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
    minPresenceAhead: 40,
  },
  sectionBox: {
    flex: 1,
    backgroundColor: colors.pageBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    minPresenceAhead: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralBg,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionNumber: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primaryLight,
    color: 'white',
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 18,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 700,
    color: colors.primary,
  },
  sectionBadge: {
    marginLeft: 'auto',
    backgroundColor: colors.success,
    color: 'white',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    fontSize: 7,
  },
  sectionContent: {
    padding: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowTotal: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 5,
    paddingTop: 5,
  },
  label: {
    color: colors.textMuted,
    fontSize: 9,
  },
  value: {
    fontWeight: 'bold',
    fontSize: 9,
    textAlign: 'right',
  },
  valueGreen: {
    fontWeight: 'bold',
    fontSize: 9,
    color: colors.success,
    textAlign: 'right',
  },
  valueRed: {
    fontWeight: 'bold',
    fontSize: 9,
    color: colors.danger,
    textAlign: 'right',
  },
  // Table - Liquid Glass Style
  table: {
    marginTop: 5,
    borderRadius: 4,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.neutralBg,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableHeaderCell: {
    fontSize: 7,
    fontWeight: 'bold',
    color: colors.textMuted,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.pageBg,
  },
  tableRowAlt: {
    backgroundColor: colors.neutralBg,
  },
  tableCell: {
    fontSize: 8,
    textAlign: 'center',
  },
  tableCellLeft: {
    textAlign: 'left',
  },
  tableCellRight: {
    textAlign: 'right',
  },
  tableFooter: {
    flexDirection: 'row',
    backgroundColor: colors.neutralBg,
    paddingVertical: 6,
    paddingHorizontal: 4,
    fontWeight: 'bold',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  // Info boxes
  infoBox: {
    backgroundColor: colors.neutralBg,
    padding: 8,
    borderRadius: 6,
    marginTop: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoBoxTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: colors.textMuted,
    marginBottom: 3,
  },
  infoBoxText: {
    fontSize: 7,
    color: colors.textMuted,
    lineHeight: 1.4,
  },
  // Empfehlung page
  empfehlungContainer: {
    backgroundColor: colors.neutralBg,
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  empfehlungHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  empfehlungType: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 700,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 15,
  },
  empfehlungText: {
    fontSize: 10,
    color: colors.text,
    lineHeight: 1.6,
    backgroundColor: colors.pageBg,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  handlungsschritte: {
    marginTop: 15,
  },
  handlungsschrittItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    backgroundColor: colors.pageBg,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  handlungsschrittNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primaryLight,
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 22,
    marginRight: 10,
  },
  handlungsschrittText: {
    flex: 1,
    fontSize: 9,
    color: colors.text,
  },
  handlungsschrittTime: {
    fontSize: 8,
    color: colors.success,
    fontWeight: 'bold',
  },
  fazitBox: {
    backgroundColor: colors.pageBg,
    padding: 14,
    borderRadius: 8,
    marginTop: 15,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    borderLeftColor: colors.primaryLight,
  },
  fazitLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 5,
  },
  fazitText: {
    fontSize: 9,
    color: colors.text,
    lineHeight: 1.5,
  },
  disclaimer: {
    backgroundColor: colors.warningBg,
    padding: 12,
    borderRadius: 6,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#e0d4a8',
  },
  disclaimerText: {
    fontSize: 7,
    color: colors.warning,
    textAlign: 'center',
  },
  // Footer - fixed at bottom of each page
  footer: {
    position: 'absolute',
    bottom: 15,
    left: 25,
    right: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: colors.textLight,
  },
  footerCenter: {
    fontSize: 7,
    color: colors.textLight,
  },
  // Kostenquote badge
  kostenquoteBadge: {
    textAlign: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginTop: 5,
    fontSize: 8,
    fontWeight: 'bold',
  },
});

// Helper functions
const formatCurrency = (val: number | null | undefined): string =>
  val == null
    ? '-'
    : new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
      }).format(val);

const formatCurrencyShort = (val: number | null | undefined): string => {
  if (val == null) return '-';
  if (val >= 1000000) return `${(val / 1000000).toFixed(2)}M`;
  if (val >= 1000) return `${(val / 1000).toFixed(0)}k €`;
  return formatCurrency(val);
};

const formatPercent = (val: number | null | undefined, digits = 2): string =>
  val != null ? `${val.toFixed(digits)}%` : '-';

// Style multipliers for AI-driven optimization
export interface StyleMultipliers {
  spacingMultiplier: number;
  fontSizeMultiplier: number;
  paddingMultiplier: number;
  chartHeightMultiplier: number;
}

interface AuswertungPDFProps {
  objekt: {
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
  mandant: {
    name: string;
    anrede?: 'Herr' | 'Frau' | null;
    ansprechpartner?: string | null;
  };
  einheiten?: Array<{
    position: number;
    nutzung: string;
    flaeche: number | null;
    kaltmiete: number | null;
    vergleichsmiete: number;
    mietvertragsart: string;
  }>;
  berechnungen: Berechnungen;
  empfehlung?: string;
  empfehlung_begruendung?: string;
  empfehlung_prioritaet?: string;
  empfehlung_handlungsschritte?: Array<{ schritt: string; zeitrahmen: string }> | string[];
  empfehlung_chancen?: string[];
  empfehlung_risiken?: string[];
  empfehlung_fazit?: string;
  created_at: string;
  logoUrl?: string;
  mapUrl?: string;
  // Optional AI-driven style adjustments
  styleMultipliers?: StyleMultipliers;
  // PDF section config for visibility and ordering
  pdfConfig?: PdfConfig;
}

export function AuswertungPDF({
  objekt,
  mandant,
  einheiten,
  berechnungen,
  empfehlung,
  empfehlung_begruendung,
  empfehlung_prioritaet,
  empfehlung_handlungsschritte,
  empfehlung_chancen,
  empfehlung_risiken,
  empfehlung_fazit,
  created_at,
  logoUrl,
  mapUrl,
  styleMultipliers,
  pdfConfig,
}: AuswertungPDFProps) {
  // Apply style multipliers (defaults to 1 if not provided)
  const sm = styleMultipliers || {
    spacingMultiplier: 1,
    fontSizeMultiplier: 1,
    paddingMultiplier: 1,
    chartHeightMultiplier: 1,
  };
  const fin = berechnungen?.finanzierung;
  const kosten = berechnungen?.kostenstruktur;
  const cashflow = berechnungen?.cashflow;
  const rendite = berechnungen?.rendite;
  const miet = berechnungen?.mietanalyse;
  const weg = berechnungen?.weg_potenzial;
  const afa = berechnungen?.afa_rnd;
  const wert = berechnungen?.wertentwicklung;
  const mod559 = berechnungen?.modernisierung_559;
  const marktdaten = berechnungen?.marktdaten;

  const einheitenMitPotenzial = miet?.einheiten?.filter(e => e.potenzial > 0).length || 0;
  const einheitenGesamt = miet?.einheiten?.length || 0;
  const allEinheiten = miet?.einheiten || [];

  // Verkehrswert = Aktueller Marktwert der Immobilie
  // Berechnung: Jahresmiete × Kaufpreisfaktor (Ertragswertverfahren)
  // oder Kaufpreis × Wertsteigerung seit Kauf (2,5% p.a.)
  const jahresmiete = miet?.miete_ist_jahr || 0;
  const kaufpreisfaktor = marktdaten?.kaufpreisfaktor_region?.wert || 20;
  const kaufpreis = fin?.kaufpreis || objekt.kaufpreis || 0;

  // Verkehrswert über Ertragswertverfahren (Marktmiete × Faktor)
  const verkehrswertErtrag = jahresmiete > 0 ? jahresmiete * kaufpreisfaktor : kaufpreis;
  // Wir nehmen den konservativeren Wert (heute = Kaufpreis, da keine Zeitangabe seit Kauf)
  const verkehrswertGeschaetzt = wert?.heute || verkehrswertErtrag || kaufpreis;

  // Restschuld = Fremdkapital (vereinfacht, ohne Tilgungsfortschritt)
  const restschuld = fin?.fremdkapital || 0;

  // Abbezahlte Summe = Eigenkapitaleinsatz = Verkehrswert - Restschuld
  // Dies ist der Teil des Objektwerts, der bereits "abbezahlt" ist
  const abbezahlteSumme = Math.max(0, verkehrswertGeschaetzt - restschuld);

  // Beleihungswert = 60-80% der abbezahlten Summe (= verfügbare Sicherheit für Refinanzierung)
  // Wir verwenden 70% als konservativen Mittelwert
  const beleihungswert = abbezahlteSumme * 0.7;

  // Eigenkapitalpuffer = Differenz Verkehrswert - Restschuld
  const eigenkapitalpuffer = abbezahlteSumme;

  // Rendite nach Steuervorteil (AfA-Effekt einrechnen)
  const steuerersparnis = afa?.steuerersparnis_42 || 0;
  const rendite_nach_steuer = fin?.kaufpreis && fin.kaufpreis > 0
    ? ((miet?.miete_ist_jahr || 0) + steuerersparnis) / fin.kaufpreis * 100
    : 0;

  // Gesamtfläche berechnen
  const gesamtflaeche = einheiten?.reduce((sum, e) => sum + (e.flaeche || 0), 0) || 0;
  const verkehrswertProQm = gesamtflaeche > 0 ? verkehrswertGeschaetzt / gesamtflaeche : 0;

  // PDF Section visibility helper
  const isVisible = (id: PdfSectionId): boolean => {
    if (!pdfConfig?.sections) return true;
    const section = pdfConfig.sections.find(s => s.id === id);
    return section ? section.visible : true;
  };

  const getOrder = (id: PdfSectionId): number => {
    if (!pdfConfig?.sections) return DEFAULT_PDF_SECTIONS.findIndex(s => s.id === id);
    const section = pdfConfig.sections.find(s => s.id === id);
    return section ? section.order : 999;
  };

  const getMinOrder = (ids: PdfSectionId[]): number => {
    return Math.min(...ids.map(id => getOrder(id)));
  };

  return (
    <Document>
      {/* ==================== DECKBLATT ==================== */}
      <Page size="A4" style={{
        padding: 0,
        fontFamily: 'Helvetica',
        backgroundColor: colors.pageBg,
      }}>
        {/* Heller Header-Bereich */}
        <View style={{
          backgroundColor: '#ffffff',
          paddingTop: 50,
          paddingBottom: 35,
          paddingHorizontal: 50,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}>
          {/* Logo */}
          <View style={{ marginBottom: 30 }}>
            {logoUrl ? (
              <Image src={logoUrl} style={{ width: 180, height: 45, objectFit: 'contain' }} />
            ) : (
              <Text style={{ fontSize: 22, fontFamily: 'Helvetica-Bold', color: colors.primary, letterSpacing: 1 }}>
                Imperoyal Immobilien
              </Text>
            )}
          </View>

          {/* Haupttitel */}
          <Text style={{
            fontSize: 28,
            fontFamily: 'Helvetica-Bold',
            color: colors.primary,
            letterSpacing: 1.5,
            marginBottom: 6,
          }}>
            Optimierungsprotokoll
          </Text>
          <View style={{ width: 60, height: 2, backgroundColor: colors.primary, marginBottom: 16 }} />
          <Text style={{ fontSize: 11, color: colors.textMuted, lineHeight: 1.5 }}>
            Immobilien-Analyse und Handlungsempfehlung
          </Text>
        </View>

        {/* Karte */}
        {mapUrl && (
          <View style={{ position: 'relative', width: '100%', height: 200 }}>
            <Image
              src={mapUrl}
              style={{ width: '100%', height: 200, objectFit: 'cover' }}
            />
            {/* Fadenkreuz */}
            <Svg
              viewBox="0 0 500 200"
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 200 }}
            >
              <Circle cx="250" cy="100" r="6" fill="none" stroke="#cc0000" strokeWidth="1" />
              <Line x1="238" y1="100" x2="262" y2="100" stroke="#cc0000" strokeWidth="1" />
              <Line x1="250" y1="88" x2="250" y2="112" stroke="#cc0000" strokeWidth="1" />
            </Svg>
            {/* Nordpfeil */}
            <View style={{ position: 'absolute', top: 8, right: 10, alignItems: 'center', width: 20 }}>
              <Text style={{ fontSize: 12, color: '#333', marginBottom: -2 }}>↑</Text>
              <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#333' }}>N</Text>
            </View>
            {/* Maßstab */}
            <View style={{ position: 'absolute', bottom: 8, right: 10, backgroundColor: '#ffffffdd', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 2 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 5.5, color: '#333', marginRight: 3 }}>0</Text>
                <View style={{ flexDirection: 'row', marginBottom: 1 }}>
                  <View style={{ width: 36, height: 4, backgroundColor: '#333' }} />
                  <View style={{ width: 36, height: 4, backgroundColor: '#fff', borderWidth: 0.5, borderColor: '#333' }} />
                </View>
                <Text style={{ fontSize: 5.5, color: '#333', marginLeft: 3 }}>25 m</Text>
              </View>
            </View>
            {/* Copyright */}
            <View style={{ position: 'absolute', bottom: 3, left: 3, backgroundColor: '#ffffffcc', paddingHorizontal: 4, paddingVertical: 1.5 }}>
              <Text style={{ fontSize: 5, color: '#555' }}>
                © Bundesamt für Kartographie und Geodäsie {new Date().getFullYear()}
              </Text>
            </View>
          </View>
        )}

        {/* Objekt- und Mandanteninfos */}
        <View style={{ paddingHorizontal: 50, paddingTop: 30 }}>
          {/* Objektdaten */}
          <View style={{
            backgroundColor: colors.cardWhite,
            borderRadius: 6,
            padding: 20,
            marginBottom: 20,
            borderLeftWidth: 4,
            borderLeftColor: colors.primary,
          }}>
            <Text style={{ fontSize: 8, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              Objekt
            </Text>
            <Text style={{ fontSize: 18, fontFamily: 'Helvetica-Bold', color: colors.primary, marginBottom: 4 }}>
              {objekt.strasse}
            </Text>
            <Text style={{ fontSize: 14, color: colors.text }}>
              {objekt.plz} {objekt.ort}
            </Text>
            <View style={{ flexDirection: 'row', marginTop: 12, gap: 20 }}>
              {objekt.gebaeudetyp && (
                <View>
                  <Text style={{ fontSize: 7, color: colors.textMuted }}>Typ</Text>
                  <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: colors.text }}>{objekt.gebaeudetyp}</Text>
                </View>
              )}
              {objekt.baujahr && (
                <View>
                  <Text style={{ fontSize: 7, color: colors.textMuted }}>Baujahr</Text>
                  <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: colors.text }}>{objekt.baujahr}</Text>
                </View>
              )}
              {einheitenGesamt > 0 && (
                <View>
                  <Text style={{ fontSize: 7, color: colors.textMuted }}>Einheiten</Text>
                  <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: colors.text }}>{einheitenGesamt}</Text>
                </View>
              )}
              {gesamtflaeche > 0 && (
                <View>
                  <Text style={{ fontSize: 7, color: colors.textMuted }}>Gesamtfläche</Text>
                  <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: colors.text }}>{gesamtflaeche.toLocaleString('de-DE')} m²</Text>
                </View>
              )}
              {kaufpreis > 0 && (
                <View>
                  <Text style={{ fontSize: 7, color: colors.textMuted }}>Kaufpreis</Text>
                  <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: colors.text }}>{formatCurrency(kaufpreis)}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Mandant und Datum */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ fontSize: 8, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                Erstellt für
              </Text>
              <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', color: colors.text }}>
                {mandant.name}
              </Text>
              {mandant.ansprechpartner && (
                <Text style={{ fontSize: 9, color: colors.textMuted, marginTop: 2 }}>
                  z.Hd. {mandant.anrede ? `${mandant.anrede} ` : ''}{mandant.ansprechpartner}
                </Text>
              )}
            </View>
            <View style={{ textAlign: 'right' }}>
              <Text style={{ fontSize: 8, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                Datum
              </Text>
              <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', color: colors.text }}>
                {new Date(created_at).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer auf Deckblatt */}
        <View style={{
          position: 'absolute',
          bottom: 25,
          left: 50,
          right: 50,
          borderTopWidth: 1,
          borderTopColor: colors.borderLight,
          paddingTop: 8,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
          <Text style={{ fontSize: 7, color: colors.textLight }}>
            Imperoyal Immobilien · Vertraulich
          </Text>
          <Text style={{ fontSize: 7, color: colors.textLight }}>
            Seite 1
          </Text>
        </View>
      </Page>

      {/* ==================== PAGE 1 (Analyse) ==================== */}
      {isVisible('steckbrief') && (
      <Page size="A4" style={styles.page}>
        {/* Fixed Header mit zentriertem Logo - erscheint auf jeder Seite */}
        <View fixed style={{
          position: 'absolute',
          top: 12,
          left: 25,
          right: 25,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          paddingBottom: 6,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}>
          {logoUrl ? (
            <Image src={logoUrl} style={{ width: 120, height: 30, objectFit: 'contain' }} />
          ) : (
            <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', color: colors.primary }}>Imperoyal Immobilien</Text>
          )}
        </View>

        {/* Objekt-Info unter dem fixed Header (nur auf erster Seite) */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.primary, fontFamily: 'Helvetica-Bold' }}>Optimierungsprotokoll</Text>
          <View style={{ textAlign: 'right' }}>
            <Text style={styles.objektLabel}>Objekt</Text>
            <Text style={styles.objektAddress}>{objekt.strasse}</Text>
            <Text style={styles.objektAddress}>{objekt.plz} {objekt.ort}</Text>
          </View>
        </View>

        {/* ─── EXPOSÉ: Objektsteckbrief ─── */}
        <View style={{
          backgroundColor: colors.cardWhite,
          borderRadius: 6,
          padding: 10 * sm.paddingMultiplier,
          marginBottom: 8 * sm.spacingMultiplier,
          borderWidth: 1,
          borderColor: colors.border,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 * sm.spacingMultiplier, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 6 }}>
            <Text style={{ fontSize: 11 * sm.fontSizeMultiplier, fontWeight: 'bold', color: colors.primary, fontFamily: 'Helvetica-Bold' }}>
              Objektsteckbrief
            </Text>
            <Text style={{ fontSize: 7, color: colors.textLight, marginLeft: 'auto' }}>
              {objekt.gebaeudetyp || 'Immobilie'} · {objekt.strasse}, {objekt.plz} {objekt.ort}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            {/* Spalte 1: Grunddaten */}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 7, fontWeight: 'bold', color: colors.primaryLight, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Grunddaten
              </Text>
              {objekt.gebaeudetyp && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                  <Text style={{ fontSize: 7, color: colors.textMuted }}>Gebäudetyp</Text>
                  <Text style={{ fontSize: 7, fontWeight: 'bold', color: colors.text }}>{objekt.gebaeudetyp}</Text>
                </View>
              )}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                <Text style={{ fontSize: 7, color: colors.textMuted }}>Baujahr</Text>
                <Text style={{ fontSize: 7, fontWeight: 'bold', color: colors.text }}>{objekt.baujahr || '–'}</Text>
              </View>
              {objekt.kernsanierung_jahr && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                  <Text style={{ fontSize: 7, color: colors.textMuted }}>Kernsanierung</Text>
                  <Text style={{ fontSize: 7, fontWeight: 'bold', color: colors.success }}>{objekt.kernsanierung_jahr}</Text>
                </View>
              )}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                <Text style={{ fontSize: 7, color: colors.textMuted }}>Geschosse</Text>
                <Text style={{ fontSize: 7, fontWeight: 'bold', color: colors.text }}>{objekt.geschosse || '–'}</Text>
              </View>
              {objekt.heizungsart && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                  <Text style={{ fontSize: 7, color: colors.textMuted }}>Heizung</Text>
                  <Text style={{ fontSize: 7, fontWeight: 'bold', color: colors.text }}>{objekt.heizungsart}</Text>
                </View>
              )}
              {objekt.aufzug != null && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                  <Text style={{ fontSize: 7, color: colors.textMuted }}>Aufzug</Text>
                  <Text style={{ fontSize: 7, fontWeight: 'bold', color: objekt.aufzug ? colors.success : colors.textMuted }}>{objekt.aufzug ? 'Ja' : 'Nein'}</Text>
                </View>
              )}
            </View>

            {/* Spalte 2: Flächen & Einheiten */}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 7, fontWeight: 'bold', color: colors.primaryLight, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Flächen & Einheiten
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                <Text style={{ fontSize: 7, color: colors.textMuted }}>Grundstücksfläche</Text>
                <Text style={{ fontSize: 7, fontWeight: 'bold', color: colors.text }}>
                  {objekt.grundstueck ? `${Number(objekt.grundstueck).toLocaleString('de-DE')} m²` : '–'}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                <Text style={{ fontSize: 7, color: colors.textMuted }}>Wohnfläche</Text>
                <Text style={{ fontSize: 7, fontWeight: 'bold', color: colors.text }}>
                  {objekt.wohnflaeche ? `${Number(objekt.wohnflaeche).toLocaleString('de-DE')} m²` : '–'}
                </Text>
              </View>
              {(objekt.gewerbeflaeche && Number(objekt.gewerbeflaeche) > 0) && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                  <Text style={{ fontSize: 7, color: colors.textMuted }}>Gewerbefläche</Text>
                  <Text style={{ fontSize: 7, fontWeight: 'bold', color: colors.text }}>
                    {Number(objekt.gewerbeflaeche).toLocaleString('de-DE')} m²
                  </Text>
                </View>
              )}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                <Text style={{ fontSize: 7, color: colors.textMuted }}>Gesamtfläche</Text>
                <Text style={{ fontSize: 7, fontWeight: 'bold', color: colors.primary }}>
                  {gesamtflaeche > 0 ? `${gesamtflaeche.toLocaleString('de-DE')} m²` : '–'}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                <Text style={{ fontSize: 7, color: colors.textMuted }}>Wohneinheiten</Text>
                <Text style={{ fontSize: 7, fontWeight: 'bold', color: colors.text }}>{objekt.wohneinheiten || '–'}</Text>
              </View>
              {(objekt.gewerbeeinheiten && objekt.gewerbeeinheiten > 0) && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                  <Text style={{ fontSize: 7, color: colors.textMuted }}>Gewerbeeinheiten</Text>
                  <Text style={{ fontSize: 7, fontWeight: 'bold', color: colors.text }}>{objekt.gewerbeeinheiten}</Text>
                </View>
              )}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                <Text style={{ fontSize: 7, color: colors.textMuted }}>Einheiten gesamt</Text>
                <Text style={{ fontSize: 7, fontWeight: 'bold', color: colors.primary }}>{einheitenGesamt}</Text>
              </View>
            </View>

            {/* Spalte 3: Baulicher Zustand */}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 7, fontWeight: 'bold', color: colors.primaryLight, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Baulicher Zustand
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                <Text style={{ fontSize: 7, color: colors.textMuted }}>Alter</Text>
                <Text style={{ fontSize: 7, fontWeight: 'bold', color: colors.text }}>
                  {objekt.baujahr ? `${new Date().getFullYear() - objekt.baujahr} Jahre` : '–'}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                <Text style={{ fontSize: 7, color: colors.textMuted }}>Zustandsbewertung</Text>
                <Text style={{
                  fontSize: 7,
                  fontWeight: 'bold',
                  color: objekt.kernsanierung_jahr && (new Date().getFullYear() - objekt.kernsanierung_jahr) < 15
                    ? colors.success
                    : objekt.baujahr && (new Date().getFullYear() - objekt.baujahr) < 30
                      ? colors.primary
                      : '#f59e0b',
                }}>
                  {objekt.kernsanierung_jahr && (new Date().getFullYear() - objekt.kernsanierung_jahr) < 15
                    ? 'Saniert'
                    : objekt.baujahr && (new Date().getFullYear() - objekt.baujahr) < 30
                      ? 'Gut'
                      : objekt.baujahr && (new Date().getFullYear() - objekt.baujahr) < 60
                        ? 'Durchschnittlich'
                        : 'Modernisierungsbedarf'}
                </Text>
              </View>
              {objekt.denkmalschutz && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                  <Text style={{ fontSize: 7, color: colors.textMuted }}>Denkmalschutz</Text>
                  <Text style={{ fontSize: 7, fontWeight: 'bold', color: colors.success }}>Ja (erh. AfA)</Text>
                </View>
              )}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                <Text style={{ fontSize: 7, color: colors.textMuted }}>WEG aufgeteilt</Text>
                <Text style={{ fontSize: 7, fontWeight: 'bold', color: objekt.weg_aufgeteilt ? colors.success : colors.textMuted }}>
                  {objekt.weg_aufgeteilt ? 'Ja' : 'Nein'}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                <Text style={{ fontSize: 7, color: colors.textMuted }}>Milieuschutz</Text>
                <Text style={{ fontSize: 7, fontWeight: 'bold', color: objekt.milieuschutz ? '#dc2626' : colors.success }}>
                  {objekt.milieuschutz ? 'Ja' : 'Nein'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ─── EXPOSÉ: Potenzialaufdeckung ─── */}
        {(einheitenMitPotenzial > 0 || (weg && !objekt.weg_aufgeteilt) || (mod559?.umlage_nach_kappung && mod559.umlage_nach_kappung > 0)) && (
          <View style={{
            backgroundColor: colors.bgGreen,
            borderRadius: 6,
            padding: 10 * sm.paddingMultiplier,
            marginBottom: 8 * sm.spacingMultiplier,
            borderWidth: 1,
            borderColor: colors.border,
          }}>
            <Text style={{ fontSize: 11 * sm.fontSizeMultiplier, fontWeight: 'bold', color: colors.success, fontFamily: 'Helvetica-Bold', marginBottom: 6 }}>
              Potenzialaufdeckung
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {/* Mietpotenzial */}
              {einheitenMitPotenzial > 0 && (
                <View style={{ flex: 1, backgroundColor: colors.cardWhite, borderRadius: 4, padding: 8, borderWidth: 1, borderColor: colors.border }}>
                  <Text style={{ fontSize: 8, fontWeight: 'bold', color: colors.success, marginBottom: 4 }}>Mietoptimierung</Text>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.success, marginBottom: 2 }}>
                    +{formatCurrency((miet?.potenzial_jahr || 0))}/J.
                  </Text>
                  <Text style={{ fontSize: 7, color: colors.textMuted, marginBottom: 4 }}>
                    {einheitenMitPotenzial} von {einheitenGesamt} Einheiten unter Marktmiete
                  </Text>
                  <ProgressBar
                    value={einheitenMitPotenzial}
                    max={einheitenGesamt}
                    color={colors.success}
                    bgColor={colors.neutralBg}
                    height={6}
                  />
                </View>
              )}
              {/* WEG-Potenzial */}
              {weg && !objekt.weg_aufgeteilt && (
                <View style={{ flex: 1, backgroundColor: colors.cardWhite, borderRadius: 4, padding: 8, borderWidth: 1, borderColor: colors.border }}>
                  <Text style={{ fontSize: 8, fontWeight: 'bold', color: colors.success, marginBottom: 4 }}>WEG-Aufteilung</Text>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.success, marginBottom: 2 }}>
                    +{formatCurrency(weg.weg_gewinn || 0)}
                  </Text>
                  <Text style={{ fontSize: 7, color: colors.textMuted, marginBottom: 2 }}>
                    Wertzuwachs bei Aufteilung (+15%)
                  </Text>
                  <Text style={{ fontSize: 6, color: weg.genehmigung_erforderlich ? colors.danger : colors.success }}>
                    {weg.genehmigung_erforderlich ? '⚠ Genehmigungspflichtig (Milieu-/Umwandlungsschutz)' : '✓ Keine Genehmigungshürden'}
                  </Text>
                </View>
              )}
              {/* Modernisierungsumlage */}
              {mod559?.umlage_nach_kappung && mod559.umlage_nach_kappung > 0 && (
                <View style={{ flex: 1, backgroundColor: colors.cardWhite, borderRadius: 4, padding: 8, borderWidth: 1, borderColor: colors.border }}>
                  <Text style={{ fontSize: 8, fontWeight: 'bold', color: colors.success, marginBottom: 4 }}>§559 Modernisierung</Text>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.success, marginBottom: 2 }}>
                    +{formatCurrency(mod559.umlage_nach_kappung)}/J.
                  </Text>
                  <Text style={{ fontSize: 7, color: colors.textMuted }}>
                    Umlagefähige Mieterhöhung nach Mod.
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Key Metrics Bar - Erweitert mit Verkehrswert & AfA */}
        <View style={styles.metricsBar}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Verkehrswert*</Text>
            <Text style={styles.metricValue}>{formatCurrency(verkehrswertGeschaetzt)}</Text>
            <Text style={{ fontSize: 8, color: colors.primary, fontWeight: 'bold', marginTop: 2 }}>
              {gesamtflaeche > 0 ? `(${formatCurrency(verkehrswertProQm)}/m²)` : '-'}
            </Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>EK-Puffer</Text>
            <Text style={eigenkapitalpuffer >= 0 ? styles.metricValueGreen : styles.metricValueRed}>
              {formatCurrency(eigenkapitalpuffer)}
            </Text>
            <Text style={{ fontSize: 6, color: colors.textLight }}>Verkehrswert - Restschuld</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Rendite</Text>
            <Text style={styles.metricValue}>{formatPercent(rendite?.rendite_ist)}</Text>
            <Text style={{ fontSize: 6, color: colors.success }}>+{formatPercent(rendite_nach_steuer - (rendite?.rendite_ist || 0), 1)} n. AfA</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>AfA-Ersparnis</Text>
            <Text style={styles.metricValueGreen}>{formatCurrency(steuerersparnis)}/J.</Text>
            <Text style={{ fontSize: 6, color: colors.textLight }}>bei 42% Grenzsteuersatz</Text>
          </View>
          <View style={[styles.metricItem, styles.metricItemLast]}>
            <Text style={styles.metricLabel}>Empfehlung</Text>
            <Text style={styles.empfehlungBadge}>{empfehlung || '-'}</Text>
          </View>
        </View>

        {/* Beleihungswert-Info */}
        <View style={{
          flexDirection: 'row',
          backgroundColor: colors.neutralBg,
          borderRadius: 4,
          padding: 8 * sm.paddingMultiplier,
          marginBottom: 8 * sm.spacingMultiplier,
          alignItems: 'center',
        }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 8, color: colors.accent, fontWeight: 'bold' }}>Beleihungswert (70% d. Eigenkapitals)</Text>
            <Text style={{ fontSize: 11, color: colors.text, fontWeight: 'bold' }}>{formatCurrency(beleihungswert)}</Text>
          </View>
          <View style={{ flex: 2, paddingLeft: 10, borderLeftWidth: 1, borderLeftColor: colors.border }}>
            <Text style={{ fontSize: 7, color: colors.textMuted, lineHeight: 1.4 }}>
              Abbezahlte Summe (VW - Restschuld): {formatCurrency(abbezahlteSumme)}. Der Beleihungswert (60-80%, hier 70%)
              zeigt die verfügbare Sicherheit für Refinanzierungen.
            </Text>
            <Text style={{ fontSize: 6, color: colors.textLight, fontStyle: 'italic', marginTop: 2 }}>
              Quelle: Berechnung nach Bankenstandard (BelWertV)
            </Text>
          </View>
        </View>

        {/* Marktdaten Section */}
        {berechnungen?.marktdaten && (
          <View style={{
            backgroundColor: colors.neutralBg,
            borderRadius: 6,
            padding: 8,
            marginBottom: 10,
            borderWidth: 1,
            borderColor: colors.border,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#1a2744' }}>
                Aktuelle Marktdaten
              </Text>
              <Text style={{ fontSize: 7, color: '#2a4a6a', marginLeft: 'auto' }}>
                Standort: {berechnungen.marktdaten.standort}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {/* Spalte 1: Mieten & Faktoren */}
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                  <Text style={{ fontSize: 7, color: '#2a4a6a' }}>Vergleichsmiete Wohnen</Text>
                  <Text style={{ fontSize: 7, fontWeight: 'bold', color: '#1a2744' }}>
                    {berechnungen.marktdaten.vergleichsmiete_wohnen.wert} €/m²
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                  <Text style={{ fontSize: 7, color: '#2a4a6a' }}>Vergleichsmiete Gewerbe</Text>
                  <Text style={{ fontSize: 7, fontWeight: 'bold', color: '#1a2744' }}>
                    {berechnungen.marktdaten.vergleichsmiete_gewerbe.wert} €/m²
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                  <Text style={{ fontSize: 7, color: '#2a4a6a' }}>Kaufpreisfaktor Region</Text>
                  <Text style={{ fontSize: 7, fontWeight: 'bold', color: '#1a2744' }}>
                    {berechnungen.marktdaten.kaufpreisfaktor_region.wert}x
                  </Text>
                </View>
              </View>
              {/* Spalte 2: Rechtliches */}
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                  <Text style={{ fontSize: 7, color: '#2a4a6a' }}>Kappungsgrenze</Text>
                  <Text style={{
                    fontSize: 7,
                    fontWeight: 'bold',
                    color: berechnungen.marktdaten.kappungsgrenze.vorhanden ? '#dc2626' : '#16a34a'
                  }}>
                    {berechnungen.marktdaten.kappungsgrenze.prozent}% {berechnungen.marktdaten.kappungsgrenze.vorhanden ? '(angespannt)' : ''}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                  <Text style={{ fontSize: 7, color: '#2a4a6a' }}>Milieuschutz</Text>
                  <Text style={{
                    fontSize: 7,
                    fontWeight: 'bold',
                    color: berechnungen.marktdaten.milieuschutzgebiet.vorhanden ? '#dc2626' : '#16a34a'
                  }}>
                    {berechnungen.marktdaten.milieuschutzgebiet.vorhanden ? 'Ja' : 'Nein'}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                  <Text style={{ fontSize: 7, color: '#2a4a6a' }}>Akt. Bauzinsen</Text>
                  <Text style={{ fontSize: 7, fontWeight: 'bold', color: '#1a2744' }}>
                    {berechnungen.marktdaten.aktuelle_bauzinsen.wert}% ({berechnungen.marktdaten.aktuelle_bauzinsen.zinsbindung})
                  </Text>
                </View>
              </View>
              {/* Spalte 3: Prognose */}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 6, color: '#1a2744', fontWeight: 'bold', marginBottom: 2 }}>Preisprognose p.a.</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                  <Text style={{ fontSize: 7, color: '#2a4a6a' }}>0-3 Jahre</Text>
                  <TrendArrow value={berechnungen.marktdaten.preisprognose.kurz_0_3_jahre} />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                  <Text style={{ fontSize: 7, color: '#2a4a6a' }}>3-7 Jahre</Text>
                  <TrendArrow value={berechnungen.marktdaten.preisprognose.mittel_3_7_jahre} />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 7, color: '#2a4a6a' }}>7+ Jahre</Text>
                  <TrendArrow value={berechnungen.marktdaten.preisprognose.lang_7_plus_jahre} />
                </View>
              </View>
            </View>
            <Text style={{ fontSize: 6, color: '#2a4a6a', fontStyle: 'italic', marginTop: 6 }}>
              Quelle: Aktuelle Marktanalyse, Stand: {new Date(berechnungen.marktdaten.abfrage_datum).toLocaleDateString('de-DE')}
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Imperoyal Immobilien | Vertraulich</Text>
          <Text style={styles.footerCenter}>www.imperoyal-immobilien.de</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Seite ${pageNumber} von ${totalPages}`} />
        </View>
      </Page>
      )}

      {/* ==================== PAGE: Sektionen 1-4 ==================== */}
      {(isVisible('finanzierung') || isVisible('ertrag') || isVisible('cashflow') || isVisible('kosten')) && (
      <Page size="A4" style={styles.page}>
        {/* Fixed Header */}
        <View fixed style={{
          position: 'absolute',
          top: 12,
          left: 25,
          right: 25,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          paddingBottom: 6,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}>
          {logoUrl ? (
            <Image src={logoUrl} style={{ width: 120, height: 30, objectFit: 'contain' }} />
          ) : (
            <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', color: colors.primary }}>Imperoyal Immobilien</Text>
          )}
        </View>

        {/* Sections 1-4 */}
        {(isVisible('finanzierung') || isVisible('ertrag')) && (
        <View style={styles.sectionRow}>
          {/* Section 1: Finanzierungsprofil */}
          {isVisible('finanzierung') && (
          <View style={styles.sectionBox}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionNumber}>1</Text>
              <Text style={styles.sectionTitle}>Finanzierungsprofil</Text>
            </View>
            <View style={styles.sectionContent}>
              <View style={styles.row}>
                <Text style={styles.label}>Eigenkapital</Text>
                <Text style={styles.value}>{formatCurrency(fin?.eigenkapital)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Fremdkapital</Text>
                <Text style={styles.value}>{formatCurrency(fin?.fremdkapital)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Zinssatz / Tilgung</Text>
                <Text style={styles.value}>{formatPercent(fin?.zinssatz, 1)} / {formatPercent(fin?.tilgung, 0)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Kapitaldienst p.a.</Text>
                <Text style={styles.valueRed}>{formatCurrency(fin?.kapitaldienst)}</Text>
              </View>
              <View style={[styles.row, styles.rowTotal]}>
                <Text style={[styles.label, { fontWeight: 'bold' }]}>Anfangsrendite</Text>
                <Text style={styles.value}>{formatPercent(rendite?.rendite_ist)}</Text>
              </View>
              {/* Erklärung */}
              <View style={[styles.infoBox, { marginTop: 6, padding: 5 }]}>
                <Text style={{ fontSize: 6, color: colors.textMuted, lineHeight: 1.3 }}>
                  • EK-Quote: {((fin?.eigenkapital || 0) / (fin?.kaufpreis || 1) * 100).toFixed(0)}% {(fin?.eigenkapital || 0) / (fin?.kaufpreis || 1) >= 0.3 ? '(konservativ)' : '(gehebelt)'}
                </Text>
                <Text style={{ fontSize: 6, color: colors.textMuted, lineHeight: 1.3 }}>
                  • Zinsniveau: {(fin?.zinssatz || 0) <= 3.5 ? 'günstig' : (fin?.zinssatz || 0) <= 4.5 ? 'marktüblich' : 'erhöht'}
                </Text>
                <Text style={{ fontSize: 6, color: colors.textLight, fontStyle: 'italic', marginTop: 2 }}>
                  Quelle: Angaben Mandant
                </Text>
              </View>
              {/* Zinsänderungsszenario */}
              {fin?.zinsaenderung && (() => {
                const hinweis = getZinsaenderungHinweis(fin.zinsaenderung.zinsbindung_endet);
                return (
                  <View style={[styles.infoBox, { marginTop: 6, padding: 5, backgroundColor: hinweis.kannAnalysieren ? colors.warningBg : colors.bgLight }]}>
                    <Text style={{ fontSize: 7, fontWeight: 'bold', color: colors.primaryLight, marginBottom: 3 }}>
                      Zinsänderungsszenario
                    </Text>
                    {hinweis.kannAnalysieren ? (
                      <>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                          <Text style={{ fontSize: 6, color: colors.textMuted }}>Zinsbindung endet:</Text>
                          <Text style={{ fontSize: 6, fontWeight: 'bold', color: colors.warning }}>{new Date(fin.zinsaenderung.zinsbindung_endet).toLocaleDateString('de-DE')}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                          <Text style={{ fontSize: 6, color: colors.textMuted }}>Erwartete Restschuld:</Text>
                          <Text style={{ fontSize: 6, color: colors.text }}>{formatCurrency(fin.zinsaenderung.restschuld_bei_ende)}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                          <Text style={{ fontSize: 6, color: colors.textMuted }}>Erwarteter Zinssatz:</Text>
                          <Text style={{ fontSize: 6, color: fin.zinsaenderung.erwarteter_zins > fin.zinssatz ? colors.danger : colors.success }}>{formatPercent(fin.zinsaenderung.erwarteter_zins, 1)}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text style={{ fontSize: 6, color: colors.textMuted }}>Mehrbelastung p.a.:</Text>
                          <Text style={{ fontSize: 6, fontWeight: 'bold', color: fin.zinsaenderung.kapitaldienst_differenz > 0 ? colors.danger : colors.success }}>
                            {fin.zinsaenderung.kapitaldienst_differenz > 0 ? '+' : ''}{formatCurrency(fin.zinsaenderung.kapitaldienst_differenz)}
                          </Text>
                        </View>
                        <Text style={{ fontSize: 5, color: colors.textLight, fontStyle: 'italic', marginTop: 3 }}>
                          {hinweis.text}
                        </Text>
                      </>
                    ) : (
                      <Text style={{ fontSize: 6, color: colors.textMuted, lineHeight: 1.4 }}>
                        {hinweis.text}
                      </Text>
                    )}
                  </View>
                );
              })()}
            </View>
          </View>
          )}

          {/* Section 2: Ertragsprofil */}
          {isVisible('ertrag') && (
          <View style={styles.sectionBox}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionNumber}>2</Text>
              <Text style={styles.sectionTitle}>Ertragsprofil</Text>
            </View>
            <View style={styles.sectionContent}>
              <View style={styles.row}>
                <Text style={styles.label}>IST-Miete p.a.</Text>
                <Text style={styles.value}>{formatCurrency(miet?.miete_ist_jahr)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>SOLL-Miete p.a.</Text>
                <Text style={styles.value}>{formatCurrency(miet?.miete_soll_jahr)}</Text>
              </View>
              <View style={[styles.row, styles.rowTotal]}>
                <Text style={[styles.label, { fontWeight: 'bold' }]}>Mietpotenzial</Text>
                <Text style={styles.valueGreen}>+{formatCurrency(miet?.potenzial_jahr)}</Text>
              </View>
              {miet?.miete_ist_jahr && miet.potenzial_jahr ? (
                <Text style={{ fontSize: 8, color: colors.textMuted, textAlign: 'right', marginTop: 3 }}>
                  +{((miet.potenzial_jahr / miet.miete_ist_jahr) * 100).toFixed(1)}% Steigerung möglich
                </Text>
              ) : null}
              {/* Erklärung */}
              <View style={[styles.infoBox, { marginTop: 6, padding: 5 }]}>
                <Text style={{ fontSize: 6, color: colors.textMuted, lineHeight: 1.3 }}>
                  • IST: Tatsächliche Mieteinnahmen lt. Mandant
                </Text>
                <Text style={{ fontSize: 6, color: colors.textMuted, lineHeight: 1.3 }}>
                  • SOLL: Marktmiete bei Neuvermietung
                </Text>
                <Text style={{ fontSize: 6, color: colors.textLight, fontStyle: 'italic', marginTop: 2 }}>
                  Quelle: {(marktdaten?.vergleichsmiete_wohnen?.quelle && !marktdaten.vergleichsmiete_wohnen.quelle.toLowerCase().includes('keine daten') && !marktdaten.vergleichsmiete_wohnen.quelle.toLowerCase().includes('perplexity')) ? marktdaten.vergleichsmiete_wohnen.quelle : `Mietspiegel ${objekt.ort || 'Region'}`}
                </Text>
              </View>
            </View>
          </View>
          )}
        </View>
        )}

        {(isVisible('cashflow') || isVisible('kosten')) && (
        <View style={styles.sectionRow}>
          {/* Section 3: Cashflow-Analyse */}
          {isVisible('cashflow') && (
          <View style={styles.sectionBox}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionNumber}>3</Text>
              <Text style={styles.sectionTitle}>Cashflow-Analyse</Text>
            </View>
            <View style={styles.sectionContent}>
              <View style={styles.row}>
                <Text style={styles.label}>Mieteinnahmen</Text>
                <Text style={styles.value}>{formatCurrency(miet?.miete_ist_jahr)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>./. Kapitaldienst</Text>
                <Text style={styles.valueRed}>-{formatCurrency(fin?.kapitaldienst)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>./. Kosten</Text>
                <Text style={styles.valueRed}>-{formatCurrency(kosten?.kosten_gesamt)}</Text>
              </View>
              <View style={[styles.row, styles.rowTotal]}>
                <Text style={[styles.label, { fontWeight: 'bold' }]}>Cashflow IST</Text>
                <Text style={(cashflow?.cashflow_ist_jahr || 0) >= 0 ? styles.valueGreen : styles.valueRed}>
                  {formatCurrency(cashflow?.cashflow_ist_jahr)}
                </Text>
              </View>
              <View style={[styles.row, styles.rowLast]}>
                <Text style={[styles.label, { fontWeight: 'bold' }]}>Cashflow optimiert</Text>
                <Text style={(cashflow?.cashflow_opt_jahr || 0) >= 0 ? styles.valueGreen : styles.valueRed}>
                  {formatCurrency(cashflow?.cashflow_opt_jahr)}
                </Text>
              </View>
              {/* Erklärung */}
              <View style={[styles.infoBox, { marginTop: 6, padding: 5 }]}>
                <Text style={{ fontSize: 6, color: colors.textMuted, lineHeight: 1.3 }}>
                  • Cashflow = Miete - Kapitaldienst - Kosten
                </Text>
                <Text style={{ fontSize: 6, color: (cashflow?.cashflow_ist_jahr || 0) >= 0 ? colors.success : colors.danger, lineHeight: 1.3 }}>
                  • Status: {(cashflow?.cashflow_ist_jahr || 0) >= 0 ? 'Objekt trägt sich selbst' : 'Unterdeckung - Zuschuss erforderlich'}
                </Text>
                <Text style={{ fontSize: 6, color: colors.textLight, fontStyle: 'italic', marginTop: 2 }}>
                  Quelle: Berechnung auf Basis Mandantenangaben
                </Text>
              </View>
            </View>
          </View>
          )}

          {/* Section 4: Kostenstruktur */}
          {isVisible('kosten') && (
          <View style={styles.sectionBox}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionNumber}>4</Text>
              <Text style={styles.sectionTitle}>Kostenstruktur</Text>
              <View style={{ marginLeft: 'auto' }}>
                <TrafficLight status={kosten?.bewertung === 'gesund' ? 'green' : kosten?.bewertung === 'durchschnittlich' ? 'yellow' : 'red'} />
              </View>
            </View>
            <View style={styles.sectionContent}>
              {/* Visuelle Kostenbalken */}
              <View style={{ marginBottom: 8 }}>
                {[
                  { label: 'Instandhaltung', value: kosten?.instandhaltung || 0, color: '#2a4a6a' },
                  { label: 'Verwaltung', value: kosten?.verwaltung || 0, color: '#9eb3c8' },
                  { label: 'Nicht umlf. BK', value: kosten?.betriebskosten_nicht_umlage || 0, color: '#f59e0b' },
                  { label: 'Rücklagen', value: kosten?.ruecklagen || 0, color: '#10b981' },
                ].map((item, i) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={{ fontSize: 7, color: colors.textMuted, width: 55 }}>{item.label}</Text>
                    <View style={{ flex: 1, marginHorizontal: 4 }}>
                      <ProgressBar
                        value={item.value}
                        max={kosten?.kosten_gesamt || 1}
                        color={item.color}
                        height={6}
                        showLabel={false}
                      />
                    </View>
                    <Text style={{ fontSize: 7, fontWeight: 'bold', width: 40, textAlign: 'right' }}>{formatCurrencyShort(item.value)}</Text>
                  </View>
                ))}
              </View>
              <View style={[styles.row, styles.rowTotal]}>
                <Text style={[styles.label, { fontWeight: 'bold' }]}>Gesamt</Text>
                <Text style={[styles.value, { fontWeight: 'bold' }]}>{formatCurrency(kosten?.kosten_gesamt)}</Text>
              </View>
              {/* Kostenquote mit Fortschrittsbalken */}
              <View style={{ marginTop: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                  <Text style={{ fontSize: 8, color: colors.textMuted }}>Kostenquote</Text>
                  <Text style={{ fontSize: 8, fontWeight: 'bold', color: kosten?.bewertung === 'gesund' ? colors.success : kosten?.bewertung === 'durchschnittlich' ? colors.warning : colors.danger }}>
                    {formatPercent(kosten?.kostenquote)}
                  </Text>
                </View>
                <ProgressBar
                  value={kosten?.kostenquote || 0}
                  max={50}
                  color={kosten?.bewertung === 'gesund' ? colors.success : kosten?.bewertung === 'durchschnittlich' ? colors.warning : colors.danger}
                  height={8}
                  showLabel={false}
                />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
                  <Text style={{ fontSize: 6, color: colors.textLight }}>0%</Text>
                  <Text style={{ fontSize: 6, color: colors.success }}>25%</Text>
                  <Text style={{ fontSize: 6, color: colors.warning }}>35%</Text>
                  <Text style={{ fontSize: 6, color: colors.danger }}>50%</Text>
                </View>
              </View>
              {/* Erklärung */}
              <View style={[styles.infoBox, { marginTop: 6, padding: 5 }]}>
                <Text style={{ fontSize: 6, color: colors.textMuted, lineHeight: 1.3 }}>
                  • Kostenquote = Kosten / Mieteinnahmen
                </Text>
                <Text style={{ fontSize: 6, color: kosten?.bewertung === 'gesund' ? colors.success : kosten?.bewertung === 'durchschnittlich' ? colors.warning : colors.danger, lineHeight: 1.3 }}>
                  • Bewertung: {kosten?.bewertung === 'gesund' ? 'Gesund (<25%)' : kosten?.bewertung === 'durchschnittlich' ? 'Durchschnittlich (25-35%)' : 'Erhöht (>35%) - Optimierungspotenzial'}
                </Text>
                <Text style={{ fontSize: 6, color: colors.textLight, fontStyle: 'italic', marginTop: 2 }}>
                  Quelle: Angaben Mandant / Branchenbenchmark
                </Text>
              </View>
            </View>
          </View>
          )}
        </View>
        )}

        {/* ─── Ende Seite: Sektionen 1-4, Start neue Seite für Mieterhöhungstabelle ─── */}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Imperoyal Immobilien | Vertraulich</Text>
          <Text style={styles.footerCenter}>www.imperoyal-immobilien.de</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Seite ${pageNumber} von ${totalPages}`} />
        </View>
      </Page>
      )}

      {/* ==================== PAGE 3: Mieterhöhungstabelle ==================== */}
      {isVisible('mieterhohung') && (
      <Page size="A4" style={styles.page}>
        {/* Fixed Header */}
        <View fixed style={{
          position: 'absolute',
          top: 12,
          left: 25,
          right: 25,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          paddingBottom: 6,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}>
          {logoUrl ? (
            <Image src={logoUrl} style={{ width: 120, height: 30, objectFit: 'contain' }} />
          ) : (
            <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', color: colors.primary }}>Imperoyal Immobilien</Text>
          )}
        </View>

        {/* Section 5: Mieterhöhungspotenzial Table */}
        <View style={[styles.sectionBox, { marginBottom: 6 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>5</Text>
            <Text style={styles.sectionTitle}>Mieterhöhungspotenzial (§558 gilt nur für Wohnraum)</Text>
            <Text style={styles.sectionBadge}>{einheitenMitPotenzial} von {einheitenGesamt} mit Potenzial</Text>
          </View>
          <View style={styles.sectionContent}>
            {/* Table Header */}
            <View wrap={false} style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { width: 20 }]}>#</Text>
              <Text style={[styles.tableHeaderCell, { width: 50 }]}>Nutzung</Text>
              <Text style={[styles.tableHeaderCell, { width: 40 }]}>Fläche</Text>
              <Text style={[styles.tableHeaderCell, { width: 50 }]}>IST-Miete</Text>
              <Text style={[styles.tableHeaderCell, { width: 35 }]}>€/m²</Text>
              <Text style={[styles.tableHeaderCell, { width: 35 }]}>Markt</Text>
              <Text style={[styles.tableHeaderCell, { width: 50 }]}>SOLL-Miete</Text>
              <Text style={[styles.tableHeaderCell, { width: 50 }]}>Potenzial</Text>
              <Text style={[styles.tableHeaderCell, { width: 50 }]}>Nächste Erhöhung</Text>
              <Text style={[styles.tableHeaderCell, { width: 45 }]}>§558 Betrag</Text>
            </View>
            {/* Table Body - alle Einheiten */}
            {allEinheiten.map((einheit, index) => {
              const mieterhoehung = miet?.mieterhoehungen_558?.find(m => m.position === einheit.position);
              const euroPerSqm = einheit.flaeche > 0 ? einheit.kaltmiete_ist / einheit.flaeche : 0;
              const isGewerbe = einheit.nutzung === 'Gewerbe' || einheit.nutzung === 'Stellplatz';
              const marktMiete = einheit.nutzung === 'Gewerbe' ? 20 : einheit.nutzung === 'Stellplatz' ? '-' : 14;
              return (
                <View key={index} wrap={false} style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : {}]}>
                  <Text style={[styles.tableCell, { width: 20 }]}>{einheit.position}</Text>
                  <Text style={[styles.tableCell, styles.tableCellLeft, { width: 50 }]}>{einheit.nutzung}</Text>
                  <Text style={[styles.tableCell, { width: 40 }]}>{einheit.flaeche} m²</Text>
                  <Text style={[styles.tableCell, { width: 50 }]}>{formatCurrency(einheit.kaltmiete_ist)}</Text>
                  <Text style={[styles.tableCell, { width: 35 }]}>{euroPerSqm.toFixed(2)} €</Text>
                  <Text style={[styles.tableCell, { width: 35 }]}>{marktMiete} €</Text>
                  <Text style={[styles.tableCell, { width: 50 }]}>{formatCurrency(einheit.kaltmiete_soll)}</Text>
                  <Text style={[styles.tableCell, { width: 50, color: einheit.potenzial > 0 ? colors.success : colors.textMuted }]}>
                    {einheit.potenzial > 0 ? `+${formatCurrency(einheit.potenzial)}` : '-'}
                  </Text>
                  <Text style={[styles.tableCell, { width: 50, color: isGewerbe ? colors.textMuted : mieterhoehung?.moeglich === 'Sofort' ? colors.success : colors.warning }]}>
                    {isGewerbe ? 'n/a' : mieterhoehung?.moeglich || '-'}
                  </Text>
                  <Text style={[styles.tableCell, { width: 45, color: isGewerbe ? colors.textMuted : colors.success }]}>
                    {isGewerbe ? 'frei' : mieterhoehung?.betrag ? `+${formatCurrency(mieterhoehung.betrag)}` : '-'}
                  </Text>
                </View>
              );
            })}
            {/* Table Footer */}
            <View wrap={false} style={styles.tableFooter}>
              <Text style={[styles.tableCell, { width: 20, fontWeight: 'bold' }]}></Text>
              <Text style={[styles.tableCell, { width: 50, fontWeight: 'bold' }]}>GESAMT</Text>
              <Text style={[styles.tableCell, { width: 40 }]}></Text>
              <Text style={[styles.tableCell, { width: 50, fontWeight: 'bold' }]}>{formatCurrency(miet?.miete_ist_monat)}</Text>
              <Text style={[styles.tableCell, { width: 35 }]}></Text>
              <Text style={[styles.tableCell, { width: 35 }]}></Text>
              <Text style={[styles.tableCell, { width: 50, fontWeight: 'bold' }]}>{formatCurrency(miet?.miete_soll_monat)}</Text>
              <Text style={[styles.tableCell, { width: 50, fontWeight: 'bold', color: colors.success }]}>
                +{formatCurrency(miet?.potenzial_monat)}
              </Text>
              <Text style={[styles.tableCell, { width: 50 }]}></Text>
              <Text style={[styles.tableCell, { width: 45, fontWeight: 'bold', color: colors.success }]}>
                {miet?.miete_ist_monat && miet.potenzial_monat ?
                  `+${((miet.potenzial_monat / miet.miete_ist_monat) * 100).toFixed(1)}%` : ''}
              </Text>
            </View>
            {/* Info Box - kompakter */}
            <View wrap={false} style={[styles.infoBox, { marginTop: 4, padding: 4 }]}>
              <Text style={[styles.infoBoxTitle, { fontSize: 7 }]}>Hinweis §558 BGB (Kappungsgrenze):</Text>
              <Text style={[styles.infoBoxText, { fontSize: 6 }]}>
                • §558 BGB gilt nur für Wohnraum. Die Miete darf innerhalb von 3 Jahren um max. {objekt.milieuschutz ? '15%' : '20%'} erhöht werden.
              </Text>
              <Text style={[styles.infoBoxText, { fontSize: 6 }]}>
                • "Sofort" = Erhöhung jetzt möglich. Sperrfrist: 15 Monate nach letzter Erhöhung.
              </Text>
              <Text style={[styles.infoBoxText, { fontSize: 6 }]}>
                • Gewerbe/Stellplatz: Freie Mietvertragsregelungen, keine gesetzliche Kappung.
              </Text>
              <Text style={{ fontSize: 5, color: colors.textLight, fontStyle: 'italic', marginTop: 2 }}>
                Quelle: §558 BGB, Kappungsgrenzen-VO {objekt.ort || 'Region'}
              </Text>
            </View>
            {/* Mietvertragsarten-Hinweis */}
            {einheiten && einheiten.length > 0 && (() => {
              const mietvertragsarten = einheiten.map(e => ({ mietvertragsart: e.mietvertragsart || 'Standard' }));
              const zusammenfassung = getMietvertragsartZusammenfassung(mietvertragsarten);
              const hasIndex = mietvertragsarten.some(e => e.mietvertragsart === 'Index');
              const hasStaffel = mietvertragsarten.some(e => e.mietvertragsart === 'Staffel');

              if (!hasIndex && !hasStaffel) return null;

              return (
                <View wrap={false} style={[styles.infoBox, { marginTop: 4, padding: 4, backgroundColor: colors.neutralBg }]}>
                  <Text style={[styles.infoBoxTitle, { fontSize: 7 }]}>Hinweis zu Mietvertragsarten:</Text>
                  <Text style={[styles.infoBoxText, { fontSize: 6, marginBottom: 2 }]}>
                    Dieses Objekt enthält: {zusammenfassung}
                  </Text>
                  {hasIndex && (
                    <Text style={[styles.infoBoxText, { fontSize: 6 }]}>
                      • Index-Mietvertrag: {MIETVERTRAGSART_HINWEISE.Index.hinweis}
                    </Text>
                  )}
                  {hasStaffel && (
                    <Text style={[styles.infoBoxText, { fontSize: 6 }]}>
                      • Staffel-Mietvertrag: {MIETVERTRAGSART_HINWEISE.Staffel.hinweis}
                    </Text>
                  )}
                </View>
              );
            })()}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Imperoyal Immobilien | Vertraulich</Text>
          <Text style={styles.footerCenter}>www.imperoyal-immobilien.de</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Seite ${pageNumber} von ${totalPages}`} />
        </View>
      </Page>
      )}

      {/* ==================== PAGE: Sektionen 6-9 ==================== */}
      {(isVisible('cashflow_chart') || isVisible('wertentwicklung') || isVisible('capex') || isVisible('weg')) && (
      <Page size="A4" style={styles.page}>
        {/* Fixed Header */}
        <View fixed style={{
          position: 'absolute',
          top: 12,
          left: 25,
          right: 25,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          paddingBottom: 6,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}>
          {logoUrl ? (
            <Image src={logoUrl} style={{ width: 120, height: 30, objectFit: 'contain' }} />
          ) : (
            <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', color: colors.primary }}>Imperoyal Immobilien</Text>
          )}
        </View>

        {/* Section 6 & 7 */}
        {(isVisible('cashflow_chart') || isVisible('wertentwicklung')) && (
        <View style={styles.sectionRow} wrap={false}>
          {/* Section 6: Cashflow IST vs. Optimiert */}
          {isVisible('cashflow_chart') && (
          <View style={styles.sectionBox}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionNumber}>6</Text>
              <Text style={styles.sectionTitle}>Cashflow IST vs. Optimiert</Text>
              <View style={{ marginLeft: 'auto' }}>
                <TrendArrow value={((cashflow?.cashflow_opt_jahr || 0) - (cashflow?.cashflow_ist_jahr || 0)) / Math.abs(cashflow?.cashflow_ist_jahr || 1) * 100} showValue={false} />
              </View>
            </View>
            <View style={styles.sectionContent}>
              {/* Visueller Vergleich mit Balken */}
              <View style={{ marginBottom: 8 }}>
                <ComparisonBar
                  ist={miet?.miete_ist_jahr || 0}
                  soll={miet?.miete_soll_jahr || 0}
                  label="Mieteinnahmen p.a."
                  colorIst={colors.blueBone}
                  colorSoll="#16a34a"
                />
              </View>
              {/* Cashflow Balkendiagramm */}
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 8, color: colors.textMuted, marginBottom: 6, fontWeight: 'bold' }}>Cashflow-Vergleich</Text>
                {/* IST Balken */}
                <View style={{ marginBottom: 6 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                    <Text style={{ fontSize: 7, color: colors.textMuted }}>IST</Text>
                    <Text style={{ fontSize: 9, fontWeight: 'bold', color: (cashflow?.cashflow_ist_jahr || 0) >= 0 ? colors.success : colors.danger }}>
                      {formatCurrency(cashflow?.cashflow_ist_jahr)}
                    </Text>
                  </View>
                  <View style={{ height: 16, backgroundColor: colors.bgLight, borderRadius: 3, overflow: 'hidden' }}>
                    <View style={{
                      width: `${Math.min(100, Math.max(0, Math.abs(cashflow?.cashflow_ist_jahr || 0) / Math.max(Math.abs(cashflow?.cashflow_ist_jahr || 1), Math.abs(cashflow?.cashflow_opt_jahr || 1)) * 100))}%`,
                      height: '100%',
                      backgroundColor: (cashflow?.cashflow_ist_jahr || 0) >= 0 ? colors.success : colors.danger,
                      borderRadius: 3,
                    }} />
                  </View>
                </View>
                {/* OPTIMIERT Balken */}
                <View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                    <Text style={{ fontSize: 7, color: colors.success, fontWeight: 'bold' }}>OPTIMIERT</Text>
                    <Text style={{ fontSize: 9, fontWeight: 'bold', color: (cashflow?.cashflow_opt_jahr || 0) >= 0 ? colors.success : colors.danger }}>
                      {formatCurrency(cashflow?.cashflow_opt_jahr)}
                    </Text>
                  </View>
                  <View style={{ height: 16, backgroundColor: colors.bgLight, borderRadius: 3, overflow: 'hidden' }}>
                    <View style={{
                      width: `${Math.min(100, Math.max(0, Math.abs(cashflow?.cashflow_opt_jahr || 0) / Math.max(Math.abs(cashflow?.cashflow_ist_jahr || 1), Math.abs(cashflow?.cashflow_opt_jahr || 1)) * 100))}%`,
                      height: '100%',
                      backgroundColor: (cashflow?.cashflow_opt_jahr || 0) >= 0 ? '#16a34a' : colors.danger,
                      borderRadius: 3,
                    }} />
                  </View>
                </View>
              </View>
              <View style={[styles.infoBox, { backgroundColor: colors.successBg, padding: 8 }]}>
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.success, textAlign: 'center' }}>
                  Potenzial: +{formatCurrency((cashflow?.cashflow_opt_jahr || 0) - (cashflow?.cashflow_ist_jahr || 0))} p.a.
                </Text>
              </View>
              <Text style={{ fontSize: 6, color: colors.textLight, fontStyle: 'italic', textAlign: 'center', marginTop: 4 }}>
                Quelle: Eigene Berechnung auf Basis Mandantenangaben und Marktmieten
              </Text>
            </View>
          </View>
          )}

          {/* Section 7: Wertentwicklung */}
          {isVisible('wertentwicklung') && (
          <View style={styles.sectionBox}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionNumber}>7</Text>
              <Text style={styles.sectionTitle}>Wertentwicklung</Text>
              <View style={{ marginLeft: 'auto' }}>
                <TrendArrow value={2.5} showValue={false} />
              </View>
            </View>
            <View style={[styles.sectionContent, { flex: 1, alignItems: 'center', justifyContent: 'center' }]}>
              {/* Wertentwicklung als Balken - zentriert */}
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', height: 100, gap: 8 }}>
                {[
                  { label: 'Heute', value: wert?.heute || 0, pct: null },
                  { label: '+3J', value: wert?.jahr_3 || 0, pct: wert?.heute ? ((wert.jahr_3 - wert.heute) / wert.heute * 100) : 0 },
                  { label: '+5J', value: wert?.jahr_5 || 0, pct: wert?.heute ? ((wert.jahr_5 - wert.heute) / wert.heute * 100) : 0 },
                  { label: '+7J', value: wert?.jahr_7 || 0, pct: wert?.heute ? ((wert.jahr_7 - wert.heute) / wert.heute * 100) : 0 },
                  { label: '+10J', value: wert?.jahr_10 || 0, pct: wert?.heute ? ((wert.jahr_10 - wert.heute) / wert.heute * 100) : 0 },
                ].map((item, i) => {
                  const maxVal = wert?.jahr_10 || wert?.heute || 1;
                  const heightPct = Math.max(50, (item.value / maxVal) * 100);
                  // Gradient von hell nach dunkel (links nach rechts)
                  const barColors = ['#8a9cad', '#7a8c9d', '#5a6c7d', '#4a5c6d', '#3a4c5d'];
                  return (
                    <View key={i} style={{ width: 42, alignItems: 'center' }}>
                      <View style={{
                        width: 38,
                        height: `${heightPct}%`,
                        backgroundColor: barColors[i],
                        borderRadius: 4,
                        minHeight: 30,
                      }} />
                    </View>
                  );
                })}
              </View>
              {/* Labels unter den Balken */}
              <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 4, gap: 8 }}>
                {[
                  { label: 'Heute', value: wert?.heute || 0, pct: null },
                  { label: '+3J', value: wert?.jahr_3 || 0, pct: wert?.heute ? ((wert.jahr_3 - wert.heute) / wert.heute * 100) : 0 },
                  { label: '+5J', value: wert?.jahr_5 || 0, pct: wert?.heute ? ((wert.jahr_5 - wert.heute) / wert.heute * 100) : 0 },
                  { label: '+7J', value: wert?.jahr_7 || 0, pct: wert?.heute ? ((wert.jahr_7 - wert.heute) / wert.heute * 100) : 0 },
                  { label: '+10J', value: wert?.jahr_10 || 0, pct: wert?.heute ? ((wert.jahr_10 - wert.heute) / wert.heute * 100) : 0 },
                ].map((item, i) => (
                  <View key={i} style={{ width: 42, alignItems: 'center' }}>
                    <Text style={{ fontSize: 7, fontWeight: 'bold', color: colors.primary }}>
                      {formatCurrencyShort(item.value)}
                    </Text>
                    {item.pct !== null && (
                      <Text style={{ fontSize: 6, color: colors.success, fontWeight: 'bold' }}>+{item.pct.toFixed(0)}%</Text>
                    )}
                    <Text style={{ fontSize: 6, color: colors.textMuted }}>{item.label}</Text>
                  </View>
                ))}
              </View>
              <Text style={{ fontSize: 5, color: colors.textLight, fontStyle: 'italic', textAlign: 'center', marginTop: 3 }}>
                Quelle: {marktdaten?.preisprognose ? 'Gutachterausschuss / Immobilienmarktbericht' : 'Hist. Durchschnitt (2,5% p.a.)'}
              </Text>
            </View>
          </View>
          )}
        </View>
        )}

        {/* Section 8 & 9 */}
        {(isVisible('capex') || isVisible('weg')) && (
        <View style={styles.sectionRow} wrap={false}>
          {/* Section 8: CAPEX & §559 BGB */}
          {isVisible('capex') && (
          <View style={styles.sectionBox}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionNumber}>8</Text>
              <Text style={styles.sectionTitle}>CAPEX & §559 BGB</Text>
            </View>
            <View style={styles.sectionContent}>
              <View style={styles.row}>
                <Text style={styles.label}>CAPEX geplant</Text>
                <Text style={styles.value}>{formatCurrency(mod559?.capex_betrag)}</Text>
              </View>
              <View style={[styles.infoBox, { backgroundColor: colors.bgBlue, marginTop: 10 }]}>
                <Text style={{ fontSize: 8, color: colors.primaryLight, fontWeight: 'bold' }}>§559 Modernisierungsumlage</Text>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.primary, marginVertical: 3 }}>
                  {formatCurrency(mod559?.umlage_nach_kappung)} p.a.
                </Text>
                <Text style={{ fontSize: 7, color: colors.textMuted }}>Gekappt nach §559 Abs. 3a BGB</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.infoBoxTitle}>Kappungsgrenzen §559 Abs. 3a BGB:</Text>
                <Text style={styles.infoBoxText}>• Kaltmiete {'<'} 7€/m²: max. 2€/m² in 6 Jahren</Text>
                <Text style={styles.infoBoxText}>• Kaltmiete ≥ 7€/m²: max. 3€/m² in 6 Jahren</Text>
                <Text style={{ fontSize: 6, color: colors.textLight, fontStyle: 'italic', marginTop: 3 }}>
                  Quelle: §559 Abs. 3a BGB, CAPEX-Angaben Mandant
                </Text>
              </View>
            </View>
          </View>
          )}

          {/* Section 9: WEG-Potenzial */}
          {isVisible('weg') && (
          <View style={styles.sectionBox}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionNumber}>9</Text>
              <Text style={styles.sectionTitle}>WEG-Potenzial</Text>
            </View>
            <View style={styles.sectionContent}>
              <View style={styles.row}>
                <Text style={styles.label}>Wert heute</Text>
                <Text style={styles.value}>{formatCurrency(weg?.wert_heute)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Wert aufgeteilt</Text>
                <Text style={styles.value}>{formatCurrency(weg?.wert_aufgeteilt)}</Text>
              </View>
              <View style={[styles.row, styles.rowTotal]}>
                <Text style={[styles.label, { fontWeight: 'bold' }]}>Potenzial</Text>
                <Text style={styles.valueGreen}>+{formatCurrency(weg?.weg_gewinn)}</Text>
              </View>
              {weg?.genehmigung_erforderlich && (
                <View style={[styles.infoBox, { backgroundColor: colors.warningBg }]}>
                  <Text style={{ fontSize: 8, color: colors.warning, fontWeight: 'bold', textAlign: 'center' }}>
                    Genehmigung nötig
                  </Text>
                </View>
              )}
              <View style={[styles.infoBox, { marginTop: 6, padding: 5 }]}>
                <Text style={{ fontSize: 6, color: colors.textMuted, lineHeight: 1.3 }}>
                  • WEG-Aufteilung: +15% Wertsteigerung durch Einzelverkauf
                </Text>
                <Text style={{ fontSize: 6, color: colors.textMuted, lineHeight: 1.3 }}>
                  • Status: {weg?.bereits_aufgeteilt ? 'Bereits aufgeteilt' : 'Noch nicht aufgeteilt'}
                </Text>
                <Text style={{ fontSize: 6, color: colors.textLight, fontStyle: 'italic', marginTop: 2 }}>
                  Quelle: Marktbeobachtung WEG-Aufteiler, {objekt.ort || 'Region'}
                </Text>
              </View>
            </View>
          </View>
          )}
        </View>
        )}

        {/* ─── Ende Seite, Start neue Seite für AfA & Exit ─── */}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Imperoyal Immobilien | Vertraulich</Text>
          <Text style={styles.footerCenter}>www.imperoyal-immobilien.de</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Seite ${pageNumber} von ${totalPages}`} />
        </View>
      </Page>
      )}

      {/* ==================== PAGE: AfA, ROI, Exit ==================== */}
      {(isVisible('afa') || isVisible('roi') || isVisible('exit')) && (
      <Page size="A4" style={styles.page}>
        {/* Fixed Header */}
        <View fixed style={{
          position: 'absolute',
          top: 12,
          left: 25,
          right: 25,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          paddingBottom: 6,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}>
          {logoUrl ? (
            <Image src={logoUrl} style={{ width: 120, height: 30, objectFit: 'contain' }} />
          ) : (
            <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', color: colors.primary }}>Imperoyal Immobilien</Text>
          )}
        </View>

        {/* Section 10 & 11 */}
        {(isVisible('afa') || isVisible('roi')) && (
        <View style={styles.sectionRow}>
          {/* Section 10: RND & AfA - Erweitert */}
          {isVisible('afa') && (
          <View style={styles.sectionBox}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionNumber}>10</Text>
              <Text style={styles.sectionTitle}>AfA & Steuervorteile</Text>
            </View>
            <View style={styles.sectionContent}>
              {/* AfA Highlight Box */}
              <View style={{ backgroundColor: colors.successBg, borderRadius: 4, padding: 8, marginBottom: 8 }}>
                <Text style={{ fontSize: 7, color: colors.success, fontWeight: 'bold', marginBottom: 3 }}>Jährlicher Steuervorteil</Text>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.success }}>{formatCurrency(afa?.steuerersparnis_42)}</Text>
                <Text style={{ fontSize: 6, color: colors.textMuted }}>bei 42% Grenzsteuersatz</Text>
              </View>
              {/* RND Visualisierung */}
              <View style={{ marginBottom: 6 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                  <Text style={{ fontSize: 7, color: colors.textMuted }}>Restnutzungsdauer</Text>
                  <Text style={{ fontSize: 7, fontWeight: 'bold' }}>{afa?.rnd} von 80 Jahren</Text>
                </View>
                <ProgressBar value={afa?.rnd || 0} max={80} color={colors.primaryLight} height={6} showLabel={false} />
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Baujahr / Alter</Text>
                <Text style={styles.value}>{afa?.baujahr} / {afa?.alter}J.</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>AfA-Satz</Text>
                <Text style={styles.value}>{afa?.rnd ? (100 / afa.rnd).toFixed(2) : '-'}%</Text>
              </View>
              <View style={[styles.row, styles.rowLast]}>
                <Text style={styles.label}>AfA-Betrag p.a.</Text>
                <Text style={[styles.value, { color: colors.primary }]}>{formatCurrency(afa?.afa_jahr)}</Text>
              </View>
              {/* Erklärung */}
              <View style={[styles.infoBox, { marginTop: 6, padding: 4 }]}>
                <Text style={{ fontSize: 6, color: colors.textMuted, lineHeight: 1.3 }}>
                  • AfA = Absetzung für Abnutzung (§7 EStG)
                </Text>
                <Text style={{ fontSize: 6, color: colors.textMuted, lineHeight: 1.3 }}>
                  • Basis: {formatCurrency(afa?.gebaeude_wert)} Gebäudewert (80% KP)
                </Text>
                <Text style={{ fontSize: 6, color: colors.textLight, fontStyle: 'italic', marginTop: 2 }}>
                  Quelle: §7 Abs. 4 EStG, RND nach ImmoWertV
                </Text>
              </View>
            </View>
          </View>
          )}

          {/* Section 11: ROI-Szenarien - Erweitert */}
          {isVisible('roi') && (
          <View style={styles.sectionBox}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionNumber}>11</Text>
              <Text style={styles.sectionTitle}>Rendite-Szenarien</Text>
            </View>
            <View style={styles.sectionContent}>
              {/* Visuelle ROI-Balken */}
              <View style={{ marginBottom: 10 }}>
                {[
                  { label: 'Brutto-Rendite IST', value: rendite?.rendite_ist || 0, color: '#9eb3c8' },
                  { label: 'Brutto-Rendite OPT', value: rendite?.rendite_opt || 0, color: colors.success },
                  { label: 'Nach AfA (eff.)', value: rendite_nach_steuer, color: colors.accent },
                  { label: 'EK-Rendite IST', value: rendite?.eigenkapitalrendite_ist || 0, color: colors.primaryLight },
                ].map((item, i) => (
                  <View key={i} style={{ marginBottom: 5 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                      <Text style={{ fontSize: 7, color: colors.textMuted }}>{item.label}</Text>
                      <Text style={{ fontSize: 7, fontWeight: 'bold', color: item.color }}>{formatPercent(item.value)}</Text>
                    </View>
                    <ProgressBar value={item.value} max={15} color={item.color} height={5} showLabel={false} />
                  </View>
                ))}
              </View>
              {/* EK-Rendite Highlight */}
              <View style={{ backgroundColor: colors.bgBlue, borderRadius: 4, padding: 6, marginTop: 4 }}>
                <Text style={{ fontSize: 7, color: colors.primaryLight, fontWeight: 'bold' }}>Eigenkapitalrendite optimiert</Text>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.primary }}>{formatPercent(rendite?.eigenkapitalrendite_opt)}</Text>
              </View>
              <Text style={{ fontSize: 6, color: colors.textLight, fontStyle: 'italic', marginTop: 4 }}>
                Quelle: Eigene Berechnung (Brutto = Miete/KP, EK = Cashflow/EK)
              </Text>
            </View>
          </View>
          )}
        </View>
        )}

        {/* Section 12: Exit-Szenarien - SVG Linien-Chart */}
        {isVisible('exit') && (
        <View style={[styles.sectionBox, { marginBottom: 6 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>12</Text>
            <Text style={styles.sectionTitle}>Exit-Szenarien</Text>
          </View>
          <View style={[styles.sectionContent, { flex: 1, alignItems: 'center', justifyContent: 'center' }]}>
            {/* SVG Linien-Chart - zentriert */}
            {(() => {
              const svgWidth = 420;
              const svgHeight = 90;
              const padding = { top: 10, right: 10, bottom: 10, left: 10 };
              const chartWidth = svgWidth - padding.left - padding.right;
              const chartHeight = svgHeight - padding.top - padding.bottom;

              const heute = wert?.heute || 0;
              const dataPoints = [
                { label: 'Heute', value: heute },
                { label: '+3J', value: wert?.jahr_3 || 0 },
                { label: '+5J', value: wert?.jahr_5 || 0 },
                { label: '+7J', value: wert?.jahr_7 || 0 },
                { label: '+10J', value: wert?.jahr_10 || 0 },
              ];

              const maxVal = Math.max(...dataPoints.map(d => d.value));
              const minVal = heute * 0.92;
              const range = maxVal - minVal || 1;

              // Calculate points
              const points = dataPoints.map((d, i) => ({
                x: padding.left + (i / (dataPoints.length - 1)) * chartWidth,
                y: padding.top + chartHeight - ((d.value - minVal) / range) * chartHeight,
                value: d.value,
                label: d.label,
              }));

              // Create path for line
              const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

              // Create path for filled area
              const areaPath = `${linePath} L ${points[points.length - 1].x} ${svgHeight - padding.bottom} L ${points[0].x} ${svgHeight - padding.bottom} Z`;

              return (
                <View style={{ marginBottom: 8 }}>
                  {/* SVG Chart */}
                  <Svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
                    {/* Filled area under line */}
                    <Path d={areaPath} fill={colors.bgGreen} />

                    {/* Main line */}
                    <Path d={linePath} stroke="#16a34a" strokeWidth={3} fill="none" />

                    {/* Data points */}
                    {points.map((p, i) => (
                      <G key={i}>
                        <Circle cx={p.x} cy={p.y} r={6} fill="#16a34a" />
                        <Circle cx={p.x} cy={p.y} r={4} fill="white" />
                      </G>
                    ))}
                  </Svg>

                  {/* Labels below chart */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, paddingHorizontal: 5 }}>
                    {dataPoints.map((point, i) => {
                      const prevPoint = i > 0 ? dataPoints[i - 1] : null;
                      const increment = prevPoint ? point.value - prevPoint.value : 0;
                      return (
                        <View key={i} style={{ alignItems: 'center', width: 80 }}>
                          <Text style={{ fontSize: 7, fontWeight: 'bold', color: colors.primary, textAlign: 'center' }}>
                            {formatCurrency(point.value)}
                          </Text>
                          {i > 0 && increment > 0 && (
                            <Text style={{ fontSize: 6, fontWeight: 'bold', color: colors.success, textAlign: 'center' }}>
                              +{formatCurrency(increment)}
                            </Text>
                          )}
                          <Text style={{ fontSize: 6, color: colors.textMuted, marginTop: 2, textAlign: 'center' }}>
                            {point.label}
                          </Text>
                        </View>
                      );
                    })}
                  </View>

                  {/* Summary row */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-around', backgroundColor: colors.bgGreen, borderRadius: 4, padding: 6, marginTop: 8 }}>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ fontSize: 6, color: colors.textMuted }}>Wertzuwachs 10J</Text>
                      <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.success }}>
                        +{formatCurrency((wert?.jahr_10 || 0) - (wert?.heute || 0))}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ fontSize: 6, color: colors.textMuted }}>Rendite p.a.</Text>
                      <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.success }}>
                        +{((wert?.heute && wert?.jahr_10) ? (((wert.jahr_10 / wert.heute) ** (1/10) - 1) * 100).toFixed(1) : '2.5')}%
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })()}
            <Text style={{ fontSize: 6, color: colors.textMuted, textAlign: 'center' }}>
              Annahme: {marktdaten?.preisprognose ? 'Dynamische Prognose lt. Marktdaten' : '2,5% p.a. Wertsteigerung'} | Quelle: {marktdaten?.preisprognose ? 'Bundesbank Immobilienpreisindex / Gutachterausschuss' : 'Bundesbank Immobilienpreisindex'}
            </Text>
          </View>
        </View>
        )}

        {/* Investment-Übersicht Dashboard - auf Seite 3 verschoben um Whitespace zu füllen */}
        <View style={{
          backgroundColor: colors.bgLight,
          borderRadius: 6,
          padding: 10,
          marginBottom: 10,
          borderWidth: 1,
          borderColor: colors.border,
        }}>
          <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.primary, marginBottom: 10 }}>
            Investment-Übersicht
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {/* Spalte 1: Kapitalstruktur */}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 7, color: colors.textMuted, fontWeight: 'bold', marginBottom: 4 }}>Kapitalstruktur</Text>
              <View style={{ height: 40, flexDirection: 'row', borderRadius: 4, overflow: 'hidden' }}>
                <View style={{ flex: (fin?.eigenkapital || 0) / (fin?.kaufpreis || 1), backgroundColor: colors.success }} />
                <View style={{ flex: (fin?.fremdkapital || 0) / (fin?.kaufpreis || 1), backgroundColor: colors.danger }} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 }}>
                <Text style={{ fontSize: 6, color: colors.success }}>EK {formatPercent((fin?.eigenkapital || 0) / (fin?.kaufpreis || 1) * 100, 0)}</Text>
                <Text style={{ fontSize: 6, color: colors.danger }}>FK {formatPercent((fin?.fremdkapital || 0) / (fin?.kaufpreis || 1) * 100, 0)}</Text>
              </View>
            </View>
            {/* Spalte 2: Cashflow-Verwendung */}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 7, color: colors.textMuted, fontWeight: 'bold', marginBottom: 4 }}>Mietverteilung</Text>
              <View style={{ height: 40, flexDirection: 'row', borderRadius: 4, overflow: 'hidden' }}>
                <View style={{ flex: (fin?.kapitaldienst || 0) / (miet?.miete_ist_jahr || 1), backgroundColor: '#dc2626' }} />
                <View style={{ flex: (kosten?.kosten_gesamt || 0) / (miet?.miete_ist_jahr || 1), backgroundColor: '#f59e0b' }} />
                <View style={{ flex: Math.max(0, (cashflow?.cashflow_ist_jahr || 0)) / (miet?.miete_ist_jahr || 1), backgroundColor: '#16a34a' }} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 }}>
                <Text style={{ fontSize: 6, color: '#dc2626' }}>Kapitaldienst</Text>
                <Text style={{ fontSize: 6, color: '#f59e0b' }}>Kosten</Text>
                <Text style={{ fontSize: 6, color: '#16a34a' }}>Cashflow</Text>
              </View>
            </View>
            {/* Spalte 3: Key Metrics */}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 7, color: colors.textMuted, fontWeight: 'bold', marginBottom: 4 }}>Kennzahlen</Text>
              {[
                { label: 'Rendite', value: formatPercent(rendite?.rendite_ist), color: colors.text },
                { label: 'Kostenquote', value: formatPercent(kosten?.kostenquote), color: kosten?.bewertung === 'gesund' ? colors.success : colors.warning },
                { label: 'Faktor', value: `${((fin?.kaufpreis || 0) / (miet?.miete_ist_jahr || 1)).toFixed(1)}x`, color: colors.text },
              ].map((item, i) => (
                <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                  <Text style={{ fontSize: 7, color: colors.textMuted }}>{item.label}</Text>
                  <Text style={{ fontSize: 7, fontWeight: 'bold', color: item.color }}>{item.value}</Text>
                </View>
              ))}
            </View>
          </View>
          <Text style={{ fontSize: 6, color: colors.textLight, fontStyle: 'italic', textAlign: 'right', marginTop: 6 }}>
            Quelle: Aggregierte Berechnung aus Mandantenangaben und Marktdaten
          </Text>
        </View>

        {/* ─── Ende Seite, Start neue Seite für Zusammenfassung & Empfehlung ─── */}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Imperoyal Immobilien | Vertraulich</Text>
          <Text style={styles.footerCenter}>www.imperoyal-immobilien.de</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Seite ${pageNumber} von ${totalPages}`} />
        </View>
      </Page>
      )}

      {/* ==================== PAGE: Zusammenfassung & Empfehlung ==================== */}
      {isVisible('empfehlung') && (
      <Page size="A4" style={styles.page}>
        {/* Fixed Header */}
        <View fixed style={{
          position: 'absolute',
          top: 12,
          left: 25,
          right: 25,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          paddingBottom: 6,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}>
          {logoUrl ? (
            <Image src={logoUrl} style={{ width: 120, height: 30, objectFit: 'contain' }} />
          ) : (
            <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', color: colors.primary }}>Imperoyal Immobilien</Text>
          )}
        </View>

        {/* Zusammenfassung: Wertsteigernde Maßnahmen */}
        <View style={{
          backgroundColor: colors.bgGreen,
          borderRadius: 6,
          padding: 12,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: colors.success,
        }}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.success, marginBottom: 10 }}>
            Zusammenfassung: Wertsteigernde Maßnahmen
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {/* Spalte 1: Mietpotenzial */}
            <View style={{ flex: 1, backgroundColor: 'white', borderRadius: 4, padding: 8 }}>
              <Text style={{ fontSize: 8, color: colors.textMuted, marginBottom: 4 }}>Mieterhöhungspotenzial</Text>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.success }}>
                +{formatCurrency(miet?.potenzial_jahr)}/Jahr
              </Text>
              <Text style={{ fontSize: 6, color: colors.textMuted, marginTop: 2 }}>
                durch Anpassung auf Marktmiete
              </Text>
            </View>
            {/* Spalte 2: WEG-Potenzial */}
            <View style={{ flex: 1, backgroundColor: 'white', borderRadius: 4, padding: 8 }}>
              <Text style={{ fontSize: 8, color: colors.textMuted, marginBottom: 4 }}>WEG-Aufteilung</Text>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: weg?.bereits_aufgeteilt ? colors.textMuted : colors.success }}>
                {weg?.bereits_aufgeteilt ? 'Bereits aufgeteilt' : `+${formatCurrency(weg?.weg_gewinn)}`}
              </Text>
              <Text style={{ fontSize: 6, color: colors.textMuted, marginTop: 2 }}>
                {weg?.hinweistext || 'Einmaliger Wertzuwachs'}
              </Text>
            </View>
            {/* Spalte 3: Steuerersparnis */}
            <View style={{ flex: 1, backgroundColor: 'white', borderRadius: 4, padding: 8 }}>
              <Text style={{ fontSize: 8, color: colors.textMuted, marginBottom: 4 }}>AfA-Steuerersparnis</Text>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.accent }}>
                +{formatCurrency(steuerersparnis)}/Jahr
              </Text>
              <Text style={{ fontSize: 6, color: colors.textMuted, marginTop: 2 }}>
                bei 42% Grenzsteuersatz
              </Text>
            </View>
          </View>
          {/* Gesamtpotenzial */}
          <View style={{ marginTop: 10, backgroundColor: 'white', borderRadius: 4, padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 9, fontWeight: 'bold', color: colors.text }}>
              Gesamtpotenzial (jährlich wiederkehrend):
            </Text>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.success }}>
              +{formatCurrency((miet?.potenzial_jahr || 0) + steuerersparnis)}/Jahr
            </Text>
          </View>
        </View>

        {/* Section 13: Handlungsempfehlung */}
        <View style={[styles.sectionBox, { marginBottom: 6 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>13</Text>
            <Text style={styles.sectionTitle}>Handlungsempfehlung</Text>
            {empfehlung_prioritaet && (
              <Text style={{ marginLeft: 'auto', fontSize: 8, color: colors.textMuted }}>
                Priorität: {empfehlung_prioritaet}
              </Text>
            )}
          </View>
          <View style={styles.sectionContent}>
            {/* Empfehlung Badge */}
            <View style={{
              backgroundColor: colors.bgBlue,
              borderRadius: 6,
              padding: 12,
              marginBottom: 10,
              alignItems: 'center',
            }}>
              <Text style={{ fontSize: 9, color: colors.textMuted, marginBottom: 3 }}>Unsere Empfehlung</Text>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.primary }}>{empfehlung || '-'}</Text>
            </View>

            {/* Begründung */}
            {empfehlung_begruendung && (
              <View style={{ marginBottom: 10 }}>
                <Text style={{ fontSize: 9, fontWeight: 'bold', color: colors.primary, marginBottom: 4 }}>Begründung</Text>
                <Text style={{ fontSize: 8, color: colors.text, lineHeight: 1.5 }}>{empfehlung_begruendung}</Text>
              </View>
            )}

            {/* Handlungsschritte */}
            {empfehlung_handlungsschritte && empfehlung_handlungsschritte.length > 0 && (
              <View style={{ marginBottom: 10 }}>
                <Text style={{ fontSize: 9, fontWeight: 'bold', color: colors.primary, marginBottom: 6 }}>
                  Empfohlene Handlungsschritte
                </Text>
                {empfehlung_handlungsschritte.map((schritt, index) => {
                  const isObject = typeof schritt === 'object' && schritt !== null;
                  const schrittText = isObject ? schritt.schritt : schritt;
                  const zeitrahmen = isObject ? schritt.zeitrahmen :
                    (index === 0 ? 'Sofort' : index === 1 ? '2 Wochen' : index === 2 ? '4 Wochen' : '8 Wochen');
                  return (
                    <View key={index} style={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      marginBottom: 4,
                      backgroundColor: colors.bgLight,
                      padding: 6,
                      borderRadius: 4,
                    }}>
                      <View style={{
                        width: 18,
                        height: 18,
                        borderRadius: 9,
                        backgroundColor: colors.primaryLight,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 6,
                      }}>
                        <Text style={{ fontSize: 8, fontWeight: 'bold', color: 'white' }}>{index + 1}</Text>
                      </View>
                      <Text style={{ flex: 1, fontSize: 7, color: colors.text }}>{schrittText}</Text>
                      <Text style={{ fontSize: 6, color: colors.success, fontWeight: 'bold' }}>{zeitrahmen}</Text>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Chancen & Risiken */}
            {((empfehlung_chancen && empfehlung_chancen.length > 0) || (empfehlung_risiken && empfehlung_risiken.length > 0)) && (
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                {empfehlung_chancen && empfehlung_chancen.length > 0 && (
                  <View style={{ flex: 1, backgroundColor: colors.bgGreen, borderRadius: 4, padding: 8 }}>
                    <Text style={{ fontSize: 8, fontWeight: 'bold', color: colors.success, marginBottom: 4 }}>Chancen</Text>
                    {empfehlung_chancen.map((c, i) => (
                      <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 2 }}>
                        <Text style={{ fontSize: 7, color: colors.success, marginRight: 4 }}>+</Text>
                        <Text style={{ fontSize: 7, color: colors.text, flex: 1 }}>{c}</Text>
                      </View>
                    ))}
                  </View>
                )}
                {empfehlung_risiken && empfehlung_risiken.length > 0 && (
                  <View style={{ flex: 1, backgroundColor: colors.bgRed, borderRadius: 4, padding: 8 }}>
                    <Text style={{ fontSize: 8, fontWeight: 'bold', color: colors.danger, marginBottom: 4 }}>Risiken</Text>
                    {empfehlung_risiken.map((r, i) => (
                      <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 2 }}>
                        <Text style={{ fontSize: 7, color: colors.danger, marginRight: 4 }}>–</Text>
                        <Text style={{ fontSize: 7, color: colors.text, flex: 1 }}>{r}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Fazit */}
            {empfehlung_fazit && (
              <View style={{
                backgroundColor: colors.bgLight,
                padding: 10,
                borderRadius: 4,
                borderLeftWidth: 3,
                borderLeftColor: colors.primaryLight,
              }}>
                <Text style={{ fontSize: 8, fontWeight: 'bold', color: colors.primary, marginBottom: 3 }}>Fazit</Text>
                <Text style={{ fontSize: 8, color: colors.text, lineHeight: 1.5 }}>{empfehlung_fazit}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Imperoyal Immobilien | Vertraulich</Text>
          <Text style={styles.footerCenter}>www.imperoyal-immobilien.de</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Seite ${pageNumber} von ${totalPages}`} />
        </View>
      </Page>
      )}

      {/* ==================== PAGE 5: Ergänzende Erläuterungen ==================== */}
      {isVisible('erlaeuterungen') && (
      <Page size="A4" style={styles.page}>
        {/* Fixed Header mit zentriertem Logo - erscheint auf jeder Seite */}
        <View fixed style={{
          position: 'absolute',
          top: 12,
          left: 25,
          right: 25,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          paddingBottom: 6,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}>
          {logoUrl ? (
            <Image src={logoUrl} style={{ width: 120, height: 30, objectFit: 'contain' }} />
          ) : (
            <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', color: colors.primary }}>Imperoyal Immobilien</Text>
          )}
        </View>

        {/* Titel */}
        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.primary, textAlign: 'center' }}>
            Ergänzende Erläuterungen
          </Text>
        </View>

        {/* Verkehrswert */}
        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.primaryLight, marginBottom: 4 }}>Verkehrswert</Text>
          <Text style={{ fontSize: 8, color: colors.text, lineHeight: 1.6, textAlign: 'justify' }}>
            Der Verkehrswert (Marktwert) ist der geschätzte Betrag, für welchen eine Immobilie am Bewertungsstichtag zwischen einem verkaufsbereiten Verkäufer und einem kaufbereiten Erwerber nach angemessenem Vermarktungszeitraum in einer Transaktion im gewöhnlichen Geschäftsverkehr verkauft werden könnte, wobei jede Partei mit Sachkenntnis, Umsicht und ohne Zwang handelt. Die Ermittlung erfolgt hier auf Basis des Ertragswertverfahrens unter Verwendung der aktuellen Marktmieten und regionaler Kaufpreisfaktoren.
          </Text>
        </View>

        {/* Cashflow-Analyse */}
        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.primaryLight, marginBottom: 4 }}>Cashflow-Analyse</Text>
          <Text style={{ fontSize: 8, color: colors.text, lineHeight: 1.6, textAlign: 'justify' }}>
            Der Cashflow beschreibt den tatsächlichen Geldüberschuss aus der Immobilie nach Abzug aller laufenden Kosten. Er berechnet sich aus den Mieteinnahmen abzüglich Kapitaldienst (Zins und Tilgung), nicht umlagefähiger Betriebskosten, Instandhaltungsrücklagen und Verwaltungskosten. Ein positiver Cashflow bedeutet, dass sich die Immobilie selbst trägt und zusätzlich Liquidität generiert. Der optimierte Cashflow zeigt das Potenzial bei Ausschöpfung aller Mieterhöhungsmöglichkeiten.
          </Text>
        </View>

        {/* Mieterhöhung nach §558 BGB */}
        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.primaryLight, marginBottom: 4 }}>Mieterhöhung nach §558 BGB (Kappungsgrenze)</Text>
          <Text style={{ fontSize: 8, color: colors.text, lineHeight: 1.6, textAlign: 'justify' }}>
            Nach §558 BGB kann der Vermieter die Zustimmung zu einer Mieterhöhung bis zur ortsüblichen Vergleichsmiete verlangen, sofern die Miete seit 15 Monaten unverändert ist. Die Kappungsgrenze begrenzt die Erhöhung auf maximal 20% innerhalb von drei Jahren (in angespannten Wohnungsmärkten auf 15%). Die ortsübliche Vergleichsmiete wird anhand von Mietspiegeln, Vergleichswohnungen oder Sachverständigengutachten ermittelt. Diese Regelung gilt nur für Wohnraum mit Standardmietvertrag, nicht für Index- oder Staffelmietverträge.
          </Text>
        </View>

        {/* Modernisierungsumlage nach §559 BGB */}
        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.primaryLight, marginBottom: 4 }}>Modernisierungsumlage nach §559 BGB</Text>
          <Text style={{ fontSize: 8, color: colors.text, lineHeight: 1.6, textAlign: 'justify' }}>
            Hat der Vermieter Modernisierungsmaßnahmen durchgeführt, kann er nach §559 BGB die jährliche Miete um 8% der für die Wohnung aufgewendeten Kosten erhöhen. Die Mieterhöhung ist jedoch nach §559 Abs. 3a BGB begrenzt: Bei einer Miete unter 7€/m² darf die Miete innerhalb von 6 Jahren um maximal 2€/m² steigen, bei einer Miete ab 7€/m² um maximal 3€/m². Diese Regelung gilt nicht für Einheiten mit Indexmietvertrag.
          </Text>
        </View>

        {/* WEG-Aufteilung */}
        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.primaryLight, marginBottom: 4 }}>WEG-Aufteilung (Wohnungseigentum)</Text>
          <Text style={{ fontSize: 8, color: colors.text, lineHeight: 1.6, textAlign: 'justify' }}>
            Die Aufteilung eines Mehrfamilienhauses in Wohnungseigentum nach dem Wohnungseigentumsgesetz (WEG) ermöglicht den Einzelverkauf der Einheiten. Aufgeteilte Einheiten erzielen in der Regel höhere Quadratmeterpreise als anteilige Miteigentumsanteile am Gesamtobjekt. In Milieuschutzgebieten bedarf die Umwandlung einer behördlichen Genehmigung, die versagt werden kann. Der Aufschlag von ca. 15% auf den Gesamtwert ist ein Erfahrungswert, der je nach Markt und Lage variieren kann.
          </Text>
        </View>

        {/* AfA und Restnutzungsdauer */}
        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.primaryLight, marginBottom: 4 }}>Absetzung für Abnutzung (AfA) und Restnutzungsdauer</Text>
          <Text style={{ fontSize: 8, color: colors.text, lineHeight: 1.6, textAlign: 'justify' }}>
            Die AfA (Absetzung für Abnutzung) ist die steuerliche Abschreibung des Gebäudeanteils einer Immobilie. Bei vermieteten Wohngebäuden beträgt der jährliche AfA-Satz grundsätzlich 2% (bei Gebäuden vor 1925: 2,5%). Die Restnutzungsdauer (RND) beschreibt die verbleibende wirtschaftliche Nutzungsdauer des Gebäudes und wird auf Basis von Baujahr, Gebäudezustand und durchgeführten Modernisierungen ermittelt. Die jährliche AfA mindert die steuerliche Bemessungsgrundlage und führt bei entsprechendem Grenzsteuersatz zu einer Steuerersparnis.
          </Text>
        </View>

        {/* Eigenkapitalrendite */}
        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.primaryLight, marginBottom: 4 }}>Eigenkapitalrendite</Text>
          <Text style={{ fontSize: 8, color: colors.text, lineHeight: 1.6, textAlign: 'justify' }}>
            Die Eigenkapitalrendite (auch: Return on Equity) setzt den jährlichen Cashflow ins Verhältnis zum eingesetzten Eigenkapital. Sie zeigt die tatsächliche Verzinsung des eigenen Kapitaleinsatzes unter Berücksichtigung des Fremdkapitalhebels. Durch den Einsatz von Fremdkapital kann die Eigenkapitalrendite deutlich über der Objektrendite (Miete/Kaufpreis) liegen, birgt jedoch auch höhere Risiken bei Zinsänderungen oder Leerständen.
          </Text>
        </View>

        {/* Haftungsausschluss */}
        <View style={{ backgroundColor: colors.bgLight, borderRadius: 6, padding: 12, marginTop: 10 }}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.primary, marginBottom: 8 }}>
            Haftungsausschluss
          </Text>
          <Text style={{ fontSize: 8, color: colors.text, lineHeight: 1.6, textAlign: 'justify', marginBottom: 6 }}>
            Die vorliegende Analyse dient ausschließlich der Einschätzung des Optimierungspotenzials für die betrachtete Immobilie und unterscheidet sich insofern von einem formalen Gutachten. Die Analyse ist ausschließlich zur Nutzung durch den Auftraggeber bestimmt. Sie stellt kein Gutachten im Sinne des geltenden deutschen Rechts dar und basiert auf den Angaben des Mandanten, statistischen und öffentlich verfügbaren Marktdaten.
          </Text>
          <Text style={{ fontSize: 8, color: colors.text, lineHeight: 1.6, textAlign: 'justify', marginBottom: 6 }}>
            Für etwaige Abweichungen von tatsächlich erzielten Kauf- und/oder Verkaufspreisen und/oder Mieten wird jedwede Haftung ausgeschlossen. Insgesamt ist die Haftung auf Vorsatz und grobe Fahrlässigkeit beschränkt und auf den Betrag begrenzt, der für die Erstellung dieser Analyse erhoben wird.
          </Text>
          <Text style={{ fontSize: 8, color: colors.text, lineHeight: 1.6, textAlign: 'justify' }}>
            Diese Analyse ersetzt keine Rechts-, Steuer- oder Finanzberatung. Vor wichtigen Investitionsentscheidungen empfehlen wir die Konsultation entsprechender Fachberater (Steuerberater, Rechtsanwalt, Sachverständiger für Immobilienbewertung).
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Imperoyal Immobilien | Vertraulich</Text>
          <Text style={styles.footerCenter}>www.imperoyal-immobilien.de</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Seite ${pageNumber} von ${totalPages}`} />
        </View>
      </Page>
      )}
    </Document>
  );
}
