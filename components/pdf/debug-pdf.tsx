import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type { Berechnungen } from '@/lib/types';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: '#1e293b',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e3a5f',
  },
  subtitle: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 3,
  },
  section: {
    marginBottom: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    padding: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e3a5f',
    marginBottom: 6,
    backgroundColor: '#e0f2fe',
    padding: 4,
    borderRadius: 2,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  label: {
    flex: 2,
    color: '#64748b',
    fontSize: 7,
  },
  formula: {
    flex: 3,
    color: '#7c3aed',
    fontSize: 7,
    fontFamily: 'Courier',
  },
  value: {
    flex: 1,
    textAlign: 'right',
    fontWeight: 'bold',
    fontSize: 7,
  },
  highlight: {
    backgroundColor: '#fef3c7',
    padding: 2,
    borderRadius: 2,
  },
  note: {
    fontSize: 6,
    color: '#94a3b8',
    fontStyle: 'italic',
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 6,
    fontSize: 7,
    color: '#94a3b8',
  },
});

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

interface DebugPDFProps {
  objekt: {
    strasse: string;
    plz: string;
    ort: string;
    baujahr?: number | null;
    kaufpreis?: number;
    milieuschutz?: boolean;
    weg_aufgeteilt?: boolean;
  };
  berechnungen: Berechnungen;
  created_at: string;
}

export function DebugPDF({ objekt, berechnungen, created_at }: DebugPDFProps) {
  const fin = berechnungen?.finanzierung;
  const miet = berechnungen?.mietanalyse;
  const kosten = berechnungen?.kostenstruktur;
  const cashflow = berechnungen?.cashflow;
  const rendite = berechnungen?.rendite;
  const weg = berechnungen?.weg_potenzial;
  const afa = berechnungen?.afa_rnd;
  const wert = berechnungen?.wertentwicklung;
  const mod559 = berechnungen?.modernisierung_559;
  const marktdaten = berechnungen?.marktdaten;

  return (
    <Document>
      {/* PAGE 1 */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>DEBUG: Berechnungsprotokoll</Text>
          <Text style={styles.subtitle}>
            {objekt.strasse}, {objekt.plz} {objekt.ort} | Erstellt: {new Date(created_at).toLocaleDateString('de-DE')}
          </Text>
        </View>

        {/* 1. EINGABEWERTE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. EINGABEWERTE (aus Objekt/Mandant)</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Kaufpreis</Text>
            <Text style={styles.formula}>objekt.kaufpreis</Text>
            <Text style={styles.value}>{formatCurrency(fin?.kaufpreis)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Eigenkapital-Quote</Text>
            <Text style={styles.formula}>objekt.eigenkapital_prozent</Text>
            <Text style={styles.value}>{formatPercent((fin?.eigenkapital || 0) / (fin?.kaufpreis || 1) * 100, 0)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Zinssatz</Text>
            <Text style={styles.formula}>objekt.zinssatz</Text>
            <Text style={styles.value}>{formatPercent(fin?.zinssatz, 1)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tilgung</Text>
            <Text style={styles.formula}>objekt.tilgung</Text>
            <Text style={styles.value}>{formatPercent(fin?.tilgung, 0)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Baujahr</Text>
            <Text style={styles.formula}>objekt.baujahr</Text>
            <Text style={styles.value}>{afa?.baujahr || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Milieuschutz</Text>
            <Text style={styles.formula}>objekt.milieuschutz</Text>
            <Text style={styles.value}>{objekt.milieuschutz ? 'Ja' : 'Nein'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>WEG aufgeteilt</Text>
            <Text style={styles.formula}>objekt.weg_aufgeteilt</Text>
            <Text style={styles.value}>{objekt.weg_aufgeteilt ? 'Ja' : 'Nein'}</Text>
          </View>
        </View>

        {/* 2. FINANZIERUNG */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. FINANZIERUNG</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Eigenkapital</Text>
            <Text style={styles.formula}>kaufpreis × (ek_prozent / 100)</Text>
            <Text style={styles.value}>{formatCurrency(fin?.eigenkapital)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Fremdkapital</Text>
            <Text style={styles.formula}>kaufpreis - eigenkapital</Text>
            <Text style={styles.value}>{formatCurrency(fin?.fremdkapital)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Kapitaldienst p.a.</Text>
            <Text style={styles.formula}>fremdkapital × ((zins + tilg) / 100)</Text>
            <Text style={styles.value}>{formatCurrency(fin?.kapitaldienst)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Kapitaldienst p.m.</Text>
            <Text style={styles.formula}>kapitaldienst / 12</Text>
            <Text style={styles.value}>{formatCurrency(fin?.kapitaldienst_monat)}</Text>
          </View>
          <Text style={styles.note}>
            Berechnung: {formatCurrency(fin?.fremdkapital)} × (({fin?.zinssatz}% + {fin?.tilgung}%) / 100) = {formatCurrency(fin?.kapitaldienst)}
          </Text>
        </View>

        {/* 3. MIETANALYSE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. MIETANALYSE</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Miete IST (Monat)</Text>
            <Text style={styles.formula}>SUM(einheiten.kaltmiete)</Text>
            <Text style={styles.value}>{formatCurrency(miet?.miete_ist_monat)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Miete IST (Jahr)</Text>
            <Text style={styles.formula}>miete_ist_monat × 12</Text>
            <Text style={styles.value}>{formatCurrency(miet?.miete_ist_jahr)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Miete SOLL (Monat)</Text>
            <Text style={styles.formula}>SUM(max(kaltmiete, flaeche × vergleichsmiete))</Text>
            <Text style={styles.value}>{formatCurrency(miet?.miete_soll_monat)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Miete SOLL (Jahr)</Text>
            <Text style={styles.formula}>miete_soll_monat × 12</Text>
            <Text style={styles.value}>{formatCurrency(miet?.miete_soll_jahr)}</Text>
          </View>
          <View style={[styles.row, styles.highlight]}>
            <Text style={styles.label}>Potenzial (Jahr)</Text>
            <Text style={styles.formula}>miete_soll_jahr - miete_ist_jahr</Text>
            <Text style={styles.value}>{formatCurrency(miet?.potenzial_jahr)}</Text>
          </View>
          <Text style={styles.note}>
            Einheiten: {miet?.einheiten?.length || 0} | Mit Potenzial: {miet?.einheiten?.filter(e => e.potenzial > 0).length || 0}
          </Text>
        </View>

        {/* 4. KOSTENSTRUKTUR */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. KOSTENSTRUKTUR</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Betriebskosten (nicht umlf.)</Text>
            <Text style={styles.formula}>objekt.betriebskosten_nicht_umlage</Text>
            <Text style={styles.value}>{formatCurrency(kosten?.betriebskosten_nicht_umlage)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Instandhaltung</Text>
            <Text style={styles.formula}>objekt.instandhaltung</Text>
            <Text style={styles.value}>{formatCurrency(kosten?.instandhaltung)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Verwaltung</Text>
            <Text style={styles.formula}>objekt.verwaltung</Text>
            <Text style={styles.value}>{formatCurrency(kosten?.verwaltung)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Rücklagen</Text>
            <Text style={styles.formula}>objekt.ruecklagen</Text>
            <Text style={styles.value}>{formatCurrency(kosten?.ruecklagen)}</Text>
          </View>
          <View style={[styles.row, styles.highlight]}>
            <Text style={styles.label}>Kosten Gesamt</Text>
            <Text style={styles.formula}>SUM(alle Kosten)</Text>
            <Text style={styles.value}>{formatCurrency(kosten?.kosten_gesamt)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Kostenquote</Text>
            <Text style={styles.formula}>kosten_gesamt / miete_ist_jahr × 100</Text>
            <Text style={styles.value}>{formatPercent(kosten?.kostenquote)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Bewertung</Text>
            <Text style={styles.formula}>{'<25%: gesund | 25-35%: durchschn. | >35%: erhöht'}</Text>
            <Text style={styles.value}>{kosten?.bewertung}</Text>
          </View>
        </View>

        {/* 5. CASHFLOW */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. CASHFLOW</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Cashflow IST (Jahr)</Text>
            <Text style={styles.formula}>miete_ist - kapitaldienst - kosten</Text>
            <Text style={styles.value}>{formatCurrency(cashflow?.cashflow_ist_jahr)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Cashflow OPT (Jahr)</Text>
            <Text style={styles.formula}>miete_soll - kapitaldienst - kosten</Text>
            <Text style={styles.value}>{formatCurrency(cashflow?.cashflow_opt_jahr)}</Text>
          </View>
          <Text style={styles.note}>
            IST: {formatCurrency(miet?.miete_ist_jahr)} - {formatCurrency(fin?.kapitaldienst)} - {formatCurrency(kosten?.kosten_gesamt)} = {formatCurrency(cashflow?.cashflow_ist_jahr)}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>Imperoyal Immobilien | Debug-Protokoll</Text>
          <Text>Seite 1 von 2</Text>
        </View>
      </Page>

      {/* PAGE 2 */}
      <Page size="A4" style={styles.page}>
        {/* 6. RENDITE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. RENDITE</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Brutto-Rendite IST</Text>
            <Text style={styles.formula}>miete_ist_jahr / kaufpreis × 100</Text>
            <Text style={styles.value}>{formatPercent(rendite?.rendite_ist)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Brutto-Rendite OPT</Text>
            <Text style={styles.formula}>miete_soll_jahr / kaufpreis × 100</Text>
            <Text style={styles.value}>{formatPercent(rendite?.rendite_opt)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>EK-Rendite IST</Text>
            <Text style={styles.formula}>cashflow_ist / eigenkapital × 100</Text>
            <Text style={styles.value}>{formatPercent(rendite?.eigenkapitalrendite_ist)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>EK-Rendite OPT</Text>
            <Text style={styles.formula}>cashflow_opt / eigenkapital × 100</Text>
            <Text style={styles.value}>{formatPercent(rendite?.eigenkapitalrendite_opt)}</Text>
          </View>
          <Text style={styles.note}>
            Brutto IST: {formatCurrency(miet?.miete_ist_jahr)} / {formatCurrency(fin?.kaufpreis)} × 100 = {formatPercent(rendite?.rendite_ist)}
          </Text>
        </View>

        {/* 7. VERKEHRSWERT */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. VERKEHRSWERT (Ertragswertverfahren)</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Kaufpreisfaktor</Text>
            <Text style={styles.formula}>marktdaten?.kaufpreisfaktor || 20</Text>
            <Text style={styles.value}>{marktdaten?.kaufpreisfaktor_region?.wert || 20}x</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Verkehrswert (Ertrag)</Text>
            <Text style={styles.formula}>jahresmiete × kaufpreisfaktor</Text>
            <Text style={styles.value}>{formatCurrency((miet?.miete_ist_jahr || 0) * (marktdaten?.kaufpreisfaktor_region?.wert || 20))}</Text>
          </View>
          <View style={[styles.row, styles.highlight]}>
            <Text style={styles.label}>Verkehrswert HEUTE</Text>
            <Text style={styles.formula}>MAX(kaufpreis, ertragswert)</Text>
            <Text style={styles.value}>{formatCurrency(wert?.heute)}</Text>
          </View>
          <Text style={styles.note}>
            MAX({formatCurrency(fin?.kaufpreis)}, {formatCurrency((miet?.miete_ist_jahr || 0) * (marktdaten?.kaufpreisfaktor_region?.wert || 20))}) = {formatCurrency(wert?.heute)}
          </Text>
        </View>

        {/* 8. BELEIHUNGSWERT */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. BELEIHUNGSWERT</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Restschuld (Fremdkapital)</Text>
            <Text style={styles.formula}>finanzierung.fremdkapital</Text>
            <Text style={styles.value}>{formatCurrency(fin?.fremdkapital)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Abbezahlte Summe</Text>
            <Text style={styles.formula}>verkehrswert - restschuld</Text>
            <Text style={styles.value}>{formatCurrency((wert?.heute || 0) - (fin?.fremdkapital || 0))}</Text>
          </View>
          <View style={[styles.row, styles.highlight]}>
            <Text style={styles.label}>Beleihungswert (70%)</Text>
            <Text style={styles.formula}>abbezahlt × 0.70</Text>
            <Text style={styles.value}>{formatCurrency(((wert?.heute || 0) - (fin?.fremdkapital || 0)) * 0.7)}</Text>
          </View>
          <Text style={styles.note}>
            ({formatCurrency(wert?.heute)} - {formatCurrency(fin?.fremdkapital)}) × 0.70 = {formatCurrency(((wert?.heute || 0) - (fin?.fremdkapital || 0)) * 0.7)}
          </Text>
        </View>

        {/* 9. WEG-POTENZIAL */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. WEG-POTENZIAL</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Wert heute</Text>
            <Text style={styles.formula}>verkehrswert_heute</Text>
            <Text style={styles.value}>{formatCurrency(weg?.wert_heute)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Wert aufgeteilt</Text>
            <Text style={styles.formula}>verkehrswert × 1.15</Text>
            <Text style={styles.value}>{formatCurrency(weg?.wert_aufgeteilt)}</Text>
          </View>
          <View style={[styles.row, styles.highlight]}>
            <Text style={styles.label}>WEG-Gewinn</Text>
            <Text style={styles.formula}>aufgeteilt - heute (wenn nicht bereits)</Text>
            <Text style={styles.value}>{formatCurrency(weg?.weg_gewinn)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Bereits aufgeteilt?</Text>
            <Text style={styles.formula}>objekt.weg_aufgeteilt</Text>
            <Text style={styles.value}>{weg?.bereits_aufgeteilt ? 'Ja' : 'Nein'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Genehmigung nötig?</Text>
            <Text style={styles.formula}>milieuschutz || umwandlungsverbot</Text>
            <Text style={styles.value}>{weg?.genehmigung_erforderlich ? 'Ja' : 'Nein'}</Text>
          </View>
        </View>

        {/* 10. AfA / RND */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. AfA / RND</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Baujahr</Text>
            <Text style={styles.formula}>objekt.baujahr || 1970</Text>
            <Text style={styles.value}>{afa?.baujahr}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Alter</Text>
            <Text style={styles.formula}>aktuellesJahr - baujahr</Text>
            <Text style={styles.value}>{afa?.alter} Jahre</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>RND (Restnutzungsdauer)</Text>
            <Text style={styles.formula}>MAX(10, MIN(80, 80 - alter))</Text>
            <Text style={styles.value}>{afa?.rnd} Jahre</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Gebäudewert</Text>
            <Text style={styles.formula}>kaufpreis × 0.8</Text>
            <Text style={styles.value}>{formatCurrency(afa?.gebaeude_wert)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>AfA p.a.</Text>
            <Text style={styles.formula}>gebaeudewert / rnd</Text>
            <Text style={styles.value}>{formatCurrency(afa?.afa_jahr)}</Text>
          </View>
          <View style={[styles.row, styles.highlight]}>
            <Text style={styles.label}>Steuerersparnis (42%)</Text>
            <Text style={styles.formula}>afa_jahr × 0.42</Text>
            <Text style={styles.value}>{formatCurrency(afa?.steuerersparnis_42)}</Text>
          </View>
        </View>

        {/* 11. WERTENTWICKLUNG */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. WERTENTWICKLUNG</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Prognose 0-3J</Text>
            <Text style={styles.formula}>marktdaten?.prognose?.kurz || 2.5%</Text>
            <Text style={styles.value}>{formatPercent(marktdaten?.preisprognose?.kurz_0_3_jahre ?? 2.5)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Prognose 3-7J</Text>
            <Text style={styles.formula}>marktdaten?.prognose?.mittel || 2.5%</Text>
            <Text style={styles.value}>{formatPercent(marktdaten?.preisprognose?.mittel_3_7_jahre ?? 2.5)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Prognose 7+J</Text>
            <Text style={styles.formula}>marktdaten?.prognose?.lang || 2.5%</Text>
            <Text style={styles.value}>{formatPercent(marktdaten?.preisprognose?.lang_7_plus_jahre ?? 2.5)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Wert +3 Jahre</Text>
            <Text style={styles.formula}>heute × (1 + kurz/100)^3</Text>
            <Text style={styles.value}>{formatCurrency(wert?.jahr_3)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Wert +7 Jahre</Text>
            <Text style={styles.formula}>wert_3j × (1 + mittel/100)^4</Text>
            <Text style={styles.value}>{formatCurrency(wert?.jahr_7)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Wert +10 Jahre</Text>
            <Text style={styles.formula}>wert_7j × (1 + lang/100)^3</Text>
            <Text style={styles.value}>{formatCurrency(wert?.jahr_10)}</Text>
          </View>
        </View>

        {/* 12. §559 MODERNISIERUNG */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>12. §559 MODERNISIERUNGSUMLAGE</Text>
          <View style={styles.row}>
            <Text style={styles.label}>CAPEX Betrag</Text>
            <Text style={styles.formula}>objekt.capex_geplant_betrag</Text>
            <Text style={styles.value}>{formatCurrency(mod559?.capex_betrag)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>8% Umlage (roh)</Text>
            <Text style={styles.formula}>capex × 0.08</Text>
            <Text style={styles.value}>{formatCurrency(mod559?.umlage_8_prozent)}</Text>
          </View>
          <View style={[styles.row, styles.highlight]}>
            <Text style={styles.label}>Umlage nach Kappung</Text>
            <Text style={styles.formula}>MIN(8%, Kappungsgrenzen)</Text>
            <Text style={styles.value}>{formatCurrency(mod559?.umlage_nach_kappung)}</Text>
          </View>
          <Text style={styles.note}>
            Kappung §559 3a BGB: Miete {'<'} 7€/m² = max 2€/m² in 6J | Miete ≥ 7€/m² = max 3€/m² in 6J
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>Imperoyal Immobilien | Debug-Protokoll</Text>
          <Text>Seite 2 von 2</Text>
        </View>
      </Page>
    </Document>
  );
}
