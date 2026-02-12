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

/**
 * Dynamische Hinweistexte basierend auf Objektdaten
 */

/**
 * Hinweistext für Zinsänderungsszenario
 * Wenn Zinsbindung > 3 Jahre in der Zukunft liegt, kann keine fundierte Aussage getroffen werden
 */
export function getZinsaenderungHinweis(zinsbindungEndet: string | Date): {
  text: string;
  kannAnalysieren: boolean;
} {
  const endeDatum = typeof zinsbindungEndet === 'string' ? new Date(zinsbindungEndet) : zinsbindungEndet;
  const heute = new Date();
  const jahresBisEnde = (endeDatum.getTime() - heute.getTime()) / (1000 * 60 * 60 * 24 * 365);

  if (jahresBisEnde > 3) {
    return {
      text: `Da Ihre Zinsbindung erst am ${endeDatum.toLocaleDateString('de-DE')} endet (in mehr als 3 Jahren), können wir zum jetzigen Zeitpunkt keine fundierte Aussage zur zukünftigen Zinsentwicklung treffen. Eine Neubewertung empfehlen wir ca. 18-24 Monate vor Ablauf der Zinsbindung.`,
      kannAnalysieren: false,
    };
  }

  return {
    text: `Ihre Zinsbindung endet am ${endeDatum.toLocaleDateString('de-DE')}. Wir empfehlen, frühzeitig Angebote für die Anschlussfinanzierung einzuholen.`,
    kannAnalysieren: true,
  };
}

/**
 * Hinweistexte für Mietvertragsarten
 */
export const MIETVERTRAGSART_HINWEISE = {
  Standard: {
    titel: 'Standard-Mietvertrag',
    hinweis: 'Bei Standard-Mietverträgen können Mieterhöhungen nach §558 BGB (bis zur ortsüblichen Vergleichsmiete) und §559 BGB (nach Modernisierung) durchgeführt werden.',
    mieterhoeunngMoeglich: true,
  },
  Index: {
    titel: 'Index-Mietvertrag',
    hinweis: 'Bei Index-Mietverträgen ist die Miete an den Verbraucherpreisindex gekoppelt. Mieterhöhungen nach §558 und §559 BGB sind ausgeschlossen. Die Anpassung erfolgt automatisch basierend auf dem Index (§557b BGB).',
    mieterhoeunngMoeglich: false,
    modernisierungUmlageErlaubt: false,
  },
  Staffel: {
    titel: 'Staffel-Mietvertrag',
    hinweis: 'Bei Staffel-Mietverträgen sind die zukünftigen Mieterhöhungen bereits vertraglich festgelegt. Mieterhöhungen nach §558 und §559 BGB sind für die Laufzeit der Staffelvereinbarung ausgeschlossen. Da uns die individuellen Staffelvereinbarungen nicht vorliegen, können wir keine datenbasierten Prognosen zur Mietentwicklung treffen.',
    mieterhoeunngMoeglich: false,
    prognoseUnmoeglich: true,
  },
};

/**
 * Erstellt eine Zusammenfassung der Mietvertragsarten im Objekt
 */
export function getMietvertragsartZusammenfassung(einheiten: Array<{ mietvertragsart: string }>): string {
  const counts = {
    Standard: 0,
    Index: 0,
    Staffel: 0,
  };

  einheiten.forEach((e) => {
    const art = e.mietvertragsart as keyof typeof counts;
    if (art in counts) counts[art]++;
  });

  const parts: string[] = [];

  if (counts.Standard > 0) {
    parts.push(`${counts.Standard}x Standard-Mietvertrag`);
  }
  if (counts.Index > 0) {
    parts.push(`${counts.Index}x Index-Mietvertrag (§559 ausgeschlossen)`);
  }
  if (counts.Staffel > 0) {
    parts.push(`${counts.Staffel}x Staffel-Mietvertrag (keine Prognose möglich)`);
  }

  return parts.join(', ');
}
