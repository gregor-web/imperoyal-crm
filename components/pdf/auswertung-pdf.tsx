import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from '@react-pdf/renderer';
import type { Berechnungen } from '@/lib/types';

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
  empfehlung_handlungsschritte?: string[];
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

  const einheitenMitPotenzial = miet?.einheiten?.filter(e => e.potenzial > 0).length || 0;
  const einheitenGesamt = miet?.einheiten?.length || 0;

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
                <Image src={logoUrl} style={{ width: 120, height: 36 }} />
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

        {/* Key Metrics Bar */}
        <View style={styles.metricsBar}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Kaufpreis</Text>
            <Text style={styles.metricValue}>{formatCurrency(fin?.kaufpreis)}</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Rendite</Text>
            <Text style={styles.metricValue}>{formatPercent(rendite?.rendite_ist)}</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Cashflow</Text>
            <Text style={(cashflow?.cashflow_ist_jahr || 0) >= 0 ? styles.metricValueGreen : styles.metricValueRed}>
              {formatCurrency(cashflow?.cashflow_ist_jahr)}
            </Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Potenzial</Text>
            <Text style={styles.metricValueGreen}>+{formatCurrency(miet?.potenzial_jahr)}</Text>
          </View>
          <View style={[styles.metricItem, styles.metricItemLast]}>
            <Text style={styles.metricLabel}>Empfehlung</Text>
            <Text style={styles.empfehlungBadge}>{empfehlung || '-'}</Text>
          </View>
        </View>

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
                  +{((miet.potenzial_jahr / miet.miete_ist_jahr) * 100).toFixed(1)}% Steigerung
                </Text>
              ) : null}
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
            </View>
          </View>

          {/* Section 4: Kostenstruktur */}
          <View style={styles.sectionBox}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionNumber}>4</Text>
              <Text style={styles.sectionTitle}>Kostenstruktur</Text>
            </View>
            <View style={styles.sectionContent}>
              <View style={styles.row}>
                <Text style={styles.label}>Instandhaltung</Text>
                <Text style={styles.value}>{formatCurrency(kosten?.instandhaltung)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Verwaltung</Text>
                <Text style={styles.value}>{formatCurrency(kosten?.verwaltung)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Nicht umlf. BK</Text>
                <Text style={styles.value}>{formatCurrency(kosten?.betriebskosten_nicht_umlage)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Rücklagen</Text>
                <Text style={styles.value}>{formatCurrency(kosten?.ruecklagen)}</Text>
              </View>
              <View style={[styles.row, styles.rowTotal]}>
                <Text style={[styles.label, { fontWeight: 'bold' }]}>Gesamt</Text>
                <Text style={[styles.value, { fontWeight: 'bold' }]}>{formatCurrency(kosten?.kosten_gesamt)}</Text>
              </View>
              <View style={[styles.kostenquoteBadge, {
                backgroundColor: kosten?.bewertung === 'gesund' ? colors.successBg :
                  kosten?.bewertung === 'durchschnittlich' ? colors.warningBg : colors.dangerBg,
                color: kosten?.bewertung === 'gesund' ? colors.success :
                  kosten?.bewertung === 'durchschnittlich' ? colors.warning : colors.danger,
              }]}>
                <Text>Kostenquote: {formatPercent(kosten?.kostenquote)}</Text>
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
            <Text style={styles.sectionTitle}>Mieterhöhungspotenzial nach Einheiten (§558 BGB)</Text>
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
              return (
                <View key={index} style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : {}]}>
                  <Text style={[styles.tableCell, { width: 20 }]}>{einheit.position}</Text>
                  <Text style={[styles.tableCell, styles.tableCellLeft, { width: 50 }]}>{einheit.nutzung}</Text>
                  <Text style={[styles.tableCell, { width: 40 }]}>{einheit.flaeche} m²</Text>
                  <Text style={[styles.tableCell, { width: 50 }]}>{formatCurrency(einheit.kaltmiete_ist)}</Text>
                  <Text style={[styles.tableCell, { width: 35 }]}>{euroPerSqm.toFixed(2)} €</Text>
                  <Text style={[styles.tableCell, { width: 35 }]}>14 €</Text>
                  <Text style={[styles.tableCell, { width: 50 }]}>{formatCurrency(einheit.kaltmiete_soll)}</Text>
                  <Text style={[styles.tableCell, { width: 50, color: einheit.potenzial > 0 ? colors.success : colors.textMuted }]}>
                    {einheit.potenzial > 0 ? `+${formatCurrency(einheit.potenzial)}` : '-'}
                  </Text>
                  <Text style={[styles.tableCell, { width: 50, color: mieterhoehung?.moeglich === 'Sofort' ? colors.success : colors.warning }]}>
                    {mieterhoehung?.moeglich || '-'}
                  </Text>
                  <Text style={[styles.tableCell, { width: 45, color: colors.success }]}>
                    {mieterhoehung?.betrag ? `+${formatCurrency(mieterhoehung.betrag)}` : '-'}
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
                Die Miete darf innerhalb von 3 Jahren um max. 15% erhöht werden (Kappungsgebiet).
                "Sofort" = Erhöhung jetzt möglich. Nach der letzten Mieterhöhung gilt eine Sperrfrist von 15 Monaten.
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
            </View>
            <View style={styles.sectionContent}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 8, color: colors.textMuted }}>IST</Text>
                  <Text style={[styles.value, { fontSize: 14, color: (cashflow?.cashflow_ist_jahr || 0) >= 0 ? colors.success : colors.danger }]}>
                    {formatCurrency(cashflow?.cashflow_ist_jahr)}
                  </Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 8, color: colors.textMuted }}>OPTIMIERT</Text>
                  <Text style={[styles.value, { fontSize: 14, color: (cashflow?.cashflow_opt_jahr || 0) >= 0 ? colors.success : colors.danger }]}>
                    {formatCurrency(cashflow?.cashflow_opt_jahr)}
                  </Text>
                </View>
              </View>
              <View style={[styles.infoBox, { backgroundColor: colors.successBg }]}>
                <Text style={{ fontSize: 9, fontWeight: 'bold', color: colors.success, textAlign: 'center' }}>
                  Optimierung: +{formatCurrency(miet?.potenzial_jahr)} p.a.
                </Text>
              </View>
            </View>
          </View>

          {/* Section 7: Wertentwicklung */}
          <View style={styles.sectionBox}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionNumber}>7</Text>
              <Text style={styles.sectionTitle}>Wertentwicklung (2,5% p.a.)</Text>
            </View>
            <View style={styles.sectionContent}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 7, color: colors.textMuted }}>Heute</Text>
                  <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{formatCurrencyShort(wert?.heute)}</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 7, color: colors.textMuted }}>+3J</Text>
                  <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{formatCurrencyShort(wert?.jahr_3)}</Text>
                  <Text style={{ fontSize: 7, color: colors.success }}>+8%</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 7, color: colors.textMuted }}>+5J</Text>
                  <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{formatCurrencyShort(wert?.jahr_5)}</Text>
                  <Text style={{ fontSize: 7, color: colors.success }}>+13%</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 7, color: colors.textMuted }}>+7J</Text>
                  <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{formatCurrencyShort(wert?.jahr_7)}</Text>
                  <Text style={{ fontSize: 7, color: colors.success }}>+19%</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 7, color: colors.textMuted }}>+10J</Text>
                  <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{formatCurrencyShort(wert?.jahr_10)}</Text>
                  <Text style={{ fontSize: 7, color: colors.success }}>+28%</Text>
                </View>
              </View>
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
            </View>
          </View>
        </View>

        {/* Section 10 & 11 */}
        <View style={styles.sectionRow}>
          {/* Section 10: RND & AfA */}
          <View style={styles.sectionBox}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionNumber}>10</Text>
              <Text style={styles.sectionTitle}>RND & AfA</Text>
            </View>
            <View style={styles.sectionContent}>
              <View style={styles.row}>
                <Text style={styles.label}>Baujahr</Text>
                <Text style={styles.value}>{afa?.baujahr || '-'}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Alter</Text>
                <Text style={styles.value}>{afa?.alter} Jahre</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Restnutzungsdauer</Text>
                <Text style={styles.value}>{afa?.rnd} Jahre</Text>
              </View>
              <View style={[styles.row, styles.rowTotal]}>
                <Text style={styles.label}>AfA-Satz</Text>
                <Text style={styles.value}>{afa?.rnd ? (100 / afa.rnd).toFixed(2) : '-'}%</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>AfA p.a.</Text>
                <Text style={[styles.value, { color: colors.primary }]}>{formatCurrency(afa?.afa_jahr)}</Text>
              </View>
              <View style={[styles.row, styles.rowLast]}>
                <Text style={styles.label}>Steuerersparnis (42%)</Text>
                <Text style={styles.valueGreen}>{formatCurrency(afa?.steuerersparnis_42)}</Text>
              </View>
            </View>
          </View>

          {/* Section 11: ROI-Szenarien */}
          <View style={styles.sectionBox}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionNumber}>11</Text>
              <Text style={styles.sectionTitle}>ROI-Szenarien</Text>
            </View>
            <View style={styles.sectionContent}>
              <View style={styles.row}>
                <Text style={styles.label}>ROI heute</Text>
                <Text style={styles.value}>{formatPercent(rendite?.rendite_ist)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>ROI optimiert</Text>
                <Text style={styles.valueGreen}>{formatPercent(rendite?.rendite_opt)}</Text>
              </View>
              <View style={[styles.row, styles.rowLast]}>
                <Text style={styles.label}>+ WEG-Aufteilung</Text>
                <Text style={styles.valueGreen}>+15%</Text>
              </View>
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
              Annahme: 2,5% p.a. Wertsteigerung
            </Text>
          </View>
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
              {empfehlung_handlungsschritte.map((schritt, index) => (
                <View key={index} style={styles.handlungsschrittItem}>
                  <Text style={styles.handlungsschrittNumber}>{index + 1}</Text>
                  <Text style={styles.handlungsschrittText}>{schritt}</Text>
                  <Text style={styles.handlungsschrittTime}>
                    {index === 0 ? '2 Wochen' : index === 1 ? '4 Wochen' : index === 2 ? '4 Wochen' : 'Sofort'}
                  </Text>
                </View>
              ))}
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
