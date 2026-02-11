// =====================================================
// Imperoyal Immobilien - TypeScript Types
// =====================================================

// =====================================================
// ENUMS & CONSTANTS
// =====================================================

export type UserRole = 'admin' | 'mandant';
export type Nutzungsart = 'Wohnen' | 'Gewerbe' | 'Stellplatz';
export type Mietvertragsart = 'Standard' | 'Index' | 'Staffel';
export type AuswertungStatus = 'erstellt' | 'versendet';
export type AnfrageStatus = 'offen' | 'bearbeitet';
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
  laender: ['Deutschland', 'Österreich', 'Schweiz'] as const,
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
  letzte_mieterhoehung: string | null;
  created_at: string;
  updated_at: string;
}

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
  status: AuswertungStatus;
  created_at: string;
}

export interface Ankaufsprofil {
  id: string;
  mandant_id: string;
  name: string;
  min_volumen: number | null;
  max_volumen: number | null;
  assetklassen: string[] | null;
  regionen: string | null;
  rendite_min: number | null;
  sonstiges: string | null;
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
  letzte_mieterhoehung: string;
}

export interface AnkaufsprofilFormData {
  name: string;
  min_volumen: number | null;
  max_volumen: number | null;
  assetklassen: string[];
  regionen: string;
  rendite_min: number | null;
  sonstiges: string;
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