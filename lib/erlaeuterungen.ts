// =====================================================
// Imperoyal Immobilien - Erläuterungstexte
// Verständliche Erklärungen für Immobilien-Laien
// =====================================================

import type { Erlaeuterungen, Kostenstruktur } from './types';

/**
 * Statische Erläuterungstexte für die 12 Analyse-Sektionen
 */
export const ERLAEUTERUNGEN: Erlaeuterungen = {
  finanzierungsprofil: `Das Finanzierungsprofil zeigt die Aufteilung zwischen Eigenkapital und Fremdkapital. Der Kapitaldienst (Zins + Tilgung) ist der jährliche Betrag, der an die Bank gezahlt werden muss.`,

  ertragsprofil: `Das Ertragsprofil zeigt die aktuellen Mieteinnahmen aufgeteilt nach Nutzungsart. Wohnmieten sind stabiler, Gewerbemieten bieten höhere Renditen aber mehr Risiko.`,

  mietanalyse: `Die Mietanalyse vergleicht aktuelle Mieten (IST) mit dem Marktpotenzial (SOLL). Bei Standard-Verträgen kann die Miete bis zur Vergleichsmiete angepasst werden. Index- und Staffelmieten bieten kein Erhöhungspotenzial.`,

  cashflow: `Der Cashflow zeigt, wie viel nach Abzug aller Kosten und des Kapitaldienstes übrig bleibt. Ein positiver Cashflow bedeutet, dass die Immobilie sich selbst trägt.`,

  kostenstruktur: `Die Kostenstruktur umfasst nicht-umlagefähige Betriebskosten, Instandhaltung, Verwaltung und Rücklagen. Eine niedrige Kostenquote deutet auf effizientes Management hin.`,

  wertentwicklung: `Die Wertentwicklung basiert auf 2,5% jährlicher Wertsteigerung. Diese Prognose dient als Orientierung – tatsächliche Entwicklungen können abweichen.`,

  capex_559: `Nach §559 BGB können 8% der Modernisierungskosten auf die Jahresmiete umgelegt werden. Es gelten Kappungsgrenzen: max 2€/m² (bei <7€/m² Kaltmiete) oder 3€/m² Erhöhung in 6 Jahren.`,

  weg_potenzial: `Die WEG-Aufteilung kann den Verkaufswert um ca. 15% steigern. In Milieuschutzgebieten ist eine Aufteilung genehmigungspflichtig oder nicht möglich.`,

  rnd_afa: `Die Restnutzungsdauer (RND) bestimmt den AfA-Satz. Bei 40 Jahren RND können jährlich 2,5% des Gebäudewerts steuerlich abgeschrieben werden.`,

  roi: `Die Rendite zeigt das Verhältnis von Mieteinnahmen zum Kaufpreis. Die Eigenkapitalrendite bezieht sich nur auf das eingesetzte Eigenkapital.`,

  exit: `Die Exit-Szenarien zeigen den voraussichtlichen Verkaufswert. Nach 10 Jahren Haltedauer ist der Gewinn für Privatpersonen steuerfrei.`,

  handlungsempfehlung: `Die Handlungsempfehlung fasst die wichtigsten Optimierungspotenziale zusammen und berücksichtigt Markt, Recht und individuelle Ziele.`,
};

/**
 * Bewertung der Kostenquote
 */
export function getKostenquoteBewertung(
  kostenstruktur: Kostenstruktur
): { text: string; farbe: 'green' | 'yellow' | 'red' } {
  const { kostenquote, bewertung } = kostenstruktur;

  switch (bewertung) {
    case 'gesund':
      return {
        text: `Kostenquote ${kostenquote.toFixed(1)}% ist gesund.`,
        farbe: 'green',
      };
    case 'durchschnittlich':
      return {
        text: `Kostenquote ${kostenquote.toFixed(1)}% ist durchschnittlich.`,
        farbe: 'yellow',
      };
    case 'erhöht':
      return {
        text: `Kostenquote ${kostenquote.toFixed(1)}% ist erhöht – Optimierungspotenzial.`,
        farbe: 'red',
      };
  }
}

/**
 * Kurze Erläuterungen für Tooltips
 */
export const KURZ_ERLAEUTERUNGEN = {
  eigenkapital: 'Anteil des Kaufpreises ohne Kredit',
  fremdkapital: 'Kreditbetrag bei der Bank',
  kapitaldienst: 'Jährliche Zahlung (Zins + Tilgung)',
  rendite: 'Mieteinnahmen / Kaufpreis',
  cashflow: 'Überschuss nach allen Kosten',
  kostenquote: 'Kosten / Mieteinnahmen',
  mietpotenzial: 'Mögliche Steigerung bis Vergleichsmiete',
  kappungsgrenze: 'Max. 20% Erhöhung in 3 Jahren (15% in Kappungsgebieten)',
  sperrfrist: 'Mind. 15 Monate zwischen Erhöhungen',
  rnd: 'Restnutzungsdauer für Abschreibung',
  afa: 'Steuerliche Abschreibung',
  weg: 'Aufteilung in Wohnungseigentum',
};

/**
 * Erläuterungen für Empfehlungstypen
 */
export const EMPFEHLUNGS_ERLAEUTERUNGEN = {
  HALTEN: 'Die Immobilie ist wirtschaftlich sinnvoll. Kein dringender Handlungsbedarf.',
  OPTIMIEREN: 'Durch Mietanpassungen oder Kostensenkung kann die Rentabilität verbessert werden.',
  RESTRUKTURIEREN: 'Größere Veränderungen wie Refinanzierung, WEG-Aufteilung oder Modernisierung sind sinnvoll.',
  VERKAUFEN: 'Die Immobilie passt nicht zur Strategie oder bietet eine attraktive Exit-Möglichkeit.',
};
