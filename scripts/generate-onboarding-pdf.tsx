import React from 'react';
import { renderToFile } from '@react-pdf/renderer';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Brand Colors (exakt wie im Onboarding)
const COLORS = {
  // Royal Navy
  royalNavy: '#1E2A3A',
  royalNavyMedium: '#2A3F54',
  royalNavyLight: '#3D5167',
  // Growth Blue
  growthBlue: '#5B7A9D',
  growthBlueDark: '#4A6A8D',
  growthBlueLight: '#6B8AAD',
  // Blue Bone
  blueBone: '#B8C5D1',
  blueBoneDark: '#9EAFC0',
  blueBoneLight: '#D5DEE6',
  blueBoneLightest: '#EDF1F5',
  // Utility
  white: '#FFFFFF',
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    backgroundColor: COLORS.white,
  },
  header: {
    marginBottom: 25,
    paddingBottom: 15,
    borderBottom: `3px solid ${COLORS.royalNavy}`,
  },
  logo: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.royalNavy,
    marginBottom: 5,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.royalNavy,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.growthBlue,
  },
  pageTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.royalNavy,
    marginBottom: 15,
    paddingBottom: 8,
    borderBottom: `2px solid ${COLORS.blueBone}`,
  },

  // Flow Diagram
  flowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 25,
    padding: 20,
    backgroundColor: COLORS.blueBoneLightest,
    borderRadius: 8,
  },
  flowStep: {
    alignItems: 'center',
    width: '20%',
  },
  flowCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  flowNumber: {
    color: COLORS.white,
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
  },
  flowLabel: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.royalNavy,
    textAlign: 'center',
  },
  flowSublabel: {
    fontSize: 8,
    color: COLORS.growthBlue,
    textAlign: 'center',
    marginTop: 2,
  },
  flowArrow: {
    fontSize: 24,
    color: COLORS.blueBone,
    marginTop: 12,
  },

  // Sections
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: COLORS.blueBoneLightest,
    borderRadius: 6,
    borderLeft: `4px solid ${COLORS.growthBlue}`,
  },
  sectionGreen: {
    borderLeftColor: COLORS.growthBlue,
  },
  sectionPurple: {
    borderLeftColor: COLORS.growthBlueDark,
  },
  sectionOrange: {
    borderLeftColor: COLORS.royalNavyLight,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.royalNavy,
    marginBottom: 10,
  },

  // Info Box
  infoBox: {
    backgroundColor: '#E0F2FE',
    padding: 12,
    borderRadius: 6,
    marginBottom: 15,
    borderLeft: `4px solid #0EA5E9`,
  },
  warningBox: {
    backgroundColor: COLORS.blueBoneLight,
    padding: 12,
    borderRadius: 6,
    marginBottom: 15,
    borderLeft: `4px solid ${COLORS.royalNavyLight}`,
  },
  infoText: {
    fontSize: 9,
    color: '#0369A1',
    lineHeight: 1.5,
  },
  warningText: {
    fontSize: 9,
    color: '#92400E',
    lineHeight: 1.5,
  },

  // Table
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.royalNavy,
    padding: 8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableHeaderCell: {
    color: COLORS.white,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: `1px solid ${COLORS.blueBone}`,
    backgroundColor: COLORS.white,
  },
  tableRowAlt: {
    backgroundColor: COLORS.blueBoneLightest,
  },
  tableCell: {
    fontSize: 9,
    color: COLORS.royalNavy,
  },
  tableCellBold: {
    fontFamily: 'Helvetica-Bold',
  },
  required: {
    color: COLORS.red,
    fontFamily: 'Helvetica-Bold',
  },

  // Toggle Box
  toggleBox: {
    backgroundColor: '#F0FDF4',
    padding: 15,
    borderRadius: 8,
    marginVertical: 15,
    border: `2px solid ${COLORS.green}`,
  },
  toggleTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.green,
    marginBottom: 8,
  },

  // Automatic Feature Box
  autoBox: {
    backgroundColor: '#FEF3C7',
    padding: 15,
    borderRadius: 8,
    marginVertical: 15,
    border: `2px dashed ${COLORS.orange}`,
  },
  autoTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#B45309',
    marginBottom: 8,
  },

  // Bullet List
  bulletList: {
    marginTop: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bullet: {
    width: 15,
    fontSize: 9,
    color: COLORS.growthBlue,
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    color: COLORS.royalNavy,
    lineHeight: 1.4,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTop: `1px solid ${COLORS.blueBone}`,
  },
  footerText: {
    fontSize: 8,
    color: COLORS.growthBlue,
  },

  // Chips
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  chip: {
    backgroundColor: COLORS.blueBone,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    fontSize: 8,
    color: COLORS.royalNavy,
    marginRight: 4,
    marginBottom: 4,
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

const TableRow = ({ cells, isHeader = false, isAlt = false }: { cells: { text: string; width: string; bold?: boolean; required?: boolean }[]; isHeader?: boolean; isAlt?: boolean }) => (
  <View style={[
    isHeader ? styles.tableHeader : styles.tableRow,
    ...(!isHeader && isAlt ? [styles.tableRowAlt] : [])
  ]}>
    {cells.map((cell, idx) => (
      <Text key={idx} style={[
        isHeader ? styles.tableHeaderCell : styles.tableCell,
        { width: cell.width },
        ...(cell.bold ? [styles.tableCellBold] : []),
        ...(cell.required ? [styles.required] : []),
      ]}>
        {cell.text}{cell.required ? ' *' : ''}
      </Text>
    ))}
  </View>
);

const OnboardingFunnelPDF = () => (
  <Document>
    {/* SEITE 1: Übersicht */}
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.logo}>IMPEROYAL IMMOBILIEN</Text>
        <Text style={styles.title}>Onboarding Funnel</Text>
        <Text style={styles.subtitle}>Dokumentation des Mandanten-Erfassungsprozesses</Text>
      </View>

      <Text style={styles.pageTitle}>Prozessübersicht</Text>

      {/* Flow Diagram */}
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
          Der Onboarding-Funnel passt sich dynamisch an: Standardmäßig hat er 3 Schritte. Aktiviert der Nutzer "Ankaufsprofil erstellen" in Schritt 1, erweitert sich der Funnel auf 4 Schritte.
        </Text>
      </View>

      {/* Toggle Erklärung */}
      <View style={styles.toggleBox}>
        <Text style={styles.toggleTitle}>☐ Ankaufsprofil erstellen - Was passiert beim Aktivieren?</Text>
        <BulletList items={[
          'Der Funnel erweitert sich von 3 auf 4 Schritte',
          'Ein neuer Schritt "Ankaufsprofil" erscheint zwischen Kontakt und Objekte',
          'Der Mandant kann seine Kaufkriterien definieren (Assetklassen, Regionen, Volumen, etc.)',
          'Nach Absenden wird automatisch ein Ankaufsprofil in der Datenbank erstellt',
          'Das Profil kann später für Objekt-Matching verwendet werden',
        ]} />
      </View>

      {/* Brand Colors */}
      <View style={[styles.section]}>
        <Text style={styles.sectionTitle}>Brand Colors</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
          {/* Royal Navy */}
          <View style={{ width: '30%' }}>
            <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: COLORS.royalNavy, marginBottom: 6 }}>Royal Navy</Text>
            <View style={{ flexDirection: 'row', marginBottom: 4 }}>
              <View style={{ width: 20, height: 20, backgroundColor: '#1E2A3A', borderRadius: 3, marginRight: 6 }} />
              <View>
                <Text style={{ fontSize: 8, color: '#666' }}>Dark</Text>
                <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold' }}>#1E2A3A</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: 4 }}>
              <View style={{ width: 20, height: 20, backgroundColor: '#2A3F54', borderRadius: 3, marginRight: 6 }} />
              <View>
                <Text style={{ fontSize: 8, color: '#666' }}>Medium</Text>
                <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold' }}>#2A3F54</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ width: 20, height: 20, backgroundColor: '#3D5167', borderRadius: 3, marginRight: 6 }} />
              <View>
                <Text style={{ fontSize: 8, color: '#666' }}>Light</Text>
                <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold' }}>#3D5167</Text>
              </View>
            </View>
          </View>
          {/* Growth Blue */}
          <View style={{ width: '30%' }}>
            <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#5B7A9D', marginBottom: 6 }}>Growth Blue</Text>
            <View style={{ flexDirection: 'row', marginBottom: 4 }}>
              <View style={{ width: 20, height: 20, backgroundColor: '#4A6A8D', borderRadius: 3, marginRight: 6 }} />
              <View>
                <Text style={{ fontSize: 8, color: '#666' }}>Dark</Text>
                <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold' }}>#4A6A8D</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: 4 }}>
              <View style={{ width: 20, height: 20, backgroundColor: '#5B7A9D', borderRadius: 3, marginRight: 6 }} />
              <View>
                <Text style={{ fontSize: 8, color: '#666' }}>Base</Text>
                <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold' }}>#5B7A9D</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ width: 20, height: 20, backgroundColor: '#6B8AAD', borderRadius: 3, marginRight: 6 }} />
              <View>
                <Text style={{ fontSize: 8, color: '#666' }}>Light</Text>
                <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold' }}>#6B8AAD</Text>
              </View>
            </View>
          </View>
          {/* Blue Bone */}
          <View style={{ width: '30%' }}>
            <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#5B7A9D', marginBottom: 6 }}>Blue Bone</Text>
            <View style={{ flexDirection: 'row', marginBottom: 4 }}>
              <View style={{ width: 20, height: 20, backgroundColor: '#9EAFC0', borderRadius: 3, marginRight: 6 }} />
              <View>
                <Text style={{ fontSize: 8, color: '#666' }}>Dark</Text>
                <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold' }}>#9EAFC0</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: 4 }}>
              <View style={{ width: 20, height: 20, backgroundColor: '#B8C5D1', borderRadius: 3, marginRight: 6 }} />
              <View>
                <Text style={{ fontSize: 8, color: '#666' }}>Base</Text>
                <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold' }}>#B8C5D1</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ width: 20, height: 20, backgroundColor: '#EDF1F5', borderRadius: 3, marginRight: 6 }} />
              <View>
                <Text style={{ fontSize: 8, color: '#666' }}>Lightest</Text>
                <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold' }}>#EDF1F5</Text>
              </View>
            </View>
          </View>
        </View>
        <Text style={{ fontSize: 8, color: '#666', marginTop: 10, fontStyle: 'italic' }}>
          Verwendung: Royal Navy für Text/Header, Growth Blue für Buttons/Aktionen, Blue Bone für Hintergründe/Chips
        </Text>
      </View>

      {/* Was passiert nach Absenden */}
      <View style={[styles.section, styles.sectionOrange]}>
        <Text style={styles.sectionTitle}>Was passiert nach dem Absenden?</Text>
        <BulletList items={[
          '1. Mandant wird in der Datenbank erstellt',
          '2. Ankaufsprofil wird erstellt (wenn aktiviert)',
          '3. Auth-User wird mit generiertem Passwort erstellt',
          '4. Alle Objekte und Einheiten werden gespeichert',
          '5. Welcome-E-Mail mit Zugangsdaten wird versendet',
          '6. Admin wird per Webhook benachrichtigt',
        ]} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Imperoyal Immobilien - Onboarding Dokumentation</Text>
        <Text style={styles.footerText}>Seite 1 von 4</Text>
      </View>
    </Page>

    {/* SEITE 2: Schritt 1 + 2 */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.pageTitle}>Schritt 1: Kontaktdaten + Schritt 2: Ankaufsprofil</Text>

      {/* Schritt 1 */}
      <View style={[styles.section]}>
        <Text style={styles.sectionTitle}>SCHRITT 1: Kontaktdaten</Text>
        <View style={styles.table}>
          <TableRow isHeader cells={[
            { text: 'Feld', width: '35%' },
            { text: 'Typ', width: '20%' },
            { text: 'Pflicht', width: '15%' },
            { text: 'Beschreibung', width: '30%' },
          ]} />
          <TableRow cells={[
            { text: 'Firmenname / Name', width: '35%', required: true },
            { text: 'Text', width: '20%' },
            { text: 'Ja', width: '15%' },
            { text: 'Name des Mandanten', width: '30%' },
          ]} />
          <TableRow isAlt cells={[
            { text: 'Ansprechpartner', width: '35%', required: true },
            { text: 'Text', width: '20%' },
            { text: 'Ja', width: '15%' },
            { text: 'Kontaktperson', width: '30%' },
          ]} />
          <TableRow cells={[
            { text: 'Position', width: '35%' },
            { text: 'Text', width: '20%' },
            { text: 'Nein', width: '15%' },
            { text: 'z.B. Geschäftsführer', width: '30%' },
          ]} />
          <TableRow isAlt cells={[
            { text: 'E-Mail', width: '35%', required: true },
            { text: 'Email', width: '20%' },
            { text: 'Ja', width: '15%' },
            { text: 'Login + Kontakt', width: '30%' },
          ]} />
          <TableRow cells={[
            { text: 'Telefon', width: '35%' },
            { text: 'Tel', width: '20%' },
            { text: 'Nein', width: '15%' },
            { text: 'Für Rückfragen', width: '30%' },
          ]} />
        </View>
      </View>

      {/* Schritt 2 */}
      <View style={[styles.section, styles.sectionPurple]}>
        <Text style={styles.sectionTitle}>SCHRITT 2: Ankaufsprofil (nur wenn Toggle aktiv)</Text>

        <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: COLORS.royalNavy, marginBottom: 6, marginTop: 8 }}>
          2.1 Allgemeine Ankaufsparameter
        </Text>
        <BulletList items={[
          'Profilname (z.B. "Core-Portfolio Deutschland")',
          'Kaufinteresse aktiv? (Ja/Nein)',
          'Bevorzugte Assetklassen (Multi-Select):',
        ]} />
        <ChipList items={['MFH', 'Wohn- & Geschäftshaus', 'Büro', 'Retail', 'Logistik', 'Light Industrial', 'Betreiberimmobilien', 'Grundstücke', 'Development']} />

        <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: COLORS.royalNavy, marginBottom: 6, marginTop: 12 }}>
          2.2 Standortprofil
        </Text>
        <BulletList items={[
          'Bevorzugte Städte/Regionen (Freitext)',
          'Lagepräferenz (Multi-Select):',
        ]} />
        <ChipList items={['A-Lage', 'B-Lage', 'C-Lage', 'Metropolregion', 'Universitätsstadt', 'Wachstumsregion']} />

        <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: COLORS.royalNavy, marginBottom: 6, marginTop: 12 }}>
          2.3 Finanzielle Parameter
        </Text>
        <BulletList items={[
          'Mindest-/Maximalvolumen (EUR)',
          'Kaufpreisfaktor, Zielrendite IST/SOLL (%)',
          'Finanzierungsform: Voll-EK | EK-dominant | Standard | Offen',
        ]} />

        <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: COLORS.royalNavy, marginBottom: 6, marginTop: 12 }}>
          2.4 Objektkriterien + 2.5 Zusätzliches
        </Text>
        <BulletList items={[
          'Zustand: Sanierungsbedürftig | Teilsaniert | Vollsaniert | Denkmal | Revitalisierung',
          'Baujahr von/bis, Min. Wohn-/Gewerbefläche, Min. Einheiten, Min. Grundstück',
          'Ausgeschlossene Partner/Makler, Besondere Bedingungen, Weitere Projektarten (ESG, etc.)',
        ]} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Imperoyal Immobilien - Onboarding Dokumentation</Text>
        <Text style={styles.footerText}>Seite 2 von 4</Text>
      </View>
    </Page>

    {/* SEITE 3: Objekte + Einheiten */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.pageTitle}>Schritt 3: Objekte & Einheiten</Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Mindestens 1 Objekt ist erforderlich. Pro Objekt können beliebig viele Einheiten erfasst werden. Einheiten können Wohnungen, Gewerbeeinheiten oder Stellplätze sein.
        </Text>
      </View>

      {/* Objekte */}
      <View style={[styles.section, styles.sectionGreen]}>
        <Text style={styles.sectionTitle}>Objektdaten (pro Objekt)</Text>
        <View style={styles.table}>
          <TableRow isHeader cells={[
            { text: 'Feld', width: '30%' },
            { text: 'Typ', width: '15%' },
            { text: 'Pflicht', width: '12%' },
            { text: 'Beschreibung', width: '43%' },
          ]} />
          <TableRow cells={[
            { text: 'Straße, PLZ, Ort', width: '30%', required: true },
            { text: 'Text', width: '15%' },
            { text: 'Ja', width: '12%' },
            { text: 'Adresse des Objekts', width: '43%' },
          ]} />
          <TableRow isAlt cells={[
            { text: 'Gebäudetyp', width: '30%' },
            { text: 'Select', width: '15%' },
            { text: 'Nein', width: '12%' },
            { text: 'MFH | Wohn- & Geschäftshaus | Büro | Retail | Logistik', width: '43%' },
          ]} />
          <TableRow cells={[
            { text: 'Baujahr', width: '30%' },
            { text: 'Jahr', width: '15%' },
            { text: 'Nein', width: '12%' },
            { text: 'Für Alter-/AfA-Berechnung', width: '43%' },
          ]} />
          <TableRow isAlt cells={[
            { text: 'Anz. Wohn/Gewerbe/Stellpl.', width: '30%', bold: true },
            { text: 'Zahl', width: '15%' },
            { text: 'Ja', width: '12%' },
            { text: '→ Generiert automatisch Einheiten-Formulare!', width: '43%' },
          ]} />
          <TableRow cells={[
            { text: 'Kaufpreis', width: '30%', required: true },
            { text: 'EUR', width: '15%' },
            { text: 'Ja', width: '12%' },
            { text: 'Gesamtkaufpreis des Objekts', width: '43%' },
          ]} />
          <TableRow cells={[
            { text: 'Kaufdatum', width: '30%' },
            { text: 'Datum', width: '15%' },
            { text: 'Nein', width: '12%' },
            { text: 'Für Zinsbindungs-Berechnung', width: '43%' },
          ]} />
          <TableRow isAlt cells={[
            { text: 'EK%, Zins%, Tilgung%', width: '30%' },
            { text: 'Prozent', width: '15%' },
            { text: 'Nein', width: '12%' },
            { text: 'Finanzierungsstruktur (Defaults: 30/3.8/2)', width: '43%' },
          ]} />
          <TableRow cells={[
            { text: 'Instandhaltung, Verwaltung', width: '30%' },
            { text: 'EUR/Jahr', width: '15%' },
            { text: 'Nein', width: '12%' },
            { text: 'Jährliche Kosten', width: '43%' },
          ]} />
        </View>
      </View>

      {/* Automatische Einheiten */}
      <View style={styles.autoBox}>
        <Text style={styles.autoTitle}>⚡ Automatische Einheiten-Generierung</Text>
        <Text style={{ fontSize: 9, color: '#92400E', marginBottom: 8 }}>
          Im Adresse-Schritt gibt der Nutzer die ANZAHL der Einheiten pro Nutzungsart ein:
        </Text>
        <BulletList items={[
          'Anzahl Wohneinheiten (Default: 1)',
          'Anzahl Gewerbeeinheiten (Default: 0)',
          'Anzahl Stellplätze (Default: 0)',
        ]} />
        <Text style={{ fontSize: 9, color: '#92400E', marginTop: 8, fontFamily: 'Helvetica-Bold' }}>
          → Basierend auf diesen Zahlen werden im Einheiten-Schritt automatisch die entsprechenden Formulare generiert
        </Text>
        <Text style={{ fontSize: 9, color: '#92400E', marginTop: 4 }}>
          → Nutzungsart ist pro Einheit vorbelegt (Wohnen/Gewerbe/Stellplatz), Nutzer muss nur Fläche, Miete, etc. ausfüllen
        </Text>
      </View>

      {/* Einheiten */}
      <View style={[styles.section, styles.sectionGreen]}>
        <Text style={styles.sectionTitle}>Einheiten (automatisch generiert)</Text>

        <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: COLORS.royalNavy, marginBottom: 6 }}>
          Felder pro Einheit (Nutzung ist vorbelegt):
        </Text>
        <View style={styles.table}>
          <TableRow isHeader cells={[
            { text: 'Feld', width: '25%' },
            { text: 'Typ', width: '20%' },
            { text: 'Beschreibung', width: '55%' },
          ]} />
          <TableRow cells={[
            { text: 'Nutzung', width: '25%' },
            { text: 'Badge', width: '20%' },
            { text: 'Automatisch: Wohnen | Gewerbe | Stellplatz (nicht editierbar)', width: '55%' },
          ]} />
          <TableRow isAlt cells={[
            { text: 'Fläche', width: '25%' },
            { text: 'm²', width: '20%' },
            { text: 'Wohn-/Nutzfläche der Einheit', width: '55%' },
          ]} />
          <TableRow cells={[
            { text: 'Kaltmiete', width: '25%' },
            { text: 'EUR/Monat', width: '20%' },
            { text: 'Aktuelle monatliche Kaltmiete', width: '55%' },
          ]} />
          <TableRow isAlt cells={[
            { text: 'Marktmiete', width: '25%' },
            { text: 'EUR/m²', width: '20%' },
            { text: 'Ortsübliche Vergleichsmiete (Default: 12)', width: '55%' },
          ]} />
          <TableRow cells={[
            { text: 'Mietvertragsart', width: '25%' },
            { text: 'Select', width: '20%' },
            { text: 'Standard | Index | Staffel (wichtig für §558/§559!)', width: '55%' },
          ]} />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Imperoyal Immobilien - Onboarding Dokumentation</Text>
        <Text style={styles.footerText}>Seite 3 von 4</Text>
      </View>
    </Page>

    {/* SEITE 4: Erweiterte Einheiten + Übersicht */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.pageTitle}>Einheiten (Fortsetzung) + Schritt 4: Übersicht</Text>

      {/* Erweiterte Einheiten */}
      <View style={[styles.section, styles.sectionGreen]}>
        <Text style={styles.sectionTitle}>Erweiterte Einheiten-Daten (aufklappbar)</Text>
        <Text style={{ fontSize: 9, color: COLORS.growthBlue, marginBottom: 8 }}>
          Diese Felder sind in einem aufklappbaren Bereich versteckt und können bei Bedarf ausgefüllt werden:
        </Text>

        <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: COLORS.royalNavy, marginBottom: 6, marginTop: 8 }}>
          Vertragsdaten:
        </Text>
        <BulletList items={[
          'Vertragsbeginn (Datum) - Wann begann das Mietverhältnis?',
          'Letzte Mieterhöhung (Datum) - Für §558 Sperrfrist-Berechnung',
          'Höhe Mieterhöhung (EUR) - Betrag der letzten Erhöhung',
        ]} />

        <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: COLORS.royalNavy, marginBottom: 6, marginTop: 10 }}>
          §558 / §559 BGB Daten:
        </Text>
        <BulletList items={[
          '§558 Datum + Betrag - Mieterhöhung zur ortsüblichen Vergleichsmiete',
          '§559 Datum + Art + Betrag - Modernisierungsumlage (8% der CAPEX)',
        ]} />

        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            ⚠️ Mietvertragsart beeinflusst Berechnungen:{'\n'}
            • Standard: §558 + §559 möglich{'\n'}
            • Index: Nur Index-Anpassung, KEIN §558/§559{'\n'}
            • Staffel: Festgelegte Staffeln, KEINE Prognose möglich
          </Text>
        </View>
      </View>

      {/* Schritt 4: Übersicht */}
      <View style={[styles.section, styles.sectionOrange]}>
        <Text style={styles.sectionTitle}>SCHRITT 4: Übersicht & Absenden</Text>

        <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: COLORS.royalNavy, marginBottom: 6 }}>
          Angezeigte Zusammenfassung:
        </Text>
        <BulletList items={[
          'Kontaktdaten des Mandanten (Name, Email, Telefon)',
          'Ankaufsprofil-Zusammenfassung (wenn erstellt): Assetklassen, Regionen, Volumen',
          'Portfolio-Übersicht: Anzahl Objekte, Einheiten, Gesamtfläche, Jahresmiete',
          'Liste aller Objekte mit Kurzinfo (Adresse, Einheiten, Miete)',
        ]} />

        <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: COLORS.royalNavy, marginBottom: 6, marginTop: 10 }}>
          Nach Klick auf "Absenden":
        </Text>
        <BulletList items={[
          '✓ Daten werden validiert (Pflichtfelder, min. 1 Objekt)',
          '✓ Mandant + Objekte + Einheiten werden erstellt',
          '✓ Ankaufsprofil wird erstellt (falls aktiviert)',
          '✓ Auth-User mit Passwort wird generiert',
          '✓ Welcome-E-Mail mit Zugangsdaten wird versendet',
          '✓ Erfolgs-Seite mit Bestätigung wird angezeigt',
        ]} />
      </View>

      {/* Zusammenfassung */}
      <View style={styles.infoBox}>
        <Text style={[styles.infoText, { fontFamily: 'Helvetica-Bold', marginBottom: 4 }]}>
          Zusammenfassung der Datenstruktur:
        </Text>
        <Text style={styles.infoText}>
          1 Mandant → 0-1 Ankaufsprofil (optional){'\n'}
          1 Mandant → N Objekte (min. 1){'\n'}
          1 Objekt → N Einheiten (min. 1, automatisch 1 erstellt){'\n'}
          1 Einheit → Basisdaten + erweiterte Daten (aufklappbar)
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Imperoyal Immobilien - Onboarding Dokumentation</Text>
        <Text style={styles.footerText}>Seite 4 von 4</Text>
      </View>
    </Page>
  </Document>
);

async function main() {
  const outputPath = './public/Onboarding-Funnel-Dokumentation.pdf';
  await renderToFile(<OnboardingFunnelPDF />, outputPath);
  console.log(`✓ PDF erstellt: ${outputPath}`);
}

main().catch(console.error);
