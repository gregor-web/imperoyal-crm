// =====================================================
// Imperoyal Immobilien - Berechnungslogik
// Migriert aus reference/original.html Zeilen 413-536
// =====================================================

import type {
  Objekt,
  Einheit,
  Berechnungen,
  Finanzierung,
  Mietanalyse,
  MietanalyseEinheit,
  Mieterhoehung558,
  Modernisierungsumlage559,
  Kostenstruktur,
  Cashflow,
  Rendite,
  WegPotenzial,
  AfaRnd,
  Wertentwicklung,
} from './types';
import { addMonths, monthsBetween, formatDate } from './formatters';

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Safely parse a number, returning a default if invalid
 */
const safeNumber = (val: number | string | null | undefined, defaultVal = 0): number => {
  if (val == null) return defaultVal;
  const num = typeof val === 'string' ? parseFloat(val) : val;
  return isNaN(num) ? defaultVal : num;
};

// =====================================================
// §558 BGB - MIETERHÖHUNG
// =====================================================

interface Mieterhoehung558Result {
  moeglich: string;
  betrag: number;
  grund: string;
}

/**
 * Berechnet die nächste mögliche Mieterhöhung nach §558 BGB
 *
 * Kappungsgrenze: 20% in 3 Jahren (15% in Kappungsgebieten)
 * Sperrfrist: 15 Monate nach letzter Erhöhung
 */
export function berechneNaechsteMieterhoehung(
  einheit: Einheit,
  istKappungsgebiet: boolean = false
): Mieterhoehung558Result {
  const kappungsgrenze = istKappungsgebiet ? 0.15 : 0.20;
  const letzteMieterhoehung = einheit.letzte_mieterhoehung
    ? new Date(einheit.letzte_mieterhoehung)
    : null;
  const heute = new Date();
  const flaeche = safeNumber(einheit.flaeche);
  const kaltmiete = safeNumber(einheit.kaltmiete);
  const vergleichsmiete = safeNumber(einheit.vergleichsmiete, 12);
  const sollMiete = flaeche * vergleichsmiete;

  // Wenn keine letzte Erhöhung bekannt → sofort möglich mit voller Kappung
  if (!letzteMieterhoehung) {
    const maxErhoehung = kaltmiete * kappungsgrenze;
    const potenzielleErhoehung = Math.min(maxErhoehung, sollMiete - kaltmiete);
    return {
      moeglich: 'Sofort',
      betrag: Math.max(0, potenzielleErhoehung),
      grund: 'Keine letzte Erhöhung bekannt',
    };
  }

  const monateSeitErhoehung = monthsBetween(letzteMieterhoehung, heute);

  if (monateSeitErhoehung >= 36) {
    // Mehr als 3 Jahre her → volle Kappungsgrenze
    const maxErhoehung = kaltmiete * kappungsgrenze;
    const potenzielleErhoehung = Math.min(maxErhoehung, sollMiete - kaltmiete);
    return {
      moeglich: 'Sofort',
      betrag: Math.max(0, potenzielleErhoehung),
      grund: `Letzte Erhöhung vor ${Math.floor(monateSeitErhoehung / 12)} Jahren`,
    };
  } else if (monateSeitErhoehung >= 15) {
    // 15-36 Monate → teilweise möglich
    const restMonate = 36 - monateSeitErhoehung;
    const maxErhoehung = kaltmiete * kappungsgrenze * (monateSeitErhoehung / 36);
    const potenzielleErhoehung = Math.min(maxErhoehung, sollMiete - kaltmiete);
    return {
      moeglich: 'Teilweise',
      betrag: Math.max(0, potenzielleErhoehung),
      grund: `Volle Kappung in ${restMonate} Monaten`,
    };
  } else {
    // Weniger als 15 Monate → Sperrfrist
    const naechstesMoeglich = addMonths(letzteMieterhoehung, 15);
    return {
      moeglich: formatDate(naechstesMoeglich),
      betrag: 0,
      grund: 'Sperrfrist §558 BGB (15 Monate)',
    };
  }
}

// =====================================================
// HAUPTBERECHNUNG
// =====================================================

/**
 * Führt alle Berechnungen für ein Objekt durch.
 * Dies ist das Herzstück der App.
 */
export function berechneAlles(objekt: Objekt, einheiten: Einheit[]): Berechnungen {
  // =====================================================
  // 1. FINANZIERUNG
  // =====================================================

  const kaufpreis = safeNumber(objekt.kaufpreis);
  const ek_prozent = safeNumber(objekt.eigenkapital_prozent, 30);
  const zinssatz = safeNumber(objekt.zinssatz, 3.8);
  const tilgung = safeNumber(objekt.tilgung, 2);

  const eigenkapital = kaufpreis * (ek_prozent / 100);
  const fremdkapital = kaufpreis - eigenkapital;
  const kapitaldienst = fremdkapital * ((zinssatz + tilgung) / 100);
  const kapitaldienst_monat = kapitaldienst / 12;

  const finanzierung: Finanzierung = {
    kaufpreis,
    eigenkapital,
    fremdkapital,
    zinssatz,
    tilgung,
    kapitaldienst,
    kapitaldienst_monat,
  };

  // =====================================================
  // 2. MIETANALYSE
  // =====================================================

  const istKappungsgebiet = objekt.milieuschutz === true;
  let miete_ist_monat = 0;
  let miete_soll_monat = 0;
  let flaeche_gesamt = 0;

  const einheitenAnalyse: MietanalyseEinheit[] = einheiten.map((e) => {
    const flaeche = safeNumber(e.flaeche);
    const kaltmiete = safeNumber(e.kaltmiete);
    const vergleichsmiete = safeNumber(e.vergleichsmiete, 12);

    // SOLL-Miete: Bei Standard-Verträgen max(kaltmiete, flaeche × vergleichsmiete)
    // Bei Index/Staffel: kaltmiete bleibt
    const sollMiete =
      e.mietvertragsart === 'Standard'
        ? Math.max(kaltmiete, flaeche * vergleichsmiete)
        : kaltmiete;

    const potenzial = sollMiete - kaltmiete;
    const potenzial_prozent =
      kaltmiete > 0 ? (potenzial / kaltmiete) * 100 : sollMiete > 0 ? 100 : 0;

    miete_ist_monat += kaltmiete;
    miete_soll_monat += sollMiete;
    flaeche_gesamt += flaeche;

    return {
      position: e.position,
      nutzung: e.nutzung,
      flaeche,
      kaltmiete_ist: kaltmiete,
      kaltmiete_soll: sollMiete,
      potenzial,
      potenzial_prozent,
    };
  });

  // §558 BGB Mieterhöhungen
  const mieterhoehungen_558: Mieterhoehung558[] = einheiten
    .filter((e) => e.mietvertragsart === 'Standard')
    .map((e) => {
      const result = berechneNaechsteMieterhoehung(e, istKappungsgebiet);
      return {
        position: e.position,
        moeglich: result.moeglich,
        betrag: result.betrag,
        grund: result.grund,
      };
    });

  const miete_ist_jahr = miete_ist_monat * 12;
  const miete_soll_jahr = miete_soll_monat * 12;
  const potenzial_monat = miete_soll_monat - miete_ist_monat;
  const potenzial_jahr = potenzial_monat * 12;

  const mietanalyse: Mietanalyse = {
    miete_ist_monat,
    miete_ist_jahr,
    miete_soll_monat,
    miete_soll_jahr,
    potenzial_monat,
    potenzial_jahr,
    einheiten: einheitenAnalyse,
    mieterhoehungen_558,
  };

  // =====================================================
  // 3. §559 BGB - MODERNISIERUNGSUMLAGE
  // =====================================================

  const capex_betrag = safeNumber(objekt.capex_geplant_betrag);
  const umlage_8_prozent = capex_betrag * 0.08;

  // Kappungsgrenzen nach §559 Abs. 3a BGB
  let umlage_nach_kappung = 0;
  einheitenAnalyse.forEach((e) => {
    const euroProQm = e.flaeche > 0 ? e.kaltmiete_ist / e.flaeche : 0;
    const maxEuroProQm = euroProQm < 7 ? 2 : 3;
    const maxErhoehungProJahr = (e.flaeche * maxEuroProQm) / 6;
    umlage_nach_kappung += maxErhoehungProJahr * 12;
  });

  const umlage_effektiv = Math.min(umlage_8_prozent, umlage_nach_kappung);

  const modernisierung_559: Modernisierungsumlage559 = {
    capex_betrag,
    umlage_8_prozent,
    umlage_nach_kappung,
    differenz: umlage_8_prozent - umlage_effektiv,
  };

  // =====================================================
  // 4. KOSTENSTRUKTUR
  // =====================================================

  const betriebskosten_nicht_umlage = safeNumber(objekt.betriebskosten_nicht_umlage);
  const instandhaltung = safeNumber(objekt.instandhaltung) || flaeche_gesamt * 12;
  const verwaltung = safeNumber(objekt.verwaltung) || einheiten.length * 300;
  const ruecklagen = safeNumber(objekt.ruecklagen);

  const kosten_gesamt =
    betriebskosten_nicht_umlage + instandhaltung + verwaltung + ruecklagen;
  const kostenquote = miete_ist_jahr > 0 ? (kosten_gesamt / miete_ist_jahr) * 100 : 0;

  let bewertung: 'gesund' | 'durchschnittlich' | 'erhöht';
  if (kostenquote < 25) {
    bewertung = 'gesund';
  } else if (kostenquote <= 35) {
    bewertung = 'durchschnittlich';
  } else {
    bewertung = 'erhöht';
  }

  const kostenstruktur: Kostenstruktur = {
    betriebskosten_nicht_umlage,
    instandhaltung,
    verwaltung,
    ruecklagen,
    kosten_gesamt,
    kostenquote,
    bewertung,
  };

  // =====================================================
  // 5. CASHFLOW
  // =====================================================

  const cashflow_ist_jahr = miete_ist_jahr - kapitaldienst - kosten_gesamt;
  const cashflow_opt_jahr = miete_soll_jahr - kapitaldienst - kosten_gesamt;

  const cashflow: Cashflow = {
    cashflow_ist_monat: cashflow_ist_jahr / 12,
    cashflow_ist_jahr,
    cashflow_opt_monat: cashflow_opt_jahr / 12,
    cashflow_opt_jahr,
  };

  // =====================================================
  // 6. RENDITE
  // =====================================================

  const rendite_ist = kaufpreis > 0 ? (miete_ist_jahr / kaufpreis) * 100 : 0;
  const rendite_opt = kaufpreis > 0 ? (miete_soll_jahr / kaufpreis) * 100 : 0;
  const eigenkapitalrendite_ist =
    eigenkapital > 0 ? (cashflow_ist_jahr / eigenkapital) * 100 : 0;
  const eigenkapitalrendite_opt =
    eigenkapital > 0 ? (cashflow_opt_jahr / eigenkapital) * 100 : 0;

  const rendite: Rendite = {
    rendite_ist,
    rendite_opt,
    eigenkapitalrendite_ist,
    eigenkapitalrendite_opt,
  };

  // =====================================================
  // 7. WEG-POTENZIAL
  // =====================================================

  const bereits_aufgeteilt = objekt.weg_aufgeteilt === true;
  const wert_aufgeteilt = kaufpreis * 1.15;
  const weg_gewinn = bereits_aufgeteilt ? 0 : wert_aufgeteilt - kaufpreis;
  const genehmigung_erforderlich =
    objekt.milieuschutz === true || objekt.umwandlungsverbot === true;

  const weg_potenzial: WegPotenzial = {
    wert_heute: kaufpreis,
    wert_aufgeteilt,
    weg_gewinn,
    bereits_aufgeteilt,
    genehmigung_erforderlich,
  };

  // =====================================================
  // 8. AfA / RND
  // =====================================================

  const baujahr = safeNumber(objekt.baujahr, 1970);
  const aktuellesJahr = new Date().getFullYear();
  const alter = aktuellesJahr - baujahr;
  const rnd = Math.max(10, Math.min(80, 80 - alter));
  const gebaeude_wert = objekt.gebaeude_wert || kaufpreis * 0.8;
  const afa_jahr = gebaeude_wert / rnd;
  const steuerersparnis_42 = afa_jahr * 0.42;

  const afa_rnd: AfaRnd = {
    baujahr,
    alter,
    rnd,
    gebaeude_wert,
    afa_jahr,
    steuerersparnis_42,
  };

  // =====================================================
  // 9. WERTENTWICKLUNG (2,5% p.a.)
  // =====================================================

  const steigerung = 1.025;

  const wertentwicklung: Wertentwicklung = {
    heute: kaufpreis,
    jahr_3: kaufpreis * Math.pow(steigerung, 3),
    jahr_5: kaufpreis * Math.pow(steigerung, 5),
    jahr_7: kaufpreis * Math.pow(steigerung, 7),
    jahr_10: kaufpreis * Math.pow(steigerung, 10),
  };

  // =====================================================
  // ERGEBNIS
  // =====================================================

  return {
    finanzierung,
    mietanalyse,
    modernisierung_559,
    kostenstruktur,
    cashflow,
    rendite,
    weg_potenzial,
    afa_rnd,
    wertentwicklung,
  };
}

// =====================================================
// AGGREGIERTE KENNZAHLEN
// =====================================================

export function berechneKennzahlen(berechnungen: Berechnungen) {
  const { finanzierung, mietanalyse, kostenstruktur, cashflow, rendite, weg_potenzial } =
    berechnungen;

  const einheitenMitPotenzial = mietanalyse.einheiten.filter((e) => e.potenzial > 0).length;
  const mietpotenzial_prozent =
    mietanalyse.miete_ist_jahr > 0
      ? (mietanalyse.potenzial_jahr / mietanalyse.miete_ist_jahr) * 100
      : 0;

  return {
    kaufpreis: finanzierung.kaufpreis,
    rendite_ist: rendite.rendite_ist,
    rendite_opt: rendite.rendite_opt,
    cashflow_ist: cashflow.cashflow_ist_jahr,
    cashflow_opt: cashflow.cashflow_opt_jahr,
    mietpotenzial: mietanalyse.potenzial_jahr,
    mietpotenzial_prozent,
    kostenquote: kostenstruktur.kostenquote,
    einheitenMitPotenzial,
    einheitenGesamt: mietanalyse.einheiten.length,
    weg_gewinn: weg_potenzial.weg_gewinn,
  };
}

// =====================================================
// CHART-DATEN GENERATOREN
// =====================================================

export function getCashflowChartData(berechnungen: Berechnungen) {
  const { mietanalyse, finanzierung, kostenstruktur } = berechnungen;
  return [
    {
      name: 'IST',
      miete: mietanalyse.miete_ist_jahr,
      kapitaldienst: finanzierung.kapitaldienst,
      kosten: kostenstruktur.kosten_gesamt,
    },
    {
      name: 'Optimiert',
      miete: mietanalyse.miete_soll_jahr,
      kapitaldienst: finanzierung.kapitaldienst,
      kosten: kostenstruktur.kosten_gesamt,
    },
  ];
}

export function getWertentwicklungChartData(berechnungen: Berechnungen) {
  const { wertentwicklung } = berechnungen;
  return [
    { jahr: 0, wert: wertentwicklung.heute },
    { jahr: 3, wert: wertentwicklung.jahr_3 },
    { jahr: 5, wert: wertentwicklung.jahr_5 },
    { jahr: 7, wert: wertentwicklung.jahr_7 },
    { jahr: 10, wert: wertentwicklung.jahr_10 },
  ];
}

export function getKostenPieChartData(berechnungen: Berechnungen) {
  const { kostenstruktur } = berechnungen;
  return [
    { name: 'Betriebskosten', value: kostenstruktur.betriebskosten_nicht_umlage },
    { name: 'Instandhaltung', value: kostenstruktur.instandhaltung },
    { name: 'Verwaltung', value: kostenstruktur.verwaltung },
    { name: 'Rücklagen', value: kostenstruktur.ruecklagen },
  ].filter((d) => d.value > 0);
}

export function getErtragsPieChartData(berechnungen: Berechnungen) {
  const { mietanalyse } = berechnungen;
  const grouped = mietanalyse.einheiten.reduce(
    (acc, e) => {
      acc[e.nutzung] = (acc[e.nutzung] || 0) + e.kaltmiete_ist;
      return acc;
    },
    {} as Record<string, number>
  );
  return Object.entries(grouped).map(([name, value]) => ({ name, value }));
}

export function getErtragsBarChartData(berechnungen: Berechnungen) {
  const { mietanalyse } = berechnungen;
  const grouped = mietanalyse.einheiten.reduce(
    (acc, e) => {
      if (!acc[e.nutzung]) acc[e.nutzung] = { ist: 0, soll: 0 };
      acc[e.nutzung].ist += e.kaltmiete_ist;
      acc[e.nutzung].soll += e.kaltmiete_soll;
      return acc;
    },
    {} as Record<string, { ist: number; soll: number }>
  );
  return Object.entries(grouped).map(([nutzung, { ist, soll }]) => ({
    nutzung,
    ist: ist * 12,
    soll: soll * 12,
  }));
}

export function getWegChartData(berechnungen: Berechnungen) {
  const { weg_potenzial } = berechnungen;
  return [
    { name: 'Wert heute', value: weg_potenzial.wert_heute },
    { name: 'Wert aufgeteilt', value: weg_potenzial.wert_aufgeteilt },
  ];
}

export function getRoiChartData(berechnungen: Berechnungen) {
  const { rendite, weg_potenzial, finanzierung, mietanalyse } = berechnungen;
  const roi_mit_weg =
    finanzierung.kaufpreis > 0
      ? ((mietanalyse.miete_soll_jahr + weg_potenzial.weg_gewinn) / finanzierung.kaufpreis) * 100
      : 0;
  return [
    { name: 'ROI IST', value: rendite.rendite_ist },
    { name: 'ROI Optimiert', value: rendite.rendite_opt },
    { name: 'ROI + WEG', value: weg_potenzial.bereits_aufgeteilt ? rendite.rendite_opt : roi_mit_weg },
  ];
}

export function getExitChartData(berechnungen: Berechnungen) {
  const { wertentwicklung } = berechnungen;
  return [
    { name: 'Heute', value: wertentwicklung.heute },
    { name: '+3 Jahre', value: wertentwicklung.jahr_3 },
    { name: '+7 Jahre', value: wertentwicklung.jahr_7 },
    { name: '+10 Jahre', value: wertentwicklung.jahr_10 },
  ];
}
