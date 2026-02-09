import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type { Berechnungen, Erlaeuterungen } from '@/lib/types';

// Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1e293b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#1e3a5f',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3a5f',
  },
  logoSubtitle: {
    fontSize: 10,
    color: '#64748b',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e3a5f',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e3a5f',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  label: {
    color: '#64748b',
  },
  value: {
    fontWeight: 'bold',
  },
  valuePositive: {
    fontWeight: 'bold',
    color: '#16a34a',
  },
  valueNegative: {
    fontWeight: 'bold',
    color: '#dc2626',
  },
  grid: {
    flexDirection: 'row',
    gap: 20,
  },
  gridItem: {
    flex: 1,
  },
  badge: {
    backgroundColor: '#3b82f6',
    color: 'white',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 10,
    alignSelf: 'flex-start',
  },
  badgeSuccess: {
    backgroundColor: '#16a34a',
  },
  badgeWarning: {
    backgroundColor: '#eab308',
  },
  badgeDanger: {
    backgroundColor: '#dc2626',
  },
  empfehlungBox: {
    backgroundColor: '#eff6ff',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    marginBottom: 20,
  },
  empfehlungTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e3a5f',
    marginBottom: 5,
  },
  empfehlungText: {
    fontSize: 10,
    color: '#475569',
    lineHeight: 1.5,
  },
  erlaeuterung: {
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 4,
    marginTop: 10,
  },
  erlaeuterungText: {
    fontSize: 9,
    color: '#64748b',
    fontStyle: 'italic',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: '#94a3b8',
  },
  list: {
    marginLeft: 10,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  listBullet: {
    width: 15,
    color: '#3b82f6',
  },
  listText: {
    flex: 1,
    color: '#475569',
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

const formatPercent = (val: number | null | undefined, digits = 2): string =>
  val != null ? `${val.toFixed(digits)}%` : '-';

interface AuswertungPDFProps {
  objekt: {
    strasse: string;
    plz: string;
    ort: string;
  };
  mandant: {
    name: string;
  };
  berechnungen: Berechnungen;
  erlaeuterungen?: Erlaeuterungen;
  empfehlung?: string;
  empfehlung_begruendung?: string;
  empfehlung_prioritaet?: string;
  empfehlung_handlungsschritte?: string[];
  empfehlung_chancen?: string[];
  empfehlung_risiken?: string[];
  empfehlung_fazit?: string;
  created_at: string;
}

export function AuswertungPDF({
  objekt,
  mandant,
  berechnungen,
  erlaeuterungen,
  empfehlung,
  empfehlung_begruendung,
  empfehlung_prioritaet,
  empfehlung_handlungsschritte,
  empfehlung_chancen,
  empfehlung_risiken,
  empfehlung_fazit,
  created_at,
}: AuswertungPDFProps) {
  const fin = berechnungen?.finanzierung;
  const kosten = berechnungen?.kostenstruktur;
  const cashflow = berechnungen?.cashflow;
  const rendite = berechnungen?.rendite;
  const miet = berechnungen?.mietanalyse;
  const weg = berechnungen?.weg_potenzial;
  const afa = berechnungen?.afa_rnd;
  const wert = berechnungen?.wertentwicklung;

  return (
    <Document>
      {/* Page 1 - Overview */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>Imperoyal</Text>
            <Text style={styles.logoSubtitle}>Immobilien</Text>
          </View>
          <View style={{ textAlign: 'right' }}>
            <Text style={{ fontSize: 10, color: '#64748b' }}>Auswertung vom</Text>
            <Text style={{ fontSize: 12, fontWeight: 'bold' }}>
              {new Date(created_at).toLocaleDateString('de-DE')}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>{objekt.strasse}</Text>
        <Text style={styles.subtitle}>
          {objekt.plz} {objekt.ort} | {mandant.name}
        </Text>

        {/* Empfehlung Box */}
        {empfehlung && (
          <View style={styles.empfehlungBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Text
                style={[
                  styles.badge,
                  empfehlung === 'VERKAUFEN'
                    ? styles.badgeDanger
                    : empfehlung === 'OPTIMIEREN' || empfehlung === 'RESTRUKTURIEREN'
                    ? styles.badgeWarning
                    : styles.badgeSuccess,
                ]}
              >
                {empfehlung}
              </Text>
              {empfehlung_prioritaet && (
                <Text style={{ marginLeft: 10, fontSize: 10, color: '#64748b' }}>
                  Priorität: {empfehlung_prioritaet}
                </Text>
              )}
            </View>
            <Text style={styles.empfehlungText}>{empfehlung_begruendung}</Text>
          </View>
        )}

        {/* Key Metrics Grid */}
        <View style={[styles.grid, { marginBottom: 20 }]}>
          <View style={[styles.gridItem, { backgroundColor: '#f0f9ff', padding: 10, borderRadius: 4 }]}>
            <Text style={{ fontSize: 9, color: '#64748b' }}>Kaufpreis</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1e3a5f' }}>
              {formatCurrency(fin?.kaufpreis)}
            </Text>
          </View>
          <View style={[styles.gridItem, { backgroundColor: '#f0fdf4', padding: 10, borderRadius: 4 }]}>
            <Text style={{ fontSize: 9, color: '#64748b' }}>Rendite IST</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#16a34a' }}>
              {formatPercent(rendite?.rendite_ist)}
            </Text>
          </View>
          <View style={[styles.gridItem, { backgroundColor: '#fffbeb', padding: 10, borderRadius: 4 }]}>
            <Text style={{ fontSize: 9, color: '#64748b' }}>Cashflow IST</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: cashflow?.cashflow_ist_jahr >= 0 ? '#16a34a' : '#dc2626' }}>
              {formatCurrency(cashflow?.cashflow_ist_jahr)}
            </Text>
          </View>
          <View style={[styles.gridItem, { backgroundColor: '#faf5ff', padding: 10, borderRadius: 4 }]}>
            <Text style={{ fontSize: 9, color: '#64748b' }}>Mietpotenzial</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#7c3aed' }}>
              {formatCurrency(miet?.potenzial_jahr)}
            </Text>
          </View>
        </View>

        {/* Finanzierung & Kosten */}
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Finanzierungsprofil</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Eigenkapital</Text>
                <Text style={styles.value}>{formatCurrency(fin?.eigenkapital)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Fremdkapital</Text>
                <Text style={styles.value}>{formatCurrency(fin?.fremdkapital)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Zinssatz</Text>
                <Text style={styles.value}>{formatPercent(fin?.zinssatz)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Tilgung</Text>
                <Text style={styles.value}>{formatPercent(fin?.tilgung)}</Text>
              </View>
              <View style={[styles.row, { borderTopWidth: 1, borderTopColor: '#e2e8f0', marginTop: 5, paddingTop: 5 }]}>
                <Text style={[styles.label, { fontWeight: 'bold' }]}>Kapitaldienst p.a.</Text>
                <Text style={styles.valueNegative}>{formatCurrency(fin?.kapitaldienst)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.gridItem}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Kostenstruktur</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Betriebskosten</Text>
                <Text style={styles.value}>{formatCurrency(kosten?.betriebskosten_nicht_umlage)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Instandhaltung</Text>
                <Text style={styles.value}>{formatCurrency(kosten?.instandhaltung)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Verwaltung</Text>
                <Text style={styles.value}>{formatCurrency(kosten?.verwaltung)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Rücklagen</Text>
                <Text style={styles.value}>{formatCurrency(kosten?.ruecklagen)}</Text>
              </View>
              <View style={[styles.row, { borderTopWidth: 1, borderTopColor: '#e2e8f0', marginTop: 5, paddingTop: 5 }]}>
                <Text style={[styles.label, { fontWeight: 'bold' }]}>Kostenquote</Text>
                <Text style={styles.value}>
                  {formatPercent(kosten?.kostenquote)} ({kosten?.bewertung})
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Imperoyal Immobilien | Vertraulich</Text>
          <Text style={styles.footerText}>Seite 1 von 2</Text>
        </View>
      </Page>

      {/* Page 2 - Details & Empfehlungen */}
      <Page size="A4" style={styles.page}>
        {/* Cashflow & Rendite */}
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cashflow-Analyse</Text>
              <View style={styles.row}>
                <Text style={styles.label}>IST (jährlich)</Text>
                <Text style={cashflow?.cashflow_ist_jahr >= 0 ? styles.valuePositive : styles.valueNegative}>
                  {formatCurrency(cashflow?.cashflow_ist_jahr)}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Optimiert (jährlich)</Text>
                <Text style={cashflow?.cashflow_opt_jahr >= 0 ? styles.valuePositive : styles.valueNegative}>
                  {formatCurrency(cashflow?.cashflow_opt_jahr)}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Rendite IST</Text>
                <Text style={styles.value}>{formatPercent(rendite?.rendite_ist)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Rendite Optimiert</Text>
                <Text style={styles.valuePositive}>{formatPercent(rendite?.rendite_opt)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.gridItem}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>WEG-Potenzial</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Wert heute</Text>
                <Text style={styles.value}>{formatCurrency(weg?.wert_heute)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Wert aufgeteilt (+15%)</Text>
                <Text style={styles.value}>{formatCurrency(weg?.wert_aufgeteilt)}</Text>
              </View>
              <View style={[styles.row, { borderTopWidth: 1, borderTopColor: '#e2e8f0', marginTop: 5, paddingTop: 5 }]}>
                <Text style={[styles.label, { fontWeight: 'bold' }]}>Potenzial</Text>
                <Text style={styles.valuePositive}>{formatCurrency(weg?.weg_gewinn)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* AfA & Wertentwicklung */}
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>AfA / Restnutzungsdauer</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Baujahr / Alter</Text>
                <Text style={styles.value}>{afa?.baujahr} / {afa?.alter} Jahre</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Restnutzungsdauer</Text>
                <Text style={styles.value}>{afa?.rnd} Jahre</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>AfA p.a.</Text>
                <Text style={styles.value}>{formatCurrency(afa?.afa_jahr)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Steuerersparnis (42%)</Text>
                <Text style={styles.valuePositive}>{formatCurrency(afa?.steuerersparnis_42)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.gridItem}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Wertentwicklung (2,5% p.a.)</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Heute</Text>
                <Text style={styles.value}>{formatCurrency(wert?.heute)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>+ 5 Jahre</Text>
                <Text style={styles.value}>{formatCurrency(wert?.jahr_5)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>+ 10 Jahre</Text>
                <Text style={styles.valuePositive}>{formatCurrency(wert?.jahr_10)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Handlungsempfehlungen */}
        {(empfehlung_handlungsschritte || empfehlung_chancen || empfehlung_risiken) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Handlungsempfehlungen</Text>
            <View style={styles.grid}>
              {empfehlung_handlungsschritte && (
                <View style={styles.gridItem}>
                  <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 5 }}>Nächste Schritte</Text>
                  <View style={styles.list}>
                    {empfehlung_handlungsschritte.map((schritt, i) => (
                      <View key={i} style={styles.listItem}>
                        <Text style={styles.listBullet}>{i + 1}.</Text>
                        <Text style={styles.listText}>{schritt}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              {empfehlung_chancen && (
                <View style={styles.gridItem}>
                  <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 5, color: '#16a34a' }}>Chancen</Text>
                  <View style={styles.list}>
                    {empfehlung_chancen.map((chance, i) => (
                      <View key={i} style={styles.listItem}>
                        <Text style={[styles.listBullet, { color: '#16a34a' }]}>+</Text>
                        <Text style={styles.listText}>{chance}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              {empfehlung_risiken && (
                <View style={styles.gridItem}>
                  <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 5, color: '#dc2626' }}>Risiken</Text>
                  <View style={styles.list}>
                    {empfehlung_risiken.map((risiko, i) => (
                      <View key={i} style={styles.listItem}>
                        <Text style={[styles.listBullet, { color: '#dc2626' }]}>!</Text>
                        <Text style={styles.listText}>{risiko}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Fazit */}
        {empfehlung_fazit && (
          <View style={[styles.section, { backgroundColor: '#f8fafc', padding: 15, borderRadius: 8 }]}>
            <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 5 }}>Fazit</Text>
            <Text style={{ fontSize: 10, color: '#475569', lineHeight: 1.5 }}>{empfehlung_fazit}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Imperoyal Immobilien | Vertraulich</Text>
          <Text style={styles.footerText}>Seite 2 von 2</Text>
        </View>
      </Page>
    </Document>
  );
}
