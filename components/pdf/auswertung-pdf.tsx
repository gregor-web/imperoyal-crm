import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from '@react-pdf/renderer';
import type { Berechnungen } from '@/lib/types';

// =====================================================
// GRAFISCHE KOMPONENTEN
// =====================================================

// Fortschrittsbalken
const ProgressBar = ({
  value,
  max = 100,
  color = '#3b82f6',
  bgColor = '#e2e8f0',
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
        <Text style={{ fontSize: 8, color: '#64748b', width: 30, textAlign: 'right' }}>
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
  colorIst = '#94a3b8',
  colorSoll = '#22c55e',
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
      <Text style={{ fontSize: 7, color: '#64748b', marginBottom: 3 }}>{label}</Text>
      <View style={{ gap: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={{ fontSize: 6, color: '#94a3b8', width: 20 }}>IST</Text>
          <View style={{ flex: 1, height: 6, backgroundColor: '#f1f5f9', borderRadius: 3 }}>
            <View style={{ width: `${istWidth}%`, height: '100%', backgroundColor: colorIst, borderRadius: 3 }} />
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={{ fontSize: 6, color: '#22c55e', width: 20 }}>SOLL</Text>
          <View style={{ flex: 1, height: 6, backgroundColor: '#f1f5f9', borderRadius: 3 }}>
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
      case 'green': return '#22c55e';
      case 'yellow': return '#eab308';
      case 'red': return '#ef4444';
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

// Mini-Sparkline (vereinfachte Version mit Balken)
const MiniChart = ({
  data,
  color = '#3b82f6',
  height = 30,
}: {
  data: number[];
  color?: string;
  height?: number;
}) => {
  const max = Math.max(...data);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2, height }}>
      {data.map((value, index) => (
        <View
          key={index}
          style={{
            flex: 1,
            height: max > 0 ? (value / max) * height : 0,
            backgroundColor: color,
            borderRadius: 2,
            opacity: 0.3 + (index / data.length) * 0.7,
          }}
        />
      ))}
    </View>
  );
};

// Donut-Segment (vereinfachte Version)
const DonutSegment = ({
  percentage,
  color,
  size = 50,
}: {
  percentage: number;
  color: string;
  size?: number;
}) => {
  // Vereinfachte visuelle Darstellung mit konzentrischen Kreisen
  const innerSize = size * 0.6;
  return (
    <View style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: color,
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <View style={{
        width: innerSize,
        height: innerSize,
        borderRadius: innerSize / 2,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Text style={{ fontSize: 8, fontWeight: 'bold', color }}>{percentage.toFixed(0)}%</Text>
      </View>
    </View>
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
  const arrowColor = direction === 'up' ? '#22c55e' : direction === 'down' ? '#ef4444' : '#94a3b8';
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

// Color constants
const colors = {
  primary: '#1e3a5f',
  primaryLight: '#3b82f6',
  text: '#1e293b',
  textMuted: '#64748b',
  textLight: '#94a3b8',
  success: '#16a34a',
  successBg: '#dcfce7',
  danger: '#dc2626',
  dangerBg: '#fee2e2',
  warning: '#eab308',
  warningBg: '#fef9c3',
  purple: '#7c3aed',
  purpleBg: '#f3e8ff',
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  bgLight: '#f8fafc',
  bgBlue: '#eff6ff',
  bgGreen: '#f0fdf4',
  bgYellow: '#fffbeb',
  bgPurple: '#faf5ff',
};

// Styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: colors.text,
    backgroundColor: '#ffffff',
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
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
    fontWeight: 'bold',
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
    backgroundColor: colors.bgLight,
    borderRadius: 6,
    marginBottom: 20,
    overflow: 'hidden',
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 3,
    fontSize: 8,
    fontWeight: 'bold',
  },
  // Sections
  sectionRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 15,
  },
  sectionBox: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgBlue,
    paddingHorizontal: 10,
    paddingVertical: 6,
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
    fontWeight: 'bold',
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
    padding: 10,
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
  // Table
  table: {
    marginTop: 5,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.bgLight,
    paddingVertical: 5,
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
  },
  tableRowAlt: {
    backgroundColor: colors.bgLight,
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
    backgroundColor: colors.bgBlue,
    paddingVertical: 5,
    paddingHorizontal: 4,
    fontWeight: 'bold',
  },
  // Info boxes
  infoBox: {
    backgroundColor: colors.bgLight,
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
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
    backgroundColor: colors.bgBlue,
    borderRadius: 8,
    padding: 20,
    marginBottom: 15,
  },
  empfehlungHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  empfehlungType: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 15,
  },
  empfehlungText: {
    fontSize: 10,
    color: colors.text,
    lineHeight: 1.6,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 6,
  },
  handlungsschritte: {
    marginTop: 15,
  },
  handlungsschrittItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 6,
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
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 6,
    marginTop: 15,
    borderLeftWidth: 3,
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
    padding: 10,
    borderRadius: 4,
    marginTop: 15,
  },
  disclaimerText: {
    fontSize: 7,
    color: colors.warning,
    textAlign: 'center',
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  footerText: {
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

const formatEuroPerSqm = (val: number | null | undefined): string =>
  val != null ? `${val.toFixed(2)} €` : '-';

interface AuswertungPDFProps {
  objekt: {
    strasse: string;
    plz: string;
    ort: string;
    baujahr?: number | null;
    milieuschutz?: boolean;
    weg_aufgeteilt?: boolean;
    kaufpreis?: number;
  };
  mandant: {
    name: string;
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
  empfehlung_fazit,
  created_at,
  logoUrl,
}: AuswertungPDFProps) {
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

  return (
    <Document>
      {/* ==================== PAGE 1 ==================== */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.date}>
              {new Date(created_at).toLocaleDateString('de-DE')}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
              {logoUrl ? (
                <Image src={logoUrl} style={{ width: 140, height: 35, objectFit: 'contain' }} />
              ) : (
                <Text style={styles.mainTitle}>Imperoyal Immobilien - Optimierungsprotokoll</Text>
              )}
            </View>
          </View>
          <View style={styles.objektInfo}>
            <Text style={styles.objektLabel}>Objekt</Text>
            <Text style={styles.objektAddress}>{objekt.strasse}</Text>
            <Text style={styles.objektAddress}>{objekt.plz} {objekt.ort}</Text>
          </View>
        </View>

        {/* Persönliche Begrüßung */}
        <View style={{
          backgroundColor: '#f8fafc',
          borderRadius: 6,
          padding: 12,
          marginBottom: 15,
          borderLeftWidth: 3,
          borderLeftColor: colors.primary,
        }}>
          <Text style={{ fontSize: 10, color: colors.text, lineHeight: 1.6 }}>
            Sehr geehrte Damen und Herren der {mandant.name},
          </Text>
          <Text style={{ fontSize: 9, color: colors.textMuted, lineHeight: 1.6, marginTop: 6 }}>
            vielen Dank für Ihr Vertrauen in Imperoyal Immobilien. Im Folgenden erhalten Sie eine umfassende Analyse
            Ihres Objekts {objekt.strasse} in {objekt.plz} {objekt.ort}. Diese Auswertung gibt Ihnen einen
            detaillierten Überblick über die aktuelle Ertragssituation, Optimierungspotenziale und strategische
            Handlungsempfehlungen. Bei Fragen stehen wir Ihnen jederzeit zur Verfügung.
          </Text>
        </View>

        {/* Key Metrics Bar - Erweitert mit Verkehrswert & AfA */}
        <View style={styles.metricsBar}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Verkehrswert*</Text>
            <Text style={styles.metricValue}>{formatCurrency(verkehrswertGeschaetzt)}</Text>
            <Text style={{ fontSize: 6, color: colors.textLight }}>({formatCurrency(fin?.kaufpreis)} Kaufpreis)</Text>
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
          backgroundColor: colors.bgPurple,
          borderRadius: 4,
          padding: 8,
          marginBottom: 15,
          alignItems: 'center',
        }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 8, color: colors.purple, fontWeight: 'bold' }}>Beleihungswert (70% d. Eigenkapitals)</Text>
            <Text style={{ fontSize: 11, color: colors.text, fontWeight: 'bold' }}>{formatCurrency(beleihungswert)}</Text>
          </View>
          <View style={{ flex: 2, paddingLeft: 10, borderLeftWidth: 1, borderLeftColor: '#e9d5ff' }}>
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
            backgroundColor: '#faf5ff',
            borderRadius: 6,
            padding: 10,
            marginBottom: 15,
            borderWidth: 1,
            borderColor: '#e9d5ff',
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#7c3aed' }}>
                Aktuelle Marktdaten
              </Text>
              <Text style={{ fontSize: 7, color: '#a78bfa', marginLeft: 'auto' }}>
                Standort: {berechnungen.marktdaten.standort}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {/* Spalte 1: Mieten & Faktoren */}
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                  <Text style={{ fontSize: 7, color: '#64748b' }}>Vergleichsmiete Wohnen</Text>
                  <Text style={{ fontSize: 7, fontWeight: 'bold', color: '#1e293b' }}>
                    {berechnungen.marktdaten.vergleichsmiete_wohnen.wert} €/m²
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                  <Text style={{ fontSize: 7, color: '#64748b' }}>Vergleichsmiete Gewerbe</Text>
                  <Text style={{ fontSize: 7, fontWeight: 'bold', color: '#1e293b' }}>
                    {berechnungen.marktdaten.vergleichsmiete_gewerbe.wert} €/m²
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                  <Text style={{ fontSize: 7, color: '#64748b' }}>Kaufpreisfaktor Region</Text>
                  <Text style={{ fontSize: 7, fontWeight: 'bold', color: '#1e293b' }}>
                    {berechnungen.marktdaten.kaufpreisfaktor_region.wert}x
                  </Text>
                </View>
              </View>
              {/* Spalte 2: Rechtliches */}
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                  <Text style={{ fontSize: 7, color: '#64748b' }}>Kappungsgrenze</Text>
                  <Text style={{
                    fontSize: 7,
                    fontWeight: 'bold',
                    color: berechnungen.marktdaten.kappungsgrenze.vorhanden ? '#dc2626' : '#16a34a'
                  }}>
                    {berechnungen.marktdaten.kappungsgrenze.prozent}% {berechnungen.marktdaten.kappungsgrenze.vorhanden ? '(angespannt)' : ''}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                  <Text style={{ fontSize: 7, color: '#64748b' }}>Milieuschutz</Text>
                  <Text style={{
                    fontSize: 7,
                    fontWeight: 'bold',
                    color: berechnungen.marktdaten.milieuschutzgebiet.vorhanden ? '#dc2626' : '#16a34a'
                  }}>
                    {berechnungen.marktdaten.milieuschutzgebiet.vorhanden ? 'Ja' : 'Nein'}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                  <Text style={{ fontSize: 7, color: '#64748b' }}>Akt. Bauzinsen</Text>
                  <Text style={{ fontSize: 7, fontWeight: 'bold', color: '#1e293b' }}>
                    {berechnungen.marktdaten.aktuelle_bauzinsen.wert}% ({berechnungen.marktdaten.aktuelle_bauzinsen.zinsbindung})
                  </Text>
                </View>
              </View>
              {/* Spalte 3: Prognose */}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 6, color: '#7c3aed', fontWeight: 'bold', marginBottom: 2 }}>Preisprognose p.a.</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                  <Text style={{ fontSize: 7, color: '#64748b' }}>0-3 Jahre</Text>
                  <TrendArrow value={berechnungen.marktdaten.preisprognose.kurz_0_3_jahre} />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                  <Text style={{ fontSize: 7, color: '#64748b' }}>3-7 Jahre</Text>
                  <TrendArrow value={berechnungen.marktdaten.preisprognose.mittel_3_7_jahre} />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 7, color: '#64748b' }}>7+ Jahre</Text>
                  <TrendArrow value={berechnungen.marktdaten.preisprognose.lang_7_plus_jahre} />
                </View>
              </View>
            </View>
            <Text style={{ fontSize: 6, color: '#a78bfa', fontStyle: 'italic', marginTop: 6 }}>
              Quelle: Perplexity AI Marktanalyse, Abfrage vom {new Date(berechnungen.marktdaten.abfrage_datum).toLocaleDateString('de-DE')}
            </Text>
          </View>
        )}

        {/* Sections 1-4 */}
        <View style={styles.sectionRow}>
          {/* Section 1: Finanzierungsprofil */}
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
            </View>
          </View>

          {/* Section 2: Ertragsprofil */}
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
                  Quelle: {marktdaten?.vergleichsmiete_wohnen?.quelle || `Mietspiegel ${objekt.ort || 'Region'}`}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sectionRow}>
          {/* Section 3: Cashflow-Analyse */}
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

          {/* Section 4: Kostenstruktur */}
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
                  { label: 'Instandhaltung', value: kosten?.instandhaltung || 0, color: '#3b82f6' },
                  { label: 'Verwaltung', value: kosten?.verwaltung || 0, color: '#8b5cf6' },
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
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Imperoyal Immobilien | Vertraulich</Text>
          <Text style={styles.footerText}>Seite 1 von 4</Text>
        </View>
      </Page>

      {/* ==================== PAGE 2 ==================== */}
      <Page size="A4" style={styles.page}>
        {/* Section 5: Mieterhöhungspotenzial Table */}
        <View style={[styles.sectionBox, { marginBottom: 15 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>5</Text>
            <Text style={styles.sectionTitle}>Mieterhöhungspotenzial (§558 gilt nur für Wohnraum)</Text>
            <Text style={styles.sectionBadge}>{einheitenMitPotenzial} von {einheitenGesamt} mit Potenzial</Text>
          </View>
          <View style={styles.sectionContent}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
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
            {/* Table Body */}
            {miet?.einheiten?.map((einheit, index) => {
              const mieterhoehung = miet.mieterhoehungen_558?.find(m => m.position === einheit.position);
              const euroPerSqm = einheit.flaeche > 0 ? einheit.kaltmiete_ist / einheit.flaeche : 0;
              const isGewerbe = einheit.nutzung === 'Gewerbe' || einheit.nutzung === 'Stellplatz';
              const marktMiete = einheit.nutzung === 'Gewerbe' ? 20 : einheit.nutzung === 'Stellplatz' ? '-' : 14;
              return (
                <View key={index} style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : {}]}>
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
            <View style={styles.tableFooter}>
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
            {/* Info Box */}
            <View style={styles.infoBox}>
              <Text style={styles.infoBoxTitle}>Hinweis §558 BGB (Kappungsgrenze):</Text>
              <Text style={styles.infoBoxText}>
                • §558 BGB gilt nur für Wohnraum. Die Miete darf innerhalb von 3 Jahren um max. {objekt.milieuschutz ? '15%' : '20%'} erhöht werden.
              </Text>
              <Text style={styles.infoBoxText}>
                • "Sofort" = Erhöhung jetzt möglich. Sperrfrist: 15 Monate nach letzter Erhöhung.
              </Text>
              <Text style={styles.infoBoxText}>
                • Gewerbe/Stellplatz: Freie Mietvertragsregelungen, keine gesetzliche Kappung.
              </Text>
              <Text style={{ fontSize: 6, color: colors.textLight, fontStyle: 'italic', marginTop: 3 }}>
                Quelle: §558 BGB, Kappungsgrenzen-VO {objekt.ort || 'Region'}
              </Text>
            </View>
          </View>
        </View>

        {/* Section 6 & 7 */}
        <View style={styles.sectionRow}>
          {/* Section 6: Cashflow IST vs. Optimiert */}
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
              <View style={{ marginBottom: 10 }}>
                <ComparisonBar
                  ist={miet?.miete_ist_jahr || 0}
                  soll={miet?.miete_soll_jahr || 0}
                  label="Mieteinnahmen p.a."
                  colorIst="#94a3b8"
                  colorSoll="#22c55e"
                />
              </View>
              {/* Cashflow-Werte */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 }}>
                <View style={{ alignItems: 'center' }}>
                  <DonutSegment
                    percentage={Math.abs(cashflow?.cashflow_ist_jahr || 0) / (miet?.miete_ist_jahr || 1) * 100}
                    color={(cashflow?.cashflow_ist_jahr || 0) >= 0 ? colors.success : colors.danger}
                    size={45}
                  />
                  <Text style={{ fontSize: 7, color: colors.textMuted, marginTop: 3 }}>IST</Text>
                  <Text style={{ fontSize: 9, fontWeight: 'bold', color: (cashflow?.cashflow_ist_jahr || 0) >= 0 ? colors.success : colors.danger }}>
                    {formatCurrencyShort(cashflow?.cashflow_ist_jahr)}
                  </Text>
                </View>
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 16, color: colors.success }}>→</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <DonutSegment
                    percentage={Math.abs(cashflow?.cashflow_opt_jahr || 0) / (miet?.miete_soll_jahr || 1) * 100}
                    color={(cashflow?.cashflow_opt_jahr || 0) >= 0 ? colors.success : colors.danger}
                    size={45}
                  />
                  <Text style={{ fontSize: 7, color: colors.textMuted, marginTop: 3 }}>OPTIMIERT</Text>
                  <Text style={{ fontSize: 9, fontWeight: 'bold', color: (cashflow?.cashflow_opt_jahr || 0) >= 0 ? colors.success : colors.danger }}>
                    {formatCurrencyShort(cashflow?.cashflow_opt_jahr)}
                  </Text>
                </View>
              </View>
              <View style={[styles.infoBox, { backgroundColor: colors.successBg }]}>
                <Text style={{ fontSize: 9, fontWeight: 'bold', color: colors.success, textAlign: 'center' }}>
                  Δ +{formatCurrency(miet?.potenzial_jahr)} p.a.
                </Text>
              </View>
              <Text style={{ fontSize: 6, color: colors.textLight, fontStyle: 'italic', textAlign: 'center', marginTop: 4 }}>
                Quelle: Eigene Berechnung auf Basis Mandantenangaben und Marktmieten
              </Text>
            </View>
          </View>

          {/* Section 7: Wertentwicklung */}
          <View style={styles.sectionBox}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionNumber}>7</Text>
              <Text style={styles.sectionTitle}>Wertentwicklung</Text>
              <View style={{ marginLeft: 'auto' }}>
                <TrendArrow value={2.5} showValue={false} />
              </View>
            </View>
            <View style={styles.sectionContent}>
              {/* Mini-Chart für Wertentwicklung */}
              <View style={{ marginBottom: 8 }}>
                <MiniChart
                  data={[
                    wert?.heute || 0,
                    wert?.jahr_3 || 0,
                    wert?.jahr_5 || 0,
                    wert?.jahr_7 || 0,
                    wert?.jahr_10 || 0,
                  ]}
                  color={colors.primaryLight}
                  height={25}
                />
              </View>
              {/* Werte unter dem Chart */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {[
                  { label: 'Heute', value: wert?.heute, pct: null },
                  { label: '+3J', value: wert?.jahr_3, pct: wert?.heute ? ((wert.jahr_3 - wert.heute) / wert.heute * 100) : 0 },
                  { label: '+5J', value: wert?.jahr_5, pct: wert?.heute ? ((wert.jahr_5 - wert.heute) / wert.heute * 100) : 0 },
                  { label: '+7J', value: wert?.jahr_7, pct: wert?.heute ? ((wert.jahr_7 - wert.heute) / wert.heute * 100) : 0 },
                  { label: '+10J', value: wert?.jahr_10, pct: wert?.heute ? ((wert.jahr_10 - wert.heute) / wert.heute * 100) : 0 },
                ].map((item, i) => (
                  <View key={i} style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 6, color: colors.textMuted }}>{item.label}</Text>
                    <Text style={{ fontSize: 8, fontWeight: 'bold' }}>{formatCurrencyShort(item.value)}</Text>
                    {item.pct !== null && (
                      <Text style={{ fontSize: 6, color: colors.success }}>+{item.pct.toFixed(0)}%</Text>
                    )}
                  </View>
                ))}
              </View>
              <Text style={{ fontSize: 6, color: colors.textLight, fontStyle: 'italic', textAlign: 'center', marginTop: 4 }}>
                Quelle: {marktdaten?.preisprognose ? 'Perplexity Marktprognose' : 'Historischer Durchschnitt DE (2,5% p.a.)'}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Imperoyal Immobilien | Vertraulich</Text>
          <Text style={styles.footerText}>Seite 2 von 4</Text>
        </View>
      </Page>

      {/* ==================== PAGE 3 ==================== */}
      <Page size="A4" style={styles.page}>
        {/* Section 8 & 9 */}
        <View style={styles.sectionRow}>
          {/* Section 8: CAPEX & §559 BGB */}
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

          {/* Section 9: WEG-Potenzial */}
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
        </View>

        {/* Section 10 & 11 */}
        <View style={styles.sectionRow}>
          {/* Section 10: RND & AfA - Erweitert */}
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

          {/* Section 11: ROI-Szenarien - Erweitert */}
          <View style={styles.sectionBox}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionNumber}>11</Text>
              <Text style={styles.sectionTitle}>Rendite-Szenarien</Text>
            </View>
            <View style={styles.sectionContent}>
              {/* Visuelle ROI-Balken */}
              <View style={{ marginBottom: 10 }}>
                {[
                  { label: 'Brutto-Rendite IST', value: rendite?.rendite_ist || 0, color: '#94a3b8' },
                  { label: 'Brutto-Rendite OPT', value: rendite?.rendite_opt || 0, color: colors.success },
                  { label: 'Nach AfA (eff.)', value: rendite_nach_steuer, color: colors.purple },
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
        </View>

        {/* Section 12: Exit-Szenarien */}
        <View style={[styles.sectionBox, { marginBottom: 15 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>12</Text>
            <Text style={styles.sectionTitle}>Exit-Szenarien</Text>
          </View>
          <View style={styles.sectionContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 8, color: colors.textMuted }}>Wert heute</Text>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.primary }}>{formatCurrency(wert?.heute)}</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 8, color: colors.textMuted }}>in 3 Jahren</Text>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.primaryLight }}>{formatCurrency(wert?.jahr_3)}</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 8, color: colors.textMuted }}>in 7 Jahren</Text>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.primaryLight }}>{formatCurrency(wert?.jahr_7)}</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 8, color: colors.textMuted }}>in 10 Jahren</Text>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.primaryLight }}>{formatCurrency(wert?.jahr_10)}</Text>
              </View>
            </View>
            <Text style={{ fontSize: 7, color: colors.textMuted, textAlign: 'center', marginTop: 8 }}>
              Annahme: {marktdaten?.preisprognose ? 'Dynamische Prognose lt. Marktdaten' : '2,5% p.a. Wertsteigerung'}
            </Text>
            <Text style={{ fontSize: 6, color: colors.textLight, fontStyle: 'italic', textAlign: 'center', marginTop: 3 }}>
              Quelle: {marktdaten?.preisprognose ? `Perplexity Marktprognose (${new Date(marktdaten.abfrage_datum).toLocaleDateString('de-DE')})` : 'Bundesbank Immobilienpreisindex (langfr. Ø)'}
            </Text>
          </View>
        </View>

        {/* NEU: Investment-Übersicht Dashboard */}
        <View style={{
          backgroundColor: colors.bgLight,
          borderRadius: 6,
          padding: 12,
          marginBottom: 15,
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
              <View style={{ height: 40, flexDirection: 'row', borderRadius: 3, overflow: 'hidden' }}>
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
              <View style={{ height: 40, flexDirection: 'row', borderRadius: 3, overflow: 'hidden' }}>
                <View style={{ flex: (fin?.kapitaldienst || 0) / (miet?.miete_ist_jahr || 1), backgroundColor: '#ef4444' }} />
                <View style={{ flex: (kosten?.kosten_gesamt || 0) / (miet?.miete_ist_jahr || 1), backgroundColor: '#f59e0b' }} />
                <View style={{ flex: Math.max(0, (cashflow?.cashflow_ist_jahr || 0)) / (miet?.miete_ist_jahr || 1), backgroundColor: '#22c55e' }} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 }}>
                <Text style={{ fontSize: 5, color: '#ef4444' }}>Kapitaldienst</Text>
                <Text style={{ fontSize: 5, color: '#f59e0b' }}>Kosten</Text>
                <Text style={{ fontSize: 5, color: '#22c55e' }}>Cashflow</Text>
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

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Imperoyal Immobilien | Vertraulich</Text>
          <Text style={styles.footerText}>Seite 3 von 4</Text>
        </View>
      </Page>

      {/* ==================== PAGE 4 ==================== */}
      <Page size="A4" style={styles.page}>
        {/* Section 13: Handlungsempfehlung */}
        <View style={[styles.sectionBox, { marginBottom: 15 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>13</Text>
            <Text style={styles.sectionTitle}>Handlungsempfehlung</Text>
            {empfehlung_prioritaet && (
              <Text style={{ marginLeft: 'auto', fontSize: 8, color: colors.textMuted }}>
                Priorität: {empfehlung_prioritaet}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.empfehlungContainer}>
          {/* Empfehlung Type */}
          <Text style={styles.empfehlungType}>{empfehlung || '-'}</Text>

          {/* Begründung */}
          {empfehlung_begruendung && (
            <Text style={styles.empfehlungText}>{empfehlung_begruendung}</Text>
          )}

          {/* Handlungsschritte */}
          {empfehlung_handlungsschritte && empfehlung_handlungsschritte.length > 0 && (
            <View style={styles.handlungsschritte}>
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.textMuted, marginBottom: 8 }}>
                Handlungsschritte
              </Text>
              {empfehlung_handlungsschritte.map((schritt, index) => {
                // Support both old (string) and new (object with zeitrahmen) format
                const isObject = typeof schritt === 'object' && schritt !== null;
                const schrittText = isObject ? schritt.schritt : schritt;
                const zeitrahmen = isObject ? schritt.zeitrahmen :
                  (index === 0 ? 'Sofort' : index === 1 ? '2 Wochen' : index === 2 ? '4 Wochen' : '8 Wochen');
                return (
                  <View key={index} style={styles.handlungsschrittItem}>
                    <Text style={styles.handlungsschrittNumber}>{index + 1}</Text>
                    <Text style={styles.handlungsschrittText}>{schrittText}</Text>
                    <Text style={styles.handlungsschrittTime}>{zeitrahmen}</Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Fazit */}
          {empfehlung_fazit && (
            <View style={styles.fazitBox}>
              <Text style={styles.fazitLabel}>Fazit:</Text>
              <Text style={styles.fazitText}>{empfehlung_fazit}</Text>
            </View>
          )}
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Diese Analyse stellt keine Rechts-, Steuer- oder Anlageberatung dar.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Imperoyal Immobilien | Vertraulich</Text>
          <Text style={styles.footerText}>Seite 4 von 4</Text>
        </View>
      </Page>
    </Document>
  );
}
