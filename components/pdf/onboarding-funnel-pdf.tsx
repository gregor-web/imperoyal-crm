import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Fonts registrieren
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hjp-Ek-_EeA.woff2', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hjp-Ek-_EeA.woff2', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Inter',
    fontSize: 10,
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2px solid #1e3a5f',
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: '#1e3a5f',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  stepContainer: {
    marginBottom: 25,
  },
  stepHeader: {
    backgroundColor: '#1e3a5f',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#ffffff',
  },
  stepDescription: {
    fontSize: 9,
    color: '#94a3b8',
    marginTop: 3,
  },
  sectionContainer: {
    marginBottom: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    padding: 12,
    border: '1px solid #e2e8f0',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: '#334155',
    marginBottom: 8,
    borderBottom: '1px solid #cbd5e1',
    paddingBottom: 5,
  },
  fieldRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  fieldName: {
    width: '40%',
    fontSize: 9,
    color: '#64748b',
  },
  fieldType: {
    width: '25%',
    fontSize: 9,
    color: '#1e3a5f',
    fontWeight: 600,
  },
  fieldRequired: {
    width: '15%',
    fontSize: 8,
    color: '#ef4444',
  },
  fieldOptional: {
    width: '15%',
    fontSize: 8,
    color: '#94a3b8',
  },
  fieldNote: {
    width: '20%',
    fontSize: 8,
    color: '#64748b',
    fontStyle: 'italic',
  },
  optionsList: {
    marginTop: 4,
    paddingLeft: 10,
  },
  optionItem: {
    fontSize: 8,
    color: '#475569',
    marginBottom: 2,
  },
  flowDiagram: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  flowStep: {
    alignItems: 'center',
    width: '22%',
  },
  flowCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  flowCircleText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 700,
  },
  flowLabel: {
    fontSize: 9,
    color: '#334155',
    textAlign: 'center',
  },
  flowArrow: {
    fontSize: 14,
    color: '#94a3b8',
  },
  infoBox: {
    backgroundColor: '#dbeafe',
    padding: 10,
    borderRadius: 4,
    marginBottom: 15,
    border: '1px solid #93c5fd',
  },
  infoText: {
    fontSize: 9,
    color: '#1e40af',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: '1px solid #e2e8f0',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: '#94a3b8',
  },
  pageNumber: {
    fontSize: 8,
    color: '#64748b',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  chip: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    fontSize: 7,
    color: '#475569',
  },
});

const FieldRow = ({
  name,
  type,
  required = false,
  note = ''
}: {
  name: string;
  type: string;
  required?: boolean;
  note?: string;
}) => (
  <View style={styles.fieldRow}>
    <Text style={styles.fieldName}>{name}</Text>
    <Text style={styles.fieldType}>{type}</Text>
    <Text style={required ? styles.fieldRequired : styles.fieldOptional}>
      {required ? 'Pflicht' : 'Optional'}
    </Text>
    <Text style={styles.fieldNote}>{note}</Text>
  </View>
);

const ChipList = ({ items }: { items: string[] }) => (
  <View style={styles.chipContainer}>
    {items.map((item, idx) => (
      <Text key={idx} style={styles.chip}>{item}</Text>
    ))}
  </View>
);

export function OnboardingFunnelPDF() {
  return (
    <Document>
      {/* Seite 1: Übersicht & Schritt 1 */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Onboarding Funnel</Text>
          <Text style={styles.subtitle}>Imperoyal Immobilien - Datenerfassung für Mandanten</Text>
        </View>

        {/* Flow Diagram */}
        <View style={styles.flowDiagram}>
          <View style={styles.flowStep}>
            <View style={styles.flowCircle}>
              <Text style={styles.flowCircleText}>1</Text>
            </View>
            <Text style={styles.flowLabel}>Kontakt</Text>
          </View>
          <Text style={styles.flowArrow}>→</Text>
          <View style={styles.flowStep}>
            <View style={[styles.flowCircle, { backgroundColor: '#8b5cf6' }]}>
              <Text style={styles.flowCircleText}>2</Text>
            </View>
            <Text style={styles.flowLabel}>Ankaufsprofil{'\n'}(optional)</Text>
          </View>
          <Text style={styles.flowArrow}>→</Text>
          <View style={styles.flowStep}>
            <View style={[styles.flowCircle, { backgroundColor: '#10b981' }]}>
              <Text style={styles.flowCircleText}>3</Text>
            </View>
            <Text style={styles.flowLabel}>Objekte &{'\n'}Einheiten</Text>
          </View>
          <Text style={styles.flowArrow}>→</Text>
          <View style={styles.flowStep}>
            <View style={[styles.flowCircle, { backgroundColor: '#f59e0b' }]}>
              <Text style={styles.flowCircleText}>4</Text>
            </View>
            <Text style={styles.flowLabel}>Übersicht &{'\n'}Absenden</Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Der Onboarding-Funnel erfasst alle relevanten Daten eines neuen Mandanten.
            Schritt 2 (Ankaufsprofil) ist optional und kann über einen Toggle aktiviert werden.
            Bei Aktivierung erweitert sich der Funnel von 3 auf 4 Schritte.
          </Text>
        </View>

        {/* Schritt 1: Kontaktdaten */}
        <View style={styles.stepContainer}>
          <View style={styles.stepHeader}>
            <Text style={styles.stepTitle}>Schritt 1: Kontaktdaten</Text>
            <Text style={styles.stepDescription}>Erfassung der Mandanten-Stammdaten</Text>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Mandanteninformationen</Text>
            <FieldRow name="Firmenname / Name" type="Text" required note="Mandantenname" />
            <FieldRow name="Ansprechpartner" type="Text" required note="Kontaktperson" />
            <FieldRow name="Position" type="Text" note="z.B. Geschäftsführer" />
            <FieldRow name="E-Mail" type="Email" required note="Login & Kontakt" />
            <FieldRow name="Telefon" type="Tel" note="Rückruf" />
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Ankaufsprofil-Toggle</Text>
            <FieldRow name="Ankaufsprofil erstellen" type="Checkbox" note="Aktiviert Schritt 2" />
            <Text style={{ fontSize: 8, color: '#64748b', marginTop: 5 }}>
              Wenn aktiviert: Erstellt ein Ankaufsprofil für den Mandanten, um passende Objekte zu matchen.
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Imperoyal Immobilien - Onboarding Dokumentation</Text>
          <Text style={styles.pageNumber}>Seite 1 von 4</Text>
        </View>
      </Page>

      {/* Seite 2: Ankaufsprofil */}
      <Page size="A4" style={styles.page}>
        <View style={styles.stepContainer}>
          <View style={[styles.stepHeader, { backgroundColor: '#8b5cf6' }]}>
            <Text style={styles.stepTitle}>Schritt 2: Ankaufsprofil (Optional)</Text>
            <Text style={styles.stepDescription}>Nur sichtbar wenn Toggle in Schritt 1 aktiviert</Text>
          </View>

          {/* 2.1 Allgemeine Ankaufsparameter */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>2.1 Allgemeine Ankaufsparameter</Text>
            <FieldRow name="Profilname" type="Text" note="z.B. Core-Portfolio" />
            <FieldRow name="Kaufinteresse aktiv" type="Ja/Nein" note="Aktuell suchend?" />
            <View style={{ marginTop: 8 }}>
              <Text style={{ fontSize: 9, color: '#64748b', marginBottom: 4 }}>Bevorzugte Assetklassen (Multi-Select):</Text>
              <ChipList items={['MFH', 'Wohn- & Geschäftshaus', 'Büro', 'Retail', 'Logistik', 'Light Industrial', 'Betreiberimmobilien', 'Grundstücke', 'Development']} />
            </View>
          </View>

          {/* 2.2 Standortprofil */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>2.2 Standortprofil</Text>
            <FieldRow name="Bevorzugte Städte/Regionen" type="Textarea" note="Freitext" />
            <View style={{ marginTop: 8 }}>
              <Text style={{ fontSize: 9, color: '#64748b', marginBottom: 4 }}>Lagepräferenz (Multi-Select):</Text>
              <ChipList items={['A-Lage', 'B-Lage', 'C-Lage', 'Metropolregion', 'Universitätsstadt', 'Wachstumsregion']} />
            </View>
          </View>

          {/* 2.3 Finanzielle Ankaufsparameter */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>2.3 Finanzielle Ankaufsparameter</Text>
            <FieldRow name="Mindestinvestitionsvolumen" type="Zahl (EUR)" note="Min. Kaufpreis" />
            <FieldRow name="Maximalvolumen" type="Zahl (EUR)" note="Max. Kaufpreis" />
            <FieldRow name="Kaufpreisfaktor" type="Zahl" note="Multiplikator" />
            <FieldRow name="Zielrendite IST" type="Prozent" note="Aktuelle Anfangsrendite" />
            <FieldRow name="Zielrendite SOLL" type="Prozent" note="Nach Optimierung" />
            <View style={{ marginTop: 8 }}>
              <Text style={{ fontSize: 9, color: '#64748b', marginBottom: 4 }}>Finanzierungsform (Single-Select):</Text>
              <ChipList items={['Voll-EK', 'EK-dominant', 'Standard-Finanzierung', 'Offen']} />
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Imperoyal Immobilien - Onboarding Dokumentation</Text>
          <Text style={styles.pageNumber}>Seite 2 von 4</Text>
        </View>
      </Page>

      {/* Seite 3: Ankaufsprofil (Fortsetzung) + Objekte */}
      <Page size="A4" style={styles.page}>
        {/* 2.4 Objektspezifische Kriterien */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>2.4 Objektspezifische Kriterien</Text>
          <View style={{ marginBottom: 8 }}>
            <Text style={{ fontSize: 9, color: '#64748b', marginBottom: 4 }}>Zustand (Multi-Select):</Text>
            <ChipList items={['Sanierungsbedürftig', 'Teilsaniert', 'Vollsaniert', 'Denkmal', 'Revitalisierung möglich']} />
          </View>
          <FieldRow name="Baujahr von" type="Jahr" note="z.B. 1950" />
          <FieldRow name="Baujahr bis" type="Jahr" note="z.B. 2020" />
          <FieldRow name="Min. Wohnfläche" type="m²" />
          <FieldRow name="Min. Gewerbefläche" type="m²" />
          <FieldRow name="Min. Wohneinheiten" type="Anzahl" />
          <FieldRow name="Min. Gewerbeeinheiten" type="Anzahl" />
          <FieldRow name="Min. Grundstück" type="m²" />
        </View>

        {/* 2.5 Zusätzliche Angaben */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>2.5 Zusätzliche Angaben</Text>
          <FieldRow name="Ausgeschlossene Partner" type="Ja/Nein" note="Makler-Blacklist?" />
          <FieldRow name="Ausgeschlossene Partner Liste" type="Textarea" note="Nur wenn Ja" />
          <FieldRow name="Besondere Bedingungen" type="Textarea" note="Sonstiges" />
          <FieldRow name="Weitere Projektarten" type="Text" note="ESG, CO₂, etc." />
        </View>

        {/* Schritt 3: Objekte */}
        <View style={styles.stepContainer}>
          <View style={[styles.stepHeader, { backgroundColor: '#10b981' }]}>
            <Text style={styles.stepTitle}>Schritt 3: Objekte & Einheiten</Text>
            <Text style={styles.stepDescription}>Mindestens 1 Objekt erforderlich</Text>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Objektdaten (pro Objekt)</Text>
            <FieldRow name="Straße" type="Text" required />
            <FieldRow name="PLZ" type="Text" required />
            <FieldRow name="Ort" type="Text" required />
            <FieldRow name="Gebäudetyp" type="Select" note="MFH, Büro, etc." />
            <FieldRow name="Baujahr" type="Jahr" />
            <FieldRow name="Kaufpreis" type="EUR" required />
            <FieldRow name="Kaufdatum" type="Datum" />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Imperoyal Immobilien - Onboarding Dokumentation</Text>
          <Text style={styles.pageNumber}>Seite 3 von 4</Text>
        </View>
      </Page>

      {/* Seite 4: Finanzierung, Einheiten, Übersicht */}
      <Page size="A4" style={styles.page}>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Finanzierung & Kosten (pro Objekt)</Text>
          <FieldRow name="Eigenkapital %" type="Prozent" note="Default: 30%" />
          <FieldRow name="Zinssatz" type="Prozent" note="Default: 3.8%" />
          <FieldRow name="Tilgung" type="Prozent" note="Default: 2%" />
          <FieldRow name="Instandhaltung" type="EUR/Jahr" />
          <FieldRow name="Verwaltung" type="EUR/Jahr" />
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Einheiten (pro Objekt, min. 1)</Text>

          <Text style={{ fontSize: 9, fontWeight: 600, color: '#475569', marginBottom: 5 }}>Basisdaten:</Text>
          <FieldRow name="Nutzung" type="Select" required note="Wohnen/Gewerbe/Stellplatz" />
          <FieldRow name="Fläche" type="m²" />
          <FieldRow name="Kaltmiete" type="EUR/Monat" />
          <FieldRow name="Marktmiete" type="EUR/m²" note="Default: 12" />
          <FieldRow name="Mietvertragsart" type="Select" note="Standard/Index/Staffel" />

          <Text style={{ fontSize: 9, fontWeight: 600, color: '#475569', marginTop: 10, marginBottom: 5 }}>Erweiterte Daten (aufklappbar):</Text>
          <FieldRow name="Vertragsbeginn" type="Datum" />
          <FieldRow name="Letzte Mieterhöhung" type="Datum" />
          <FieldRow name="Höhe Mieterhöhung" type="EUR" />
          <FieldRow name="§558 Datum" type="Datum" note="Mieterhöhung" />
          <FieldRow name="§558 Betrag" type="EUR" />
          <FieldRow name="§559 Datum" type="Datum" note="Modernisierung" />
          <FieldRow name="§559 Betrag" type="EUR/Monat" />
        </View>

        {/* Schritt 4: Übersicht */}
        <View style={styles.stepContainer}>
          <View style={[styles.stepHeader, { backgroundColor: '#f59e0b' }]}>
            <Text style={styles.stepTitle}>Schritt 4: Übersicht & Absenden</Text>
            <Text style={styles.stepDescription}>Zusammenfassung aller eingegebenen Daten</Text>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Angezeigte Informationen</Text>
            <Text style={{ fontSize: 9, color: '#475569', lineHeight: 1.5 }}>
              • Kontaktdaten des Mandanten{'\n'}
              • Ankaufsprofil-Zusammenfassung (wenn erstellt){'\n'}
              • Portfolio-Übersicht: Anzahl Objekte, Einheiten, Gesamtfläche, Jahresmiete{'\n'}
              • Liste aller Objekte mit Kurzinfo{'\n'}
              • Hinweis auf E-Mail mit Zugangsdaten
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Nach dem Absenden werden folgende Aktionen ausgeführt:{'\n'}
              1. Mandant wird in der Datenbank erstellt{'\n'}
              2. Ankaufsprofil wird erstellt (wenn aktiviert){'\n'}
              3. Auth-User wird mit generiertem Passwort erstellt{'\n'}
              4. Objekte und Einheiten werden gespeichert{'\n'}
              5. Welcome-E-Mail mit Zugangsdaten wird versendet{'\n'}
              6. Admin wird per Webhook benachrichtigt
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Imperoyal Immobilien - Onboarding Dokumentation</Text>
          <Text style={styles.pageNumber}>Seite 4 von 4</Text>
        </View>
      </Page>
    </Document>
  );
}
