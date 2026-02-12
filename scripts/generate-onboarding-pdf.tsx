import { renderToFile } from '@react-pdf/renderer';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Brand Colors
const COLORS = {
  royalNavy: '#1E2A3A',
  royalNavyMedium: '#2A3F54',
  royalNavyLight: '#3D5167',
  growthBlue: '#5B7A9D',
  growthBlueDark: '#4A6A8D',
  growthBlueLight: '#6B8AAD',
  blueBone: '#B8C5D1',
  blueBoneDark: '#9EAFC0',
  blueBoneLight: '#D5DEE6',
  blueBoneLightest: '#EDF1F5',
  white: '#FFFFFF',
  purple: '#7C3AED',
  green: '#22C55E',
  orange: '#F59E0B',
  red: '#EF4444',
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingBottom: 50,
    paddingHorizontal: 35,
    fontFamily: 'Helvetica',
    fontSize: 9,
    backgroundColor: COLORS.white,
  },
  header: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottom: `2px solid ${COLORS.royalNavy}`,
  },
  logo: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.royalNavy,
    letterSpacing: 1,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.royalNavy,
    marginTop: 2,
  },
  subtitle: {
    fontSize: 9,
    color: COLORS.growthBlue,
  },
  pageTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.royalNavy,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottom: `1px solid ${COLORS.blueBone}`,
  },
  flowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    padding: 12,
    backgroundColor: COLORS.blueBoneLightest,
    borderRadius: 6,
  },
  flowStep: {
    alignItems: 'center',
    width: '22%',
  },
  flowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  flowNumber: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
  },
  flowLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.royalNavy,
    textAlign: 'center',
  },
  flowSublabel: {
    fontSize: 6,
    color: COLORS.growthBlue,
    textAlign: 'center',
  },
  flowArrow: {
    fontSize: 16,
    color: COLORS.blueBone,
    marginTop: 8,
  },
  section: {
    marginBottom: 8,
    padding: 8,
    backgroundColor: COLORS.blueBoneLightest,
    borderRadius: 4,
    borderLeft: `3px solid ${COLORS.growthBlue}`,
  },
  sectionGreen: { borderLeftColor: COLORS.green },
  sectionPurple: { borderLeftColor: COLORS.purple },
  sectionOrange: { borderLeftColor: COLORS.orange },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.royalNavy,
    marginBottom: 4,
  },
  infoBox: {
    backgroundColor: '#E0F2FE',
    padding: 6,
    borderRadius: 4,
    marginBottom: 8,
    borderLeft: `3px solid #0EA5E9`,
  },
  warningBox: {
    backgroundColor: COLORS.blueBoneLight,
    padding: 6,
    borderRadius: 4,
    marginTop: 4,
    borderLeft: `3px solid ${COLORS.royalNavyLight}`,
  },
  infoText: {
    fontSize: 8,
    color: '#0369A1',
    lineHeight: 1.3,
  },
  warningText: {
    fontSize: 7,
    color: COLORS.royalNavy,
    lineHeight: 1.3,
  },
  table: { marginTop: 4 },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.royalNavy,
    padding: 4,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  tableHeaderCell: {
    color: COLORS.white,
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 4,
    borderBottom: `1px solid ${COLORS.blueBone}`,
    backgroundColor: COLORS.white,
  },
  tableRowAlt: { backgroundColor: COLORS.blueBoneLightest },
  tableCell: {
    fontSize: 7,
    color: COLORS.royalNavy,
  },
  required: { color: COLORS.red },
  toggleBox: {
    backgroundColor: '#F0FDF4',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
    border: `1px solid ${COLORS.green}`,
  },
  toggleTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.green,
    marginBottom: 4,
  },
  autoBox: {
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
    border: `1px dashed ${COLORS.orange}`,
  },
  autoTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#B45309',
    marginBottom: 4,
  },
  bulletList: { marginTop: 2 },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  bullet: {
    width: 10,
    fontSize: 7,
    color: COLORS.growthBlue,
  },
  bulletText: {
    flex: 1,
    fontSize: 7,
    color: COLORS.royalNavy,
    lineHeight: 1.3,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 35,
    right: 35,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTop: `1px solid ${COLORS.blueBone}`,
  },
  footerText: {
    fontSize: 7,
    color: COLORS.growthBlue,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  chip: {
    backgroundColor: COLORS.blueBone,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
    fontSize: 6,
    color: COLORS.royalNavy,
    marginRight: 2,
    marginBottom: 2,
  },
  subHeader: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.royalNavy,
    marginBottom: 2,
    marginTop: 4,
  },
  colorRow: {
    flexDirection: 'row',
    marginBottom: 2,
    alignItems: 'center',
  },
  colorSwatch: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 4,
  },
  colorLabel: {
    fontSize: 6,
    color: '#666',
    width: 35,
  },
  colorHex: {
    fontSize: 6,
    fontFamily: 'Helvetica-Bold',
  },
});

const BulletList = ({ items }: { items: string[] }) => (
  <View style={styles.bulletList}>
    {items.map((item, idx) => (
      <View key={idx} style={styles.bulletItem}>
        <Text style={styles.bullet}>•</Text>
        <Text style={styles.bulletText}>{item}</Text>
      </View>
    ))}
  </View>
);

const ChipList = ({ items }: { items: string[] }) => (
  <View style={styles.chipContainer}>
    {items.map((item, idx) => (
      <Text key={idx} style={styles.chip}>{item}</Text>
    ))}
  </View>
);

const TableRow = ({ cells, isHeader = false, isAlt = false }: { cells: { text: string; width: string; required?: boolean }[]; isHeader?: boolean; isAlt?: boolean }) => (
  <View style={[isHeader ? styles.tableHeader : styles.tableRow, ...(!isHeader && isAlt ? [styles.tableRowAlt] : [])]}>
    {cells.map((cell, idx) => (
      <Text key={idx} style={[isHeader ? styles.tableHeaderCell : styles.tableCell, { width: cell.width }, ...(cell.required ? [styles.required] : [])]}>
        {cell.text}{cell.required ? ' *' : ''}
      </Text>
    ))}
  </View>
);

const ColorSwatch = ({ color, label, hex }: { color: string; label: string; hex: string }) => (
  <View style={styles.colorRow}>
    <View style={[styles.colorSwatch, { backgroundColor: color }]} />
    <Text style={styles.colorLabel}>{label}</Text>
    <Text style={styles.colorHex}>{hex}</Text>
  </View>
);

// Fixed footer component that renders on each page
const Footer = ({ pageNum }: { pageNum: number }) => (
  <View style={styles.footer} fixed>
    <Text style={styles.footerText}>Imperoyal Immobilien - Onboarding Dokumentation</Text>
    <Text style={styles.footerText}>Seite {pageNum} von 4</Text>
  </View>
);

const OnboardingFunnelPDF = () => (
  <Document>
    {/* PAGE 1 */}
    <Page size="A4" style={styles.page} wrap={false}>
      <View style={styles.header}>
        <Text style={styles.logo}>IMPEROYAL IMMOBILIEN</Text>
        <Text style={styles.title}>Onboarding Funnel</Text>
        <Text style={styles.subtitle}>Technische Dokumentation des Mandanten-Erfassungsprozesses</Text>
      </View>

      <Text style={styles.pageTitle}>Prozessübersicht</Text>

      <View style={styles.flowContainer}>
        <View style={styles.flowStep}>
          <View style={[styles.flowCircle, { backgroundColor: COLORS.growthBlue }]}>
            <Text style={styles.flowNumber}>1</Text>
          </View>
          <Text style={styles.flowLabel}>Kontakt</Text>
          <Text style={styles.flowSublabel}>Stammdaten</Text>
        </View>
        <Text style={styles.flowArrow}>→</Text>
        <View style={styles.flowStep}>
          <View style={[styles.flowCircle, { backgroundColor: COLORS.purple }]}>
            <Text style={styles.flowNumber}>2</Text>
          </View>
          <Text style={styles.flowLabel}>Ankaufsprofil</Text>
          <Text style={styles.flowSublabel}>OPTIONAL</Text>
        </View>
        <Text style={styles.flowArrow}>→</Text>
        <View style={styles.flowStep}>
          <View style={[styles.flowCircle, { backgroundColor: COLORS.green }]}>
            <Text style={styles.flowNumber}>3</Text>
          </View>
          <Text style={styles.flowLabel}>Objekte</Text>
          <Text style={styles.flowSublabel}>+ Einheiten</Text>
        </View>
        <Text style={styles.flowArrow}>→</Text>
        <View style={styles.flowStep}>
          <View style={[styles.flowCircle, { backgroundColor: COLORS.orange }]}>
            <Text style={styles.flowNumber}>4</Text>
          </View>
          <Text style={styles.flowLabel}>Übersicht</Text>
          <Text style={styles.flowSublabel}>Absenden</Text>
        </View>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Der Funnel passt sich dynamisch an: Standardmäßig 3 Schritte. Mit "Ankaufsprofil erstellen" wird es zu 4 Schritten.
        </Text>
      </View>

      <View style={styles.toggleBox}>
        <Text style={styles.toggleTitle}>☐ Ankaufsprofil erstellen - Was passiert?</Text>
        <BulletList items={[
          'Funnel erweitert sich von 3 auf 4 Schritte',
          'Schritt "Ankaufsprofil" erscheint zwischen Kontakt und Objekte (5 Sub-Steps)',
          'Mandant definiert Kaufkriterien (Assetklassen, Regionen, Volumen)',
          'Nach Absenden wird automatisch ein Ankaufsprofil erstellt',
        ]} />
      </View>

      <View style={[styles.section]}>
        <Text style={styles.sectionTitle}>Brand Colors</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
          <View style={{ width: '30%' }}>
            <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: COLORS.royalNavy, marginBottom: 2 }}>Royal Navy</Text>
            <ColorSwatch color="#1E2A3A" label="Dark" hex="#1E2A3A" />
            <ColorSwatch color="#2A3F54" label="Medium" hex="#2A3F54" />
            <ColorSwatch color="#3D5167" label="Light" hex="#3D5167" />
          </View>
          <View style={{ width: '30%' }}>
            <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: COLORS.growthBlue, marginBottom: 2 }}>Growth Blue</Text>
            <ColorSwatch color="#4A6A8D" label="Dark" hex="#4A6A8D" />
            <ColorSwatch color="#5B7A9D" label="Base" hex="#5B7A9D" />
            <ColorSwatch color="#6B8AAD" label="Light" hex="#6B8AAD" />
          </View>
          <View style={{ width: '30%' }}>
            <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: COLORS.growthBlue, marginBottom: 2 }}>Blue Bone</Text>
            <ColorSwatch color="#9EAFC0" label="Dark" hex="#9EAFC0" />
            <ColorSwatch color="#B8C5D1" label="Base" hex="#B8C5D1" />
            <ColorSwatch color="#EDF1F5" label="Lightest" hex="#EDF1F5" />
          </View>
        </View>
        <Text style={{ fontSize: 6, color: '#666', marginTop: 4 }}>
          Royal Navy = Text/Header | Growth Blue = Buttons/Akzente | Blue Bone = Hintergründe/Chips
        </Text>
      </View>

      <View style={[styles.section, styles.sectionOrange]}>
        <Text style={styles.sectionTitle}>Was passiert nach dem Absenden?</Text>
        <BulletList items={[
          '1. Mandant wird in der Datenbank erstellt',
          '2. Ankaufsprofil wird erstellt (wenn aktiviert)',
          '3. Auth-User mit generiertem Passwort erstellt',
          '4. Alle Objekte und Einheiten gespeichert',
          '5. Welcome-E-Mail mit Zugangsdaten versendet',
          '6. Admin per Webhook benachrichtigt',
        ]} />
      </View>

      <Footer pageNum={1} />
    </Page>

    {/* PAGE 2 */}
    <Page size="A4" style={styles.page} wrap={false}>
      <Text style={styles.pageTitle}>Schritt 1: Kontaktdaten</Text>

      <View style={[styles.section]}>
        <Text style={styles.sectionTitle}>Kontaktdaten-Formular</Text>
        <View style={styles.table}>
          <TableRow isHeader cells={[
            { text: 'Feld', width: '28%' },
            { text: 'Typ', width: '14%' },
            { text: 'Pflicht', width: '12%' },
            { text: 'Beschreibung', width: '46%' },
          ]} />
          <TableRow cells={[
            { text: 'Firmenname / Name', width: '28%', required: true },
            { text: 'Text', width: '14%' },
            { text: 'Ja', width: '12%' },
            { text: 'Name des Mandanten oder der Firma', width: '46%' },
          ]} />
          <TableRow isAlt cells={[
            { text: 'Anrede', width: '28%', required: true },
            { text: 'Select', width: '14%' },
            { text: 'Ja', width: '12%' },
            { text: 'Herr | Frau | Herr Dr. | Frau Dr. | Herr Prof. | ...', width: '46%' },
          ]} />
          <TableRow cells={[
            { text: 'Vorname', width: '28%', required: true },
            { text: 'Text', width: '14%' },
            { text: 'Ja', width: '12%' },
            { text: 'Vorname des Ansprechpartners', width: '46%' },
          ]} />
          <TableRow isAlt cells={[
            { text: 'Nachname', width: '28%', required: true },
            { text: 'Text', width: '14%' },
            { text: 'Ja', width: '12%' },
            { text: 'Nachname des Ansprechpartners', width: '46%' },
          ]} />
          <TableRow cells={[
            { text: 'E-Mail', width: '28%', required: true },
            { text: 'Email', width: '14%' },
            { text: 'Ja', width: '12%' },
            { text: 'Für Login + Kommunikation', width: '46%' },
          ]} />
          <TableRow isAlt cells={[
            { text: 'Telefon', width: '28%' },
            { text: 'Tel', width: '14%' },
            { text: 'Nein', width: '12%' },
            { text: 'Optional für Rückfragen', width: '46%' },
          ]} />
        </View>

        <Text style={styles.subHeader}>Objekt-Anzahl & Ankaufsprofil-Toggle</Text>
        <BulletList items={[
          '+/- Buttons oder Direkteingabe für Anzahl Objekte (Min: 1)',
          'Checkbox "Ankaufsprofil erstellen" → +5 Sub-Steps',
        ]} />
      </View>

      <Text style={[styles.pageTitle, { marginTop: 6 }]}>Schritt 2: Ankaufsprofil (Optional)</Text>

      <View style={[styles.section, styles.sectionPurple]}>
        <Text style={styles.sectionTitle}>5 Sub-Steps für Ankaufsprofil</Text>

        <Text style={styles.subHeader}>2.1 Basics</Text>
        <Text style={{ fontSize: 6, color: COLORS.growthBlue }}>Profilname, Kaufinteresse aktiv? (Ja/Nein), Assetklassen:</Text>
        <ChipList items={['MFH', 'Wohn- & Geschäftshaus', 'Büro', 'Retail', 'Logistik', 'Light Industrial', 'Betreiberimmobilien', 'Grundstücke', 'Development']} />

        <Text style={styles.subHeader}>2.2 Standort</Text>
        <Text style={{ fontSize: 6, color: COLORS.growthBlue }}>Bevorzugte Städte/Regionen (Freitext), Lagepräferenz:</Text>
        <ChipList items={['A-Lage', 'B-Lage', 'C-Lage', 'Metropolregion', 'Universitätsstadt', 'Wachstumsregion']} />

        <Text style={styles.subHeader}>2.3 Finanzen</Text>
        <BulletList items={[
          'Min./Max. Volumen (EUR), Zielrendite IST (%)',
          'Finanzierungsform: Voll-EK | EK-dominant | Standard | Offen',
        ]} />

        <Text style={styles.subHeader}>2.4 Objektkriterien</Text>
        <Text style={{ fontSize: 6, color: COLORS.growthBlue }}>Zustand:</Text>
        <ChipList items={['Sanierungsbedürftig', 'Teilsaniert', 'Vollsaniert', 'Denkmal', 'Revitalisierung']} />
        <Text style={{ fontSize: 6, color: COLORS.royalNavy, marginTop: 2 }}>+ Baujahr von/bis, Min. Wohnfläche, Min. Einheiten</Text>

        <Text style={styles.subHeader}>2.5 Sonstiges</Text>
        <BulletList items={[
          'Ausgeschlossene Partner? (Ja/Nein + Textarea)',
          'Sonstiges / Anmerkungen (Textarea)',
        ]} />
      </View>

      <Footer pageNum={2} />
    </Page>

    {/* PAGE 3 */}
    <Page size="A4" style={styles.page} wrap={false}>
      <Text style={styles.pageTitle}>Schritt 3: Objekte & Einheiten</Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Pro Objekt 3 Sub-Steps: Adresse → Finanzierung → Einheiten. Mindestens 1 Objekt erforderlich.
        </Text>
      </View>

      <View style={[styles.section, styles.sectionGreen]}>
        <Text style={styles.sectionTitle}>Sub-Step 3.1: Adresse & Einheiten-Anzahl</Text>
        <View style={styles.table}>
          <TableRow isHeader cells={[
            { text: 'Feld', width: '26%' },
            { text: 'Typ', width: '14%' },
            { text: 'Pflicht', width: '12%' },
            { text: 'Beschreibung', width: '48%' },
          ]} />
          <TableRow cells={[
            { text: 'Straße', width: '26%', required: true },
            { text: 'Text', width: '14%' },
            { text: 'Ja', width: '12%' },
            { text: 'Straße mit Hausnummer', width: '48%' },
          ]} />
          <TableRow isAlt cells={[
            { text: 'PLZ', width: '26%', required: true },
            { text: 'Text', width: '14%' },
            { text: 'Ja', width: '12%' },
            { text: 'Postleitzahl', width: '48%' },
          ]} />
          <TableRow cells={[
            { text: 'Ort', width: '26%' },
            { text: 'Text', width: '14%' },
            { text: 'Nein', width: '12%' },
            { text: 'Stadt/Gemeinde', width: '48%' },
          ]} />
          <TableRow isAlt cells={[
            { text: 'Gebäudetyp', width: '26%' },
            { text: 'Select', width: '14%' },
            { text: 'Nein', width: '12%' },
            { text: 'MFH | Wohn- & Geschäftshaus | Büro | Retail | Logistik', width: '48%' },
          ]} />
          <TableRow cells={[
            { text: 'Baujahr', width: '26%' },
            { text: 'Number', width: '14%' },
            { text: 'Nein', width: '12%' },
            { text: 'Für Alter-/AfA-Berechnung', width: '48%' },
          ]} />
        </View>
        <View style={styles.warningBox}>
          <Text style={[styles.warningText, { fontFamily: 'Helvetica-Bold' }]}>⚠️ Duplikat-Erkennung: Bei doppelter Adresse erscheint Warnung</Text>
        </View>
      </View>

      <View style={styles.autoBox}>
        <Text style={styles.autoTitle}>⚡ Automatische Einheiten-Generierung</Text>
        <Text style={{ fontSize: 7, color: '#92400E' }}>
          Nutzer gibt Anzahl pro Nutzungsart ein: Wohneinheiten (Default: 1) | Gewerbe (0) | Stellplätze (0)
        </Text>
        <Text style={{ fontSize: 7, color: '#92400E', fontFamily: 'Helvetica-Bold', marginTop: 2 }}>
          → Formulare werden automatisch in Sub-Step 3.3 generiert
        </Text>
      </View>

      <View style={[styles.section, styles.sectionGreen]}>
        <Text style={styles.sectionTitle}>Sub-Step 3.2: Finanzierung</Text>
        <View style={styles.table}>
          <TableRow isHeader cells={[
            { text: 'Feld', width: '28%' },
            { text: 'Typ', width: '14%' },
            { text: 'Default', width: '14%' },
            { text: 'Beschreibung', width: '44%' },
          ]} />
          <TableRow cells={[
            { text: 'Kaufpreis (EUR)', width: '28%', required: true },
            { text: 'Number', width: '14%' },
            { text: '-', width: '14%' },
            { text: 'Gesamtkaufpreis', width: '44%' },
          ]} />
          <TableRow isAlt cells={[
            { text: 'Kaufdatum', width: '28%' },
            { text: 'Date', width: '14%' },
            { text: '-', width: '14%' },
            { text: 'Für Zinsbindung', width: '44%' },
          ]} />
          <TableRow cells={[
            { text: 'EK% / Zins% / Tilgung%', width: '28%' },
            { text: 'Number', width: '14%' },
            { text: '30/3.8/2', width: '14%' },
            { text: 'Finanzierungsstruktur', width: '44%' },
          ]} />
          <TableRow isAlt cells={[
            { text: 'Verwaltung (EUR/Jahr)', width: '28%' },
            { text: 'Number', width: '14%' },
            { text: '-', width: '14%' },
            { text: 'Jährliche Kosten', width: '44%' },
          ]} />
        </View>
      </View>

      <Footer pageNum={3} />
    </Page>

    {/* PAGE 4 */}
    <Page size="A4" style={styles.page} wrap={false}>
      <Text style={styles.pageTitle}>Sub-Step 3.3: Einheiten + Schritt 4: Übersicht</Text>

      <View style={[styles.section, styles.sectionGreen]}>
        <Text style={styles.sectionTitle}>Einheiten-Details (automatisch generiert)</Text>
        <View style={styles.table}>
          <TableRow isHeader cells={[
            { text: 'Feld', width: '22%' },
            { text: 'Typ', width: '16%' },
            { text: 'Default', width: '14%' },
            { text: 'Beschreibung', width: '48%' },
          ]} />
          <TableRow cells={[
            { text: 'Nutzung', width: '22%' },
            { text: 'Badge', width: '16%' },
            { text: 'Auto', width: '14%' },
            { text: 'Wohnen | Gewerbe | Stellplatz (nicht editierbar)', width: '48%' },
          ]} />
          <TableRow isAlt cells={[
            { text: 'Fläche (m²)', width: '22%' },
            { text: 'Number', width: '16%' },
            { text: '-', width: '14%' },
            { text: 'Wohn-/Nutzfläche', width: '48%' },
          ]} />
          <TableRow cells={[
            { text: 'Miete (€/Mon)', width: '22%' },
            { text: 'Number', width: '16%' },
            { text: '-', width: '14%' },
            { text: 'Aktuelle Kaltmiete', width: '48%' },
          ]} />
          <TableRow isAlt cells={[
            { text: 'Markt (€/m²)', width: '22%' },
            { text: 'Number', width: '16%' },
            { text: '12', width: '14%' },
            { text: 'Vergleichsmiete (Stellplatz: 0)', width: '48%' },
          ]} />
          <TableRow cells={[
            { text: 'Vertragsart', width: '22%' },
            { text: 'Select', width: '16%' },
            { text: 'Standard', width: '14%' },
            { text: 'Standard | Index | Staffel', width: '48%' },
          ]} />
        </View>
        <View style={styles.warningBox}>
          <Text style={[styles.warningText, { fontFamily: 'Helvetica-Bold' }]}>⚠️ Mietvertragsart beeinflusst Berechnungen:</Text>
          <Text style={styles.warningText}>Standard: §558+§559 möglich | Index: Nur Index, kein §558/§559 | Staffel: Festgelegt</Text>
        </View>
      </View>

      <View style={[styles.section, styles.sectionOrange]}>
        <Text style={styles.sectionTitle}>Schritt 4: Übersicht & Absenden</Text>
        <Text style={styles.subHeader}>Angezeigte Zusammenfassung</Text>
        <BulletList items={[
          'Kontaktdaten: Firma, Ansprechpartner (Anrede Vorname Nachname), E-Mail, Telefon',
          'Ankaufsprofil (wenn erstellt): Assetklassen, Regionen',
          'Portfolio-KPIs: Anzahl Objekte, Einheiten, Gesamtfläche, Jahresmiete',
          'Objekt-Liste: Adresse + Monatsmiete pro Objekt',
        ]} />
        <Text style={styles.subHeader}>Nach Klick auf "Absenden"</Text>
        <BulletList items={[
          '✓ Client-Validierung (Pflichtfelder, min. 1 Objekt)',
          '✓ Server-Validierung (Duplikat-Check E-Mail)',
          '✓ Mandant + Objekte + Einheiten in Supabase erstellt',
          '✓ Auth-User mit 10-Zeichen-Passwort generiert',
          '✓ Welcome-E-Mail via Make.com Webhook',
          '✓ Erfolgs-Screen mit Bestätigung',
        ]} />
      </View>

      <View style={styles.infoBox}>
        <Text style={[styles.infoText, { fontFamily: 'Helvetica-Bold' }]}>Datenstruktur</Text>
        <Text style={styles.infoText}>1 Mandant → 0-1 Ankaufsprofil → N Objekte (min. 1) → M Einheiten/Objekt (min. 1)</Text>
      </View>

      <View style={[styles.section]}>
        <Text style={styles.sectionTitle}>API Endpoint</Text>
        <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: COLORS.royalNavy }}>POST /api/onboarding</Text>
        <Text style={{ fontSize: 6, color: COLORS.growthBlue, marginTop: 2 }}>
          Request: {'{'} name, anrede, vorname, nachname, email, telefon, createAnkaufsprofil, ankaufsprofil?, objekte[] {'}'}{'\n'}
          Response: {'{'} success, mandant_id, objekt_ids[], emailSent, message {'}'}
        </Text>
      </View>

      <Footer pageNum={4} />
    </Page>
  </Document>
);

async function main() {
  const outputPath = './public/Onboarding-Funnel-Dokumentation.pdf';
  await renderToFile(<OnboardingFunnelPDF />, outputPath);
  console.log(`✓ PDF erstellt: ${outputPath}`);
}

main().catch(console.error);
