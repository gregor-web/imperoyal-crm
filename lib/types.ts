// =====================================================
// Imperoyal Immobilien - TypeScript Types
// =====================================================

// =====================================================
// ENUMS & CONSTANTS
// =====================================================

export type UserRole = 'admin' | 'mandant';
export type Nutzungsart = 'Wohnen' | 'Gewerbe' | 'Stellplatz';
export type Mietvertragsart = 'Standard' | 'Index' | 'Staffel';
export type AuswertungStatus = 'erstellt' | 'abgeschlossen';
export type AnfrageStatus = 'offen' | 'bezahlt' | 'in_bearbeitung' | 'fertig' | 'versendet';
export type Empfehlung = 'HALTEN' | 'OPTIMIEREN' | 'RESTRUKTURIEREN' | 'VERKAUFEN';

export const OPTIONS = {
  kontaktart: ['Telefon', 'E-Mail', 'Videokonferenz'] as const,
  assetklassen: [
    'MFH',
    'Wohn- & Geschäftshaus',
    'Büro',
    'Retail',
    'Logistik',
    'Light Industrial',
    'Betreiberimmobilien',
    'Grundstücke',
    'Development',
  ] as const,
  gebaeudetyp: [
    'MFH',
    'Wohn- & Geschäftshaus',
    'Büro',
    'Retail',
    'Logistik',
    'Spezialimmobilie',
  ] as const,
  heizungsart: ['Gas', 'Öl', 'Wärmepumpe', 'Fernwärme', 'Elektro', 'Sonstige'] as const,
  mietvertragsart: ['Standard', 'Index', 'Staffel'] as const,
  nutzung: ['Wohnen', 'Gewerbe', 'Stellplatz'] as const,
  haltedauer: ['0-3 Jahre', '3-7 Jahre', '7+ Jahre'] as const,
  primaeresziel: [
    'Cashflow',
    'Rendite',
    'AfA/RND',
    'Exit',
    'Repositionierung',
    'Portfolio-Umschichtung',
  ] as const,
  risikoprofil: ['Konservativ', 'Core', 'Core+', 'Value-Add', 'Opportunistisch'] as const,
  laender: ['Deutschland'] as const,
  // Ankaufsprofil-spezifische Optionen
  lagepraeferenz: [
    'A-Lage',
    'B-Lage',
    'C-Lage',
    'Metropolregion',
    'Universitätsstadt',
    'Wachstumsregion',
  ] as const,
  finanzierungsform: [
    'Voll-EK',
    'EK-dominant',
    'Standard-Finanzierung',
    'Offen',
  ] as const,
  zustand: [
    'Sanierungsbedürftig',
    'Teilsaniert',
    'Vollsaniert',
    'Denkmal',
    'Revitalisierung möglich',
  ] as const,
} as const;

// =====================================================
// DATABASE ENTITIES
// =====================================================

export interface Profile {
  id: string;
  role: UserRole;
  name: string | null;
  email: string | null;
  mandant_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Mandant {
  id: string;
  name: string;
  anrede: 'Herr' | 'Frau' | null;
  ansprechpartner: string | null;
  position: string | null;
  email: string;
  telefon: string | null;
  strasse: string | null;
  plz: string | null;
  ort: string | null;
  land: string;
  kontaktart: string | null;
  created_at: string;
  updated_at: string;
}

export interface Objekt {
  id: string;
  mandant_id: string;

  // Adresse
  strasse: string;
  plz: string;
  ort: string;

  // Gebäudedaten
  gebaeudetyp: string | null;
  baujahr: number | null;
  denkmalschutz: boolean;
  kernsanierung_jahr: number | null;
  wohneinheiten: number;
  gewerbeeinheiten: number;
  geschosse: number | null;
  aufzug: boolean;

  // Flächen
  wohnflaeche: number | null;
  gewerbeflaeche: number | null;
  grundstueck: number | null;

  // Technik
  heizungsart: string | null;

  // WEG / Rechtliches
  weg_aufgeteilt: boolean;
  weg_geplant: boolean;
  milieuschutz: boolean;
  umwandlungsverbot: boolean;

  // Finanzierung
  kaufpreis: number;
  kaufdatum: string | null;
  grundstueck_wert: number | null;
  gebaeude_wert: number | null;
  darlehensstand: number | null;
  zinssatz: number;
  tilgung: number;
  eigenkapital_prozent: number;

  // Bewirtschaftung
  leerstandsquote: number | null;
  betriebskosten_nicht_umlage: number | null;
  instandhaltung: number | null;
  verwaltung: number | null;
  ruecklagen: number | null;

  // CAPEX
  capex_vergangen: string | null;
  capex_geplant: string | null;
  capex_geplant_betrag: number | null;

  // Regulierung
  mietpreisbindung: boolean;
  sozialbindung: boolean;
  modernisierungsstopp: boolean;
  gewerbe_sonderklauseln: boolean;

  // Strategie
  haltedauer: string | null;
  primaeres_ziel: string | null;
  investitionsbereitschaft: string | null;
  risikoprofil: string | null;

  created_at: string;
  updated_at: string;
}

export interface Einheit {
  id: string;
  objekt_id: string;
  position: number;
  nutzung: Nutzungsart;
  flaeche: number | null;
  kaltmiete: number | null;
  vergleichsmiete: number;
  mietvertragsart: Mietvertragsart;
  vertragsbeginn: string | null;
  letzte_mieterhoehung: string | null;
  hoehe_mieterhoehung: number | null;
  // §558 BGB Felder
  datum_558: string | null;
  hoehe_558: number | null;
  // §559 BGB Felder
  datum_559: string | null;
  art_modernisierung_559: string | null;
  hoehe_559: number | null;
  created_at: string;
  updated_at: string;
}

// =====================================================
// PDF SECTION CONFIG
// =====================================================

export type PdfSectionId =
  | 'steckbrief'       // Objektsteckbrief + Potenzial + Metrics + Beleihung + Marktdaten
  | 'finanzierung'     // Section 1: Finanzierungsprofil
  | 'ertrag'           // Section 2: Ertragsprofil
  | 'cashflow'         // Section 3: Cashflow-Analyse
  | 'kosten'           // Section 4: Kostenstruktur
  | 'mieterhohung'     // Section 5: Mieterhöhungstabelle §558 BGB
  | 'cashflow_chart'   // Section 6: Cashflow IST vs. Optimiert
  | 'wertentwicklung'  // Section 7: Wertentwicklung
  | 'capex'            // Section 8: CAPEX & §559 BGB
  | 'weg'              // Section 9: WEG-Potenzial
  | 'afa'              // Section 10: AfA & Restnutzungsdauer
  | 'roi'              // Section 11: ROI-Analyse
  | 'exit'             // Section 12: Exit-Szenarien
  | 'empfehlung'       // Zusammenfassung & Empfehlung
  | 'erlaeuterungen';  // Erläuterungen / Glossar

export interface PdfSectionItem {
  id: PdfSectionId;
  label: string;
  visible: boolean;
  order: number;
}

export interface PdfConfig {
  sections: PdfSectionItem[];
}

export const DEFAULT_PDF_SECTIONS: PdfSectionItem[] = [
  { id: 'steckbrief',      label: 'Objektsteckbrief & Marktdaten',  visible: true, order: 0 },
  { id: 'finanzierung',    label: '1 – Finanzierungsprofil',        visible: true, order: 1 },
  { id: 'ertrag',          label: '2 – Ertragsprofil',              visible: true, order: 2 },
  { id: 'cashflow',        label: '3 – Cashflow-Analyse',           visible: true, order: 3 },
  { id: 'kosten',          label: '4 – Kostenstruktur',             visible: true, order: 4 },
  { id: 'mieterhohung',    label: '5 – Mieterhöhungen §558 BGB',   visible: true, order: 5 },
  { id: 'cashflow_chart',  label: '6 – Cashflow IST vs. Optimiert', visible: true, order: 6 },
  { id: 'wertentwicklung', label: '7 – Wertentwicklung',            visible: true, order: 7 },
  { id: 'capex',           label: '8 – CAPEX & §559 BGB',          visible: true, order: 8 },
  { id: 'weg',             label: '9 – WEG-Potenzial',             visible: true, order: 9 },
  { id: 'afa',             label: '10 – AfA & Restnutzungsdauer',   visible: true, order: 10 },
  { id: 'roi',             label: '11 – ROI-Analyse',               visible: true, order: 11 },
  { id: 'exit',            label: '12 – Exit-Szenarien',            visible: true, order: 12 },
  { id: 'empfehlung',      label: 'Zusammenfassung & Empfehlung',   visible: true, order: 13 },
  { id: 'erlaeuterungen',  label: 'Erläuterungen / Glossar',        visible: true, order: 14 },
];

export interface Auswertung {
  id: string;
  objekt_id: string;
  mandant_id: string;
  berechnungen: Berechnungen | null;
  empfehlung: Empfehlung | null;
  empfehlung_prioritaet: string | null;
  empfehlung_begruendung: string | null;
  empfehlung_fazit: string | null;
  empfehlung_handlungsschritte: string[] | null;
  empfehlung_chancen: string[] | null;
  empfehlung_risiken: string[] | null;
  erlaeuterungen: Erlaeuterungen | null;
  pdf_url: string | null;
  pdf_config: PdfConfig | null;
  status: AuswertungStatus;
  created_at: string;
}

export interface Ankaufsprofil {
  id: string;
  mandant_id: string;
  name: string;
  // 2.1 Allgemeine Ankaufsparameter
  kaufinteresse_aktiv: boolean;
  assetklassen: string[] | null;
  // 2.2 Standortprofil
  regionen: string | null;
  lagepraeferenz: string[] | null;
  // 2.3 Finanzielle Ankaufsparameter
  min_volumen: number | null;
  max_volumen: number | null;
  kaufpreisfaktor: number | null;
  rendite_min: number | null; // Zielrendite IST
  rendite_soll: number | null; // Zielrendite SOLL
  finanzierungsform: string | null;
  // 2.3 Objektspezifische Kriterien
  zustand: string[] | null;
  baujahr_von: number | null;
  baujahr_bis: number | null;
  min_wohnflaeche: number | null;
  min_gewerbeflaeche: number | null;
  min_wohneinheiten: number | null;
  min_gewerbeeinheiten: number | null;
  min_grundstueck: number | null;
  // 2.4 Zusätzliche Angaben
  ausgeschlossene_partner: boolean;
  ausgeschlossene_partner_liste: string | null;
  sonstiges: string | null; // Besondere Bedingungen / Präferenzen
  weitere_projektarten: string | null;
  created_at: string;
  updated_at: string;
}

export interface Anfrage {
  id: string;
  objekt_id: string;
  mandant_id: string;
  status: AnfrageStatus;
  created_at: string;
}

// =====================================================
// JOINED / EXTENDED TYPES
// =====================================================

export interface ObjektMitEinheiten extends Objekt {
  einheiten: Einheit[];
}

export interface ObjektMitMandant extends Objekt {
  mandant: Mandant;
}

export interface AuswertungMitObjekt extends Auswertung {
  objekt: Objekt;
  mandant: Mandant;
}

export interface AnfrageMitDetails extends Anfrage {
  objekt: Objekt;
  mandant: Mandant;
}

// =====================================================
// BERECHNUNGEN (Calculation Results)
// =====================================================

export interface Zinsaenderungsszenario {
  zinsbindung_endet: string; // ISO date string
  restschuld_bei_ende: number;
  erwarteter_zins: number; // neuer Zinssatz nach Ablauf
  kapitaldienst_neu: number;
  kapitaldienst_differenz: number; // Mehrbelastung p.a.
}

export interface Finanzierung {
  kaufpreis: number;
  eigenkapital: number;
  fremdkapital: number;
  zinssatz: number;
  tilgung: number;
  kapitaldienst: number;
  kapitaldienst_monat: number;
  zinsaenderung?: Zinsaenderungsszenario;
}

export interface MietanalyseEinheit {
  position: number;
  nutzung: Nutzungsart;
  flaeche: number;
  kaltmiete_ist: number;
  kaltmiete_soll: number;
  potenzial: number;
  potenzial_prozent: number;
}

export interface Mieterhoehung558 {
  position: number;
  moeglich: string;
  betrag: number;
  grund: string;
}

export interface Mietanalyse {
  miete_ist_monat: number;
  miete_ist_jahr: number;
  miete_soll_monat: number;
  miete_soll_jahr: number;
  potenzial_monat: number;
  potenzial_jahr: number;
  einheiten: MietanalyseEinheit[];
  mieterhoehungen_558: Mieterhoehung558[];
}

export interface Modernisierungsumlage559 {
  capex_betrag: number;
  umlage_8_prozent: number;
  umlage_nach_kappung: number;
  differenz: number;
  anzahl_einheiten_berechtigt: number; // Einheiten ohne Indexmietvertrag
  anzahl_einheiten_gesamt: number;
}

export interface Kostenstruktur {
  betriebskosten_nicht_umlage: number;
  instandhaltung: number;
  verwaltung: number;
  ruecklagen: number;
  kosten_gesamt: number;
  kostenquote: number;
  bewertung: 'gesund' | 'durchschnittlich' | 'erhöht';
}

export interface Cashflow {
  cashflow_ist_monat: number;
  cashflow_ist_jahr: number;
  cashflow_opt_monat: number;
  cashflow_opt_jahr: number;
}

export interface Rendite {
  rendite_ist: number;
  rendite_opt: number;
  eigenkapitalrendite_ist: number;
  eigenkapitalrendite_opt: number;
}

export interface WegPotenzial {
  wert_heute: number;
  wert_aufgeteilt: number;
  weg_gewinn: number;
  bereits_aufgeteilt: boolean;
  genehmigung_erforderlich: boolean;
  hinweistext: string; // "Genehmigungspflichtig, kann versagt werden" oder "WEG-Aufteilung grundsätzlich möglich"
}

export interface AfaRnd {
  baujahr: number;
  alter: number;
  rnd: number;
  gebaeude_wert: number;
  afa_jahr: number;
  steuerersparnis_42: number;
}

export interface Wertentwicklung {
  heute: number;
  jahr_3: number;
  jahr_5: number;
  jahr_7: number;
  jahr_10: number;
}

export interface Berechnungen {
  finanzierung: Finanzierung;
  mietanalyse: Mietanalyse;
  modernisierung_559: Modernisierungsumlage559;
  kostenstruktur: Kostenstruktur;
  cashflow: Cashflow;
  rendite: Rendite;
  weg_potenzial: WegPotenzial;
  afa_rnd: AfaRnd;
  wertentwicklung: Wertentwicklung;
  marktdaten?: MarktDaten | null;
}

// =====================================================
// ERLÄUTERUNGEN (Explanations for laypeople)
// =====================================================

export interface Erlaeuterungen {
  finanzierungsprofil: string;
  ertragsprofil: string;
  mietanalyse: string;
  cashflow: string;
  kostenstruktur: string;
  wertentwicklung: string;
  capex_559: string;
  weg_potenzial: string;
  rnd_afa: string;
  roi: string;
  exit: string;
  handlungsempfehlung: string;
}

// =====================================================
// CLAUDE API RESPONSE
// =====================================================

export interface Handlungsschritt {
  schritt: string;
  zeitrahmen: string;
}

export interface ClaudeEmpfehlung {
  empfehlung: Empfehlung;
  prioritaet: string;
  begruendung: string;
  fazit: string;
  handlungsschritte: Handlungsschritt[] | string[]; // Support both formats
  chancen: string[];
  risiken: string[];
}

// =====================================================
// MATCHING
// =====================================================

export interface MatchingResult {
  ankaufsprofil: Ankaufsprofil;
  mandant: Mandant;
  score: number;
  matches: {
    volumen: boolean;
    assetklasse: boolean;
    region: boolean;
  };
}

// =====================================================
// FORM INPUT TYPES
// =====================================================

export interface MandantFormData {
  name: string;
  ansprechpartner: string;
  position: string;
  email: string;
  telefon: string;
  strasse: string;
  plz: string;
  ort: string;
  land: string;
  kontaktart: string;
}

export interface ObjektFormData {
  mandant_id: string;
  strasse: string;
  plz: string;
  ort: string;
  gebaeudetyp: string;
  baujahr: number | null;
  denkmalschutz: boolean;
  kernsanierung_jahr: number | null;
  wohneinheiten: number;
  gewerbeeinheiten: number;
  geschosse: number | null;
  aufzug: boolean;
  wohnflaeche: number | null;
  gewerbeflaeche: number | null;
  grundstueck: number | null;
  heizungsart: string;
  weg_aufgeteilt: boolean;
  weg_geplant: boolean;
  milieuschutz: boolean;
  umwandlungsverbot: boolean;
  kaufpreis: number;
  kaufdatum: string;
  grundstueck_wert: number | null;
  gebaeude_wert: number | null;
  darlehensstand: number | null;
  zinssatz: number;
  tilgung: number;
  eigenkapital_prozent: number;
  leerstandsquote: number | null;
  betriebskosten_nicht_umlage: number | null;
  instandhaltung: number | null;
  verwaltung: number | null;
  ruecklagen: number | null;
  capex_vergangen: string;
  capex_geplant: string;
  capex_geplant_betrag: number | null;
  mietpreisbindung: boolean;
  sozialbindung: boolean;
  modernisierungsstopp: boolean;
  gewerbe_sonderklauseln: boolean;
  haltedauer: string;
  primaeres_ziel: string;
  investitionsbereitschaft: string;
  risikoprofil: string;
}

export interface EinheitFormData {
  position: number;
  nutzung: Nutzungsart;
  flaeche: number | null;
  kaltmiete: number | null;
  vergleichsmiete: number;
  mietvertragsart: Mietvertragsart;
  vertragsbeginn: string | null;
  letzte_mieterhoehung: string | null;
  hoehe_mieterhoehung: number | null;
  // §558 BGB
  datum_558: string | null;
  hoehe_558: number | null;
  // §559 BGB
  datum_559: string | null;
  art_modernisierung_559: string | null;
  hoehe_559: number | null;
}

export interface AnkaufsprofilFormData {
  name: string;
  // 2.1 Allgemeine Ankaufsparameter
  kaufinteresse_aktiv: boolean;
  assetklassen: string[];
  // 2.2 Standortprofil
  regionen: string;
  lagepraeferenz: string[];
  // 2.3 Finanzielle Ankaufsparameter
  min_volumen: number | null;
  max_volumen: number | null;
  kaufpreisfaktor: number | null;
  rendite_min: number | null;
  rendite_soll: number | null;
  finanzierungsform: string;
  // 2.3 Objektspezifische Kriterien
  zustand: string[];
  baujahr_von: number | null;
  baujahr_bis: number | null;
  min_wohnflaeche: number | null;
  min_gewerbeflaeche: number | null;
  min_wohneinheiten: number | null;
  min_gewerbeeinheiten: number | null;
  min_grundstueck: number | null;
  // 2.4 Zusätzliche Angaben
  ausgeschlossene_partner: boolean;
  ausgeschlossene_partner_liste: string;
  sonstiges: string;
  weitere_projektarten: string;
}

// =====================================================
// MARKTDATEN (Perplexity API Response)
// =====================================================

export interface MarktDaten {
  vergleichsmiete_wohnen: {
    wert: number;
    quelle: string;
  };
  vergleichsmiete_gewerbe: {
    wert: number;
    quelle: string;
  };
  kappungsgrenze: {
    vorhanden: boolean;
    prozent: 15 | 20;
  };
  milieuschutzgebiet: {
    vorhanden: boolean;
    gebiet_name: string | null;
  };
  kaufpreisfaktor_region: {
    wert: number;
    quelle: string;
  };
  aktuelle_bauzinsen: {
    wert: number;
    zinsbindung: string;
  };
  preisprognose: {
    kurz_0_3_jahre: number; // % p.a.
    mittel_3_7_jahre: number;
    lang_7_plus_jahre: number;
  };
  abfrage_datum: string;
  standort: string;
}