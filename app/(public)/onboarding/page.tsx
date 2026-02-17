'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { CheckCircle, ArrowRight, ArrowLeft, Building2, User, Home, ShoppingCart, AlertTriangle } from 'lucide-react';

// =====================================================
// TYPES
// =====================================================

type Einheit = {
  nutzung: 'Wohnen' | 'Gewerbe' | 'Stellplatz';
  flaeche: string;
  kaltmiete: string;
  vergleichsmiete: string;
  mietvertragsart: 'Standard' | 'Index' | 'Staffel';
  // Vertragsdaten
  vertragsbeginn: string;
  letzte_mieterhoehung: string;
  hoehe_mieterhoehung: string;
  // §558 BGB - Vergleichsmiete
  datum_558: string;
  hoehe_558: string;
  // §559 BGB - Modernisierung
  datum_559: string;
  art_modernisierung_559: string;
  hoehe_559: string;
};

type Objekt = {
  strasse: string;
  plz: string;
  ort: string;
  gebaeudetyp: string;
  baujahr: string;
  kernsanierung_jahr: string;
  kaufpreis: string;
  kaufdatum: string;
  eigenkapital_prozent: string;
  zinssatz: string;
  tilgung: string;
  darlehensstand: string;
  grundstueck_wert: string;
  gebaeude_wert: string;
  wohnflaeche: string;
  gewerbeflaeche: string;
  grundstueck: string;
  geschosse: string;
  denkmalschutz: string;
  aufzug: string;
  heizungsart: string;
  leerstandsquote: string;
  betriebskosten_nicht_umlage: string;
  instandhaltung: string;
  verwaltung: string;
  ruecklagen: string;
  capex_vergangen: string;
  capex_geplant: string;
  capex_geplant_betrag: string;
  weg_aufgeteilt: string;
  weg_geplant: string;
  milieuschutz: string;
  umwandlungsverbot: string;
  mietpreisbindung: string;
  sozialbindung: string;
  modernisierungsstopp: string;
  gewerbe_sonderklauseln: string;
  haltedauer: string;
  primaeres_ziel: string;
  risikoprofil: string;
  investitionsbereitschaft: string;
  // Anzahl-Felder für automatische Einheiten-Generierung
  anzahl_wohneinheiten: number;
  anzahl_gewerbeeinheiten: number;
  anzahl_stellplaetze: number;
  einheiten: Einheit[];
};

type Ankaufsprofil = {
  name: string;
  kaufinteresse_aktiv: boolean;
  assetklassen: string[];
  regionen: string;
  lagepraeferenz: string[];
  min_volumen: string;
  max_volumen: string;
  kaufpreisfaktor: string;
  rendite_min: string;
  rendite_soll: string;
  finanzierungsform: string;
  zustand: string[];
  baujahr_von: string;
  baujahr_bis: string;
  min_wohnflaeche: string;
  min_gewerbeflaeche: string;
  min_wohneinheiten: string;
  min_gewerbeeinheiten: string;
  min_grundstueck: string;
  ausgeschlossene_partner: boolean;
  ausgeschlossene_partner_liste: string;
  sonstiges: string;
};

type FormData = {
  name: string;
  anrede: string;
  vorname: string;
  nachname: string;
  strasse: string;
  plz: string;
  ort: string;
  land: string;
  email: string;
  telefon: string;
  position: string;
  anzahl_objekte: number;
  createAnkaufsprofil: boolean;
  ankaufsprofil: Ankaufsprofil;
  objekte: Objekt[];
};

// =====================================================
// BRAND COLORS
// =====================================================

const COLORS = {
  royalNavy: { dark: '#1E2A3A', medium: '#2A3F54', light: '#3D5167' },
  growthBlue: { dark: '#4A6A8D', base: '#5B7A9D', light: '#6B8AAD' },
  blueBone: { dark: '#9EAFC0', base: '#B8C5D1', light: '#D5DEE6', lightest: '#EDF1F5' },
};

// =====================================================
// CONSTANTS
// =====================================================

const GEBAEUDETYPEN = ['MFH', 'Wohn- & Geschäftshaus', 'Büro', 'Retail', 'Logistik', 'Spezialimmobilie'];
const HEIZUNGSARTEN = ['Gas', 'Öl', 'Wärmepumpe', 'Fernwärme', 'Elektro', 'Sonstige'];
const HALTEDAUER = ['0-3 Jahre', '3-7 Jahre', '7+ Jahre'];
const PRIMAERE_ZIELE = ['Cashflow', 'Rendite', 'AfA/RND', 'Exit', 'Repositionierung', 'Portfolio-Umschichtung'];
const RISIKOPROFILE = ['Konservativ', 'Core', 'Core+', 'Value-Add', 'Opportunistisch'];
const BOOLEAN_OPTIONS = [{ value: 'true', label: 'Ja' }, { value: 'false', label: 'Nein' }];
const ASSETKLASSEN = ['MFH', 'Wohn- & Geschäftshaus', 'Büro', 'Retail', 'Logistik', 'Light Industrial', 'Betreiberimmobilien', 'Grundstücke', 'Development'];
const LAGEPRAEFERENZEN = ['A-Lage', 'B-Lage', 'C-Lage', 'Metropolregion', 'Universitätsstadt', 'Wachstumsregion'];
const FINANZIERUNGSFORMEN = ['Voll-EK', 'EK-dominant', 'Standard-Finanzierung', 'Offen'];
const ZUSTAENDE = ['Sanierungsbedürftig', 'Teilsaniert', 'Vollsaniert', 'Denkmal', 'Revitalisierung möglich'];

// Marktmiete-Fallback (wird sofort angezeigt, bis API-Daten da sind)
const getMarktmieteFallback = (plz: string, nutzung: 'Wohnen' | 'Gewerbe' | 'Stellplatz'): string => {
  if (nutzung === 'Stellplatz') return '0';
  const prefix = plz.substring(0, 2);
  const isWien = prefix === '10' && plz.length === 4;
  const isMuenchen = prefix === '80' || prefix === '81';
  const aStaedte = ['10', '12', '13', '14', '20', '22', '60', '80', '81', '70', '50', '40'];
  const isAStadt = aStaedte.includes(prefix);
  if (nutzung === 'Gewerbe') return isWien ? '16' : isMuenchen ? '25' : isAStadt ? '18' : '12';
  return isWien ? '13' : isMuenchen ? '18' : isAStadt ? '14' : '10';
};

const createEmptyEinheit = (nutzung: 'Wohnen' | 'Gewerbe' | 'Stellplatz' = 'Wohnen'): Einheit => ({
  nutzung,
  flaeche: '',
  kaltmiete: '',
  vergleichsmiete: nutzung === 'Stellplatz' ? '0' : '',
  mietvertragsart: 'Standard',
  vertragsbeginn: '',
  letzte_mieterhoehung: '',
  hoehe_mieterhoehung: '',
  datum_558: '',
  hoehe_558: '',
  datum_559: '',
  art_modernisierung_559: '',
  hoehe_559: '',
});

const createEmptyObjekt = (): Objekt => ({
  strasse: '', plz: '', ort: '', gebaeudetyp: 'MFH', baujahr: '', kernsanierung_jahr: '',
  kaufpreis: '', kaufdatum: '', eigenkapital_prozent: '30', zinssatz: '3.8', tilgung: '2',
  darlehensstand: '', grundstueck_wert: '', gebaeude_wert: '',
  wohnflaeche: '', gewerbeflaeche: '', grundstueck: '', geschosse: '',
  denkmalschutz: 'false', aufzug: 'false', heizungsart: '',
  leerstandsquote: '', betriebskosten_nicht_umlage: '', instandhaltung: '', verwaltung: '', ruecklagen: '',
  capex_vergangen: '', capex_geplant: '', capex_geplant_betrag: '',
  weg_aufgeteilt: 'false', weg_geplant: 'false', milieuschutz: 'false', umwandlungsverbot: 'false',
  mietpreisbindung: 'false', sozialbindung: 'false', modernisierungsstopp: 'false', gewerbe_sonderklauseln: 'false',
  haltedauer: '', primaeres_ziel: '', risikoprofil: '', investitionsbereitschaft: '',
  anzahl_wohneinheiten: 1, anzahl_gewerbeeinheiten: 0, anzahl_stellplaetze: 0,
  einheiten: [createEmptyEinheit('Wohnen')],
});

// Generiert Einheiten basierend auf Anzahl pro Nutzungsart, mit automatischer Marktmiete
const generateEinheiten = (wohn: number, gewerbe: number, stellplaetze: number, plz: string = ''): Einheit[] => {
  const einheiten: Einheit[] = [];
  for (let i = 0; i < wohn; i++) {
    const e = createEmptyEinheit('Wohnen');
    if (plz) e.vergleichsmiete = getMarktmieteFallback(plz, 'Wohnen');
    einheiten.push(e);
  }
  for (let i = 0; i < gewerbe; i++) {
    const e = createEmptyEinheit('Gewerbe');
    if (plz) e.vergleichsmiete = getMarktmieteFallback(plz, 'Gewerbe');
    einheiten.push(e);
  }
  for (let i = 0; i < stellplaetze; i++) {
    einheiten.push(createEmptyEinheit('Stellplatz'));
  }
  if (einheiten.length === 0) {
    const e = createEmptyEinheit('Wohnen');
    if (plz) e.vergleichsmiete = getMarktmieteFallback(plz, 'Wohnen');
    einheiten.push(e);
  }
  return einheiten;
};

const createEmptyAnkaufsprofil = (): Ankaufsprofil => ({
  name: 'Ankaufsprofil', kaufinteresse_aktiv: true, assetklassen: [], regionen: '', lagepraeferenz: [],
  min_volumen: '', max_volumen: '', kaufpreisfaktor: '', rendite_min: '', rendite_soll: '', finanzierungsform: '',
  zustand: [], baujahr_von: '', baujahr_bis: '', min_wohnflaeche: '', min_gewerbeflaeche: '',
  min_wohneinheiten: '', min_gewerbeeinheiten: '', min_grundstueck: '', ausgeschlossene_partner: false,
  ausgeschlossene_partner_liste: '', sonstiges: '',
});

// =====================================================
// HELPER COMPONENTS
// =====================================================

function MultiSelectChips({ options, selected, onChange }: { options: string[]; selected: string[]; onChange: (s: string[]) => void }) {
  const toggle = (option: string) => {
    onChange(selected.includes(option) ? selected.filter((s) => s !== option) : [...selected, option]);
  };
  return (
    <div className="flex flex-wrap gap-1.5 sm:gap-2">
      {options.map((option) => (
        <button key={option} type="button" onClick={() => toggle(option)}
          className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors active:scale-95 min-h-[36px] sm:min-h-[40px]"
          style={selected.includes(option) ? { backgroundColor: COLORS.growthBlue.base, color: 'white' } : { backgroundColor: COLORS.blueBone.lightest, color: COLORS.royalNavy.dark }}>
          {option}
        </button>
      ))}
    </div>
  );
}

function SubStepIndicator({ current, total, labels }: { current: number; total: number; labels: string[] }) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 mb-3 sm:mb-4">
      {labels.map((label, idx) => (
        <div key={idx} className="flex items-center flex-shrink-0">
          <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-medium ${idx + 1 <= current ? 'text-white' : 'text-slate-400'}`}
            style={{ backgroundColor: idx + 1 <= current ? COLORS.growthBlue.base : COLORS.blueBone.light }}>
            {idx + 1}
          </div>
          <span className={`ml-1 sm:ml-1.5 text-[10px] sm:text-xs ${idx + 1 === current ? 'font-medium text-slate-700' : 'text-slate-400 hidden sm:inline'}`}>{label}</span>
          {idx < total - 1 && <div className="w-3 sm:w-6 h-0.5 mx-1 sm:mx-1.5" style={{ backgroundColor: idx + 1 < current ? COLORS.growthBlue.base : COLORS.blueBone.light }} />}
        </div>
      ))}
    </div>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function OnboardingPage() {
  const [mainStep, setMainStep] = useState(1); // 1=Kontakt, 2=Ankaufsprofil, 3=Objekte, 4=Übersicht
  const [ankaufSubStep, setAnkaufSubStep] = useState(1); // 1-5
  const [objektSubStep, setObjektSubStep] = useState(1); // 1=Adresse, 2=Gebäude, 3=Flächen&Finanz, 4=Bewirtschaftung, 5=Rechtl.&Strategie, 6=Einheiten
  const [currentObjektIndex, setCurrentObjektIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [marktdatenLoading, setMarktdatenLoading] = useState<Record<number, boolean>>({});
  const [marktdatenQuelle, setMarktdatenQuelle] = useState<Record<number, string>>({});

  // Auto-Save: Load from localStorage on mount
  const [formData, setFormData] = useState<FormData>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('onboarding_draft');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch { /* ignore */ }
      }
    }
    return {
      name: '', anrede: '', vorname: '', nachname: '', strasse: '', plz: '', ort: '', land: 'Deutschland', email: '', telefon: '', position: '',
      anzahl_objekte: 1,
      createAnkaufsprofil: false, ankaufsprofil: createEmptyAnkaufsprofil(), objekte: [createEmptyObjekt()],
    };
  });

  // Auto-Save: Persist to localStorage on change
  useEffect(() => {
    if (!submitted) {
      localStorage.setItem('onboarding_draft', JSON.stringify(formData));
    }
  }, [formData, submitted]);

  // Clear draft on successful submit
  const clearDraft = () => localStorage.removeItem('onboarding_draft');

  // State for expandable BGB sections per Einheit (key = "objIdx-einheitIdx")
  const [expandedBGB, setExpandedBGB] = useState<Set<string>>(new Set());
  const toggleBGB = (key: string) => {
    setExpandedBGB(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Calculate total steps and current position
  const getTotalSteps = () => {
    let total = 2; // Kontakt + Übersicht
    if (formData.createAnkaufsprofil) total += 5; // 5 Ankauf sub-steps
    total += formData.objekte.length * 3; // 3 sub-steps per object
    return total;
  };

  const getCurrentStepNumber = () => {
    let pos = 1; // Kontakt
    if (mainStep === 1) return pos;
    pos++;

    if (formData.createAnkaufsprofil) {
      if (mainStep === 2) return pos + ankaufSubStep - 1;
      pos += 5;
    }

    if (mainStep === 3) {
      return pos + (currentObjektIndex * 6) + objektSubStep - 1;
    }
    pos += formData.objekte.length * 6;

    return pos; // Übersicht
  };

  const totalSteps = getTotalSteps();
  const currentStepNumber = getCurrentStepNumber();

  // Navigation
  const getMainSteps = () => {
    if (formData.createAnkaufsprofil) {
      return [
        { id: 1, title: 'Kontakt', icon: User },
        { id: 2, title: 'Ankaufsprofil', icon: ShoppingCart },
        { id: 3, title: 'Objekte', icon: Home },
        { id: 4, title: 'Übersicht', icon: Building2 },
      ];
    }
    return [
      { id: 1, title: 'Kontakt', icon: User },
      { id: 3, title: 'Objekte', icon: Home },
      { id: 4, title: 'Übersicht', icon: Building2 },
    ];
  };

  const MAIN_STEPS = getMainSteps();

  const goNext = () => {
    if (mainStep === 1) {
      setMainStep(formData.createAnkaufsprofil ? 2 : 3);
      setAnkaufSubStep(1);
      setObjektSubStep(1);
      setCurrentObjektIndex(0);
    } else if (mainStep === 2) {
      if (ankaufSubStep < 5) {
        setAnkaufSubStep(ankaufSubStep + 1);
      } else {
        setMainStep(3);
        setObjektSubStep(1);
        setCurrentObjektIndex(0);
      }
    } else if (mainStep === 3) {
      if (objektSubStep < 6) {
        setObjektSubStep(objektSubStep + 1);
      } else if (currentObjektIndex < formData.objekte.length - 1) {
        setCurrentObjektIndex(currentObjektIndex + 1);
        setObjektSubStep(1);
      } else {
        setMainStep(4);
      }
    }
  };

  const goBack = () => {
    if (mainStep === 4) {
      setMainStep(3);
      setCurrentObjektIndex(formData.objekte.length - 1);
      setObjektSubStep(6);
    } else if (mainStep === 3) {
      if (objektSubStep > 1) {
        setObjektSubStep(objektSubStep - 1);
      } else if (currentObjektIndex > 0) {
        setCurrentObjektIndex(currentObjektIndex - 1);
        setObjektSubStep(6);
      } else {
        setMainStep(formData.createAnkaufsprofil ? 2 : 1);
        setAnkaufSubStep(5);
      }
    } else if (mainStep === 2) {
      if (ankaufSubStep > 1) {
        setAnkaufSubStep(ankaufSubStep - 1);
      } else {
        setMainStep(1);
      }
    }
  };

  const isFirstStep = mainStep === 1;
  const isLastStep = mainStep === 4;

  // Update functions
  const updateMandant = (field: keyof Pick<FormData, 'name' | 'anrede' | 'vorname' | 'nachname' | 'strasse' | 'plz' | 'ort' | 'land' | 'email' | 'telefon' | 'position'>, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Aktualisiert Anzahl Objekte und generiert/entfernt Objekte automatisch
  const updateAnzahlObjekte = (count: number) => {
    const newCount = Math.max(1, count); // Min 1, kein Maximum
    setFormData((prev) => {
      const currentObjekte = [...prev.objekte];
      if (newCount > currentObjekte.length) {
        // Füge neue leere Objekte hinzu
        for (let i = currentObjekte.length; i < newCount; i++) {
          currentObjekte.push(createEmptyObjekt());
        }
      } else if (newCount < currentObjekte.length) {
        // Entferne überschüssige Objekte (von hinten)
        currentObjekte.splice(newCount);
      }
      return { ...prev, anzahl_objekte: newCount, objekte: currentObjekte };
    });
    // Falls currentObjektIndex jetzt out of bounds ist, zurücksetzen
    if (currentObjektIndex >= count) {
      setCurrentObjektIndex(Math.max(0, count - 1));
    }
  };

  const updateAnkauf = (field: keyof Ankaufsprofil, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, ankaufsprofil: { ...prev.ankaufsprofil, [field]: value } }));
  };

  // Holt echte Marktdaten via Perplexity API
  const fetchMarktdatenForObjekt = async (objektIdx: number, strasse: string, plz: string, ort: string, gebaeudetyp: string, wohnflaeche: string, baujahr: string) => {
    if (!plz || !ort) return;
    setMarktdatenLoading((prev) => ({ ...prev, [objektIdx]: true }));
    try {
      const res = await fetch('/api/marktdaten/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strasse, plz, ort, gebaeudetyp, wohnflaeche: wohnflaeche ? Number(wohnflaeche) : null, baujahr: baujahr ? Number(baujahr) : null }),
      });
      const data = await res.json();
      if (data.success) {
        setFormData((prev) => ({
          ...prev,
          objekte: prev.objekte.map((o, i) => {
            if (i !== objektIdx) return o;
            return {
              ...o,
              einheiten: o.einheiten.map((e) => ({
                ...e,
                vergleichsmiete: e.nutzung === 'Stellplatz' ? '0' : e.nutzung === 'Gewerbe'
                  ? String(data.vergleichsmiete_gewerbe)
                  : String(data.vergleichsmiete_wohnen),
              })),
            };
          }),
        }));
        setMarktdatenQuelle((prev) => ({ ...prev, [objektIdx]: data.quelle_wohnen || 'Marktrecherche' }));
      }
    } catch {
      // Fallback: statische Schätzung verwenden
      setFormData((prev) => ({
        ...prev,
        objekte: prev.objekte.map((o, i) => {
          if (i !== objektIdx) return o;
          return {
            ...o,
            einheiten: o.einheiten.map((e) => ({
              ...e,
              vergleichsmiete: getMarktmieteFallback(plz, e.nutzung),
            })),
          };
        }),
      }));
      setMarktdatenQuelle((prev) => ({ ...prev, [objektIdx]: 'Schätzung (Fallback)' }));
    } finally {
      setMarktdatenLoading((prev) => ({ ...prev, [objektIdx]: false }));
    }
  };

  const updateObjekt = (field: keyof Omit<Objekt, 'einheiten' | 'anzahl_wohneinheiten' | 'anzahl_gewerbeeinheiten' | 'anzahl_stellplaetze'>, value: string) => {
    setFormData((prev) => ({
      ...prev,
      objekte: prev.objekte.map((o, i) => {
        if (i !== currentObjektIndex) return o;
        const updated = { ...o, [field]: value };
        // Bei PLZ-Änderung: sofort Fallback setzen, dann API-Daten holen
        if (field === 'plz' && value.length >= 4) {
          updated.einheiten = updated.einheiten.map((e) => ({
            ...e,
            vergleichsmiete: getMarktmieteFallback(value, e.nutzung),
          }));
        }
        return updated;
      }),
    }));
    // Wenn PLZ lang genug ist und Ort vorhanden: echte Marktdaten holen
    if (field === 'plz' && value.length >= 4) {
      const obj = formData.objekte[currentObjektIndex];
      if (obj?.ort) {
        fetchMarktdatenForObjekt(currentObjektIndex, obj.strasse, value, obj.ort, obj.gebaeudetyp, obj.wohnflaeche, obj.baujahr);
      }
    }
    if (field === 'ort' && value.length >= 2) {
      const obj = formData.objekte[currentObjektIndex];
      if (obj?.plz?.length >= 4) {
        fetchMarktdatenForObjekt(currentObjektIndex, obj.strasse, obj.plz, value, obj.gebaeudetyp, obj.wohnflaeche, obj.baujahr);
      }
    }
  };

  // Aktualisiert Anzahl-Felder und regeneriert Einheiten automatisch
  const updateObjektAnzahl = (field: 'anzahl_wohneinheiten' | 'anzahl_gewerbeeinheiten' | 'anzahl_stellplaetze', value: number) => {
    setFormData((prev) => ({
      ...prev,
      objekte: prev.objekte.map((o, i) => {
        if (i !== currentObjektIndex) return o;
        const newAnzahl = { ...o, [field]: value };
        const newEinheiten = generateEinheiten(
          newAnzahl.anzahl_wohneinheiten,
          newAnzahl.anzahl_gewerbeeinheiten,
          newAnzahl.anzahl_stellplaetze,
          o.plz
        );
        return { ...newAnzahl, einheiten: newEinheiten };
      }),
    }));
  };

  const updateEinheit = (einheitIndex: number, field: keyof Einheit, value: string) => {
    setFormData((prev) => ({
      ...prev,
      objekte: prev.objekte.map((o, oi) =>
        oi === currentObjektIndex
          ? { ...o, einheiten: o.einheiten.map((e, ei) => (ei === einheitIndex ? { ...e, [field]: value } : e)) }
          : o
      ),
    }));
  };

  const removeObjekt = (idx: number) => {
    if (formData.objekte.length <= 1) return;
    setFormData((prev) => ({ ...prev, objekte: prev.objekte.filter((_, i) => i !== idx) }));
    if (currentObjektIndex >= formData.objekte.length - 1) {
      setCurrentObjektIndex(Math.max(0, formData.objekte.length - 2));
    }
  };

  // Stats
  const getTotalStats = () => {
    let totalEinheiten = 0, totalFlaeche = 0, totalMiete = 0;
    formData.objekte.forEach((o) => {
      o.einheiten.forEach((e) => {
        totalEinheiten++;
        totalFlaeche += parseFloat(e.flaeche) || 0;
        totalMiete += parseFloat(e.kaltmiete) || 0;
      });
    });
    return { totalObjekte: formData.objekte.length, totalEinheiten, totalFlaeche, totalMiete };
  };

  const stats = getTotalStats();
  const currentObjekt = formData.objekte[currentObjektIndex];

  // Prüft ob die aktuelle Straße bereits in einem anderen Objekt existiert
  const getDuplicateStrasse = (): number | null => {
    if (!currentObjekt?.strasse?.trim()) return null;
    const currentStrasse = currentObjekt.strasse.trim().toLowerCase();
    for (let i = 0; i < formData.objekte.length; i++) {
      if (i !== currentObjektIndex) {
        const otherStrasse = formData.objekte[i].strasse?.trim().toLowerCase();
        if (otherStrasse && otherStrasse === currentStrasse) {
          return i + 1; // 1-basiert für Anzeige
        }
      }
    }
    return null;
  };
  const duplicateObjektNr = getDuplicateStrasse();

  // Submit
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Fehler beim Speichern');
      clearDraft();
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // SUCCESS STATE
  // =====================================================

  if (submitted) {
    return (
      <div className="h-[100dvh] flex items-center justify-center p-3 sm:p-4" style={{ background: 'linear-gradient(135deg, #1E2A3A 0%, #2A3F54 50%, #3D5167 100%)' }}>
        <div className="ob-card rounded-xl sm:rounded-2xl p-4 sm:p-8 max-w-lg w-full text-center">
          <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-6" style={{ backgroundColor: COLORS.growthBlue.base }}>
            <CheckCircle className="w-6 h-6 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-4" style={{ color: COLORS.royalNavy.dark }}>Vielen Dank!</h1>
          <p className="text-slate-600 mb-3 sm:mb-6 text-xs sm:text-base">
            Ihre {stats.totalObjekte} Objekte werden analysiert.
          </p>
          <a href="/" className="inline-block px-4 sm:px-6 py-2 sm:py-3 text-white rounded-lg text-xs sm:text-base active:scale-95 transition-transform" style={{ backgroundColor: COLORS.growthBlue.base }}>
            Zur Startseite
          </a>
        </div>
      </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="h-[100dvh] sm:min-h-screen sm:h-auto flex flex-col" style={{ background: 'linear-gradient(135deg, #1E2A3A 0%, #2A3F54 50%, #3D5167 100%)' }}>
      {/* Header - Minimal */}
      <div className="py-2 sm:py-4 px-3 sm:px-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Image src="/logo_imperoyal.png" alt="Imperoyal" width={160} height={48} className="h-5 sm:h-8 md:h-10 w-auto brightness-0 invert" priority />
          <span className="text-white/70 text-[10px] sm:text-sm bg-white/10 px-2 py-0.5 sm:py-1 rounded-full">
            {currentStepNumber}/{totalSteps}
          </span>
        </div>
      </div>

      {/* Progress Bar - Compact */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 mb-2 sm:mb-4 flex-shrink-0 w-full">
        <div className="h-1 sm:h-2 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full transition-all duration-300" style={{ width: `${(currentStepNumber / totalSteps) * 100}%`, backgroundColor: COLORS.growthBlue.base }} />
        </div>
        <div className="flex justify-between mt-1 sm:mt-2">
          {MAIN_STEPS.map((s) => (
            <span key={s.id} className={`text-[9px] sm:text-xs ${mainStep >= s.id || (s.id === 3 && mainStep >= 3) ? 'text-white' : 'text-white/40'}`}>
              {s.title}
            </span>
          ))}
        </div>
      </div>

      {/* Form Card - Fills remaining space */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto px-3 sm:px-4 pb-3 sm:pb-6 w-full min-h-0">
        <div className="ob-card rounded-xl sm:rounded-2xl p-3 sm:p-4 flex-1 flex flex-col min-h-0">

          {/* ===== STEP 1: KONTAKT ===== */}
          {mainStep === 1 && (
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
              <h2 className="text-sm sm:text-base font-bold mb-2 flex-shrink-0" style={{ color: COLORS.royalNavy.dark }}>Ihre Kontaktdaten</h2>
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-0.5">Firmenname *</label>
                  <input type="text" value={formData.name} onChange={(e) => updateMandant('name', e.target.value)}
                    className="ob-input w-full px-3 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-0.5">Anrede *</label>
                  <select value={formData.anrede} onChange={(e) => updateMandant('anrede', e.target.value)}
                    className="ob-input w-full px-3 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base" required>
                    <option value="">Wählen...</option>
                    <option value="Herr">Herr</option>
                    <option value="Frau">Frau</option>
                    <option value="Herr Dr.">Herr Dr.</option>
                    <option value="Frau Dr.">Frau Dr.</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-0.5">Vorname *</label>
                  <input type="text" value={formData.vorname} onChange={(e) => updateMandant('vorname', e.target.value)}
                    className="ob-input w-full px-3 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-0.5">Nachname *</label>
                  <input type="text" value={formData.nachname} onChange={(e) => updateMandant('nachname', e.target.value)}
                    className="ob-input w-full px-3 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-0.5">E-Mail *</label>
                  <input type="email" value={formData.email} onChange={(e) => updateMandant('email', e.target.value)}
                    className="ob-input w-full px-3 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-0.5">Telefon</label>
                  <input type="tel" value={formData.telefon} onChange={(e) => updateMandant('telefon', e.target.value)}
                    className="ob-input w-full px-3 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-0.5">Position</label>
                  <input type="text" value={formData.position} onChange={(e) => updateMandant('position', e.target.value)}
                    className="ob-input w-full px-3 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base" placeholder="z.B. Geschäftsführer" />
                </div>

                {/* Firmenadresse */}
                <div className="col-span-2 mt-1">
                  <h3 className="text-xs font-semibold text-slate-700 mb-1">Firmenadresse *</h3>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-0.5">Straße & Hausnr. *</label>
                  <input type="text" value={formData.strasse} onChange={(e) => updateMandant('strasse', e.target.value)}
                    className="ob-input w-full px-3 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base" placeholder="Musterstraße 1" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-0.5">PLZ *</label>
                  <input type="text" value={formData.plz} onChange={(e) => updateMandant('plz', e.target.value)}
                    className="ob-input w-full px-3 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base" placeholder="10115" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-0.5">Ort *</label>
                  <input type="text" value={formData.ort} onChange={(e) => updateMandant('ort', e.target.value)}
                    className="ob-input w-full px-3 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base" placeholder="Berlin" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-0.5">Land</label>
                  <select value={formData.land} onChange={(e) => updateMandant('land', e.target.value)}
                    className="ob-input w-full px-3 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base">
                    <option value="Deutschland">Deutschland</option>
                    <option value="Österreich">Österreich</option>
                    <option value="Schweiz">Schweiz</option>
                  </select>
                </div>
              </div>

              {/* Bottom Section - Push to fill space */}
              <div className="mt-auto pt-2 border-t border-slate-200 space-y-1.5 flex-shrink-0">
                {/* Anzahl Objekte */}
                <div className="p-2 rounded-lg" style={{ backgroundColor: COLORS.blueBone.lightest }}>
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] sm:text-sm font-medium" style={{ color: COLORS.royalNavy.dark }}>
                      <Home className="inline w-3 h-3 sm:w-4 sm:h-4 mr-1" /> Objekte
                    </label>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => updateAnzahlObjekte(formData.anzahl_objekte - 1)}
                        className="w-7 h-7 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-xl font-bold active:scale-95 transition-transform"
                        style={{ backgroundColor: COLORS.blueBone.light, color: COLORS.royalNavy.dark }}
                        disabled={formData.anzahl_objekte <= 1}>
                        −
                      </button>
                      <input type="number" min="1" value={formData.anzahl_objekte}
                        onChange={(e) => updateAnzahlObjekte(parseInt(e.target.value) || 1)}
                        className="ob-input w-10 sm:w-20 px-1 sm:px-3 py-1 sm:py-2 rounded-lg text-center text-sm sm:text-xl font-bold" />
                      <button type="button" onClick={() => updateAnzahlObjekte(formData.anzahl_objekte + 1)}
                        className="w-7 h-7 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-xl font-bold active:scale-95 transition-transform"
                        style={{ backgroundColor: COLORS.growthBlue.base, color: 'white' }}>
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Ankaufsprofil Checkbox */}
                <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg" style={{ backgroundColor: COLORS.blueBone.lightest }}>
                  <input type="checkbox" checked={formData.createAnkaufsprofil}
                    onChange={(e) => setFormData((prev) => ({ ...prev, createAnkaufsprofil: e.target.checked }))}
                    className="w-4 h-4 sm:w-5 sm:h-5 rounded flex-shrink-0" style={{ accentColor: COLORS.growthBlue.base }} />
                  <div>
                    <span className="font-medium text-xs sm:text-base" style={{ color: COLORS.royalNavy.dark }}>Ankaufsprofil erstellen</span>
                    <p className="text-[10px] sm:text-sm text-slate-600 hidden sm:block">Erhalten Sie passende Objekt-Angebote</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* ===== STEP 2: ANKAUFSPROFIL ===== */}
          {mainStep === 2 && formData.createAnkaufsprofil && (
            <div className="flex-1 flex flex-col min-h-0">
              <h2 className="text-sm sm:text-lg font-bold mb-1 sm:mb-2 flex-shrink-0" style={{ color: COLORS.royalNavy.dark }}>Ankaufsprofil</h2>
              <div className="flex-shrink-0">
                <SubStepIndicator current={ankaufSubStep} total={5} labels={['Basics', 'Standort', 'Finanzen', 'Objekt', 'Sonstiges']} />
              </div>

              {ankaufSubStep === 1 && (
                <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-5">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Profilname</label>
                    <input type="text" value={formData.ankaufsprofil.name} onChange={(e) => updateAnkauf('name', e.target.value)}
                      className="ob-input w-full px-3 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base" placeholder="z.B. Core-Portfolio" />
                  </div>
                  <div className="flex items-center justify-between gap-2 p-3 sm:p-4 rounded-xl border border-slate-200" style={{ backgroundColor: COLORS.blueBone.lightest }}>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-slate-700">Kaufinteresse aktiv?</p>
                      <p className="text-[10px] sm:text-xs text-slate-500">Aktiv suchend nach neuen Objekten</p>
                    </div>
                    <div className="flex gap-3">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" checked={formData.ankaufsprofil.kaufinteresse_aktiv === true}
                          onChange={() => updateAnkauf('kaufinteresse_aktiv', true)}
                          className="w-4 h-4" style={{ accentColor: COLORS.growthBlue.base }} />
                        <span className="text-xs sm:text-sm">Ja</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" checked={formData.ankaufsprofil.kaufinteresse_aktiv === false}
                          onChange={() => updateAnkauf('kaufinteresse_aktiv', false)}
                          className="w-4 h-4" style={{ accentColor: COLORS.growthBlue.base }} />
                        <span className="text-xs sm:text-sm">Nein</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Assetklassen</label>
                    <MultiSelectChips options={ASSETKLASSEN} selected={formData.ankaufsprofil.assetklassen}
                      onChange={(s) => updateAnkauf('assetklassen', s)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Min. Volumen (EUR)</label>
                      <input type="text" inputMode="numeric" value={formData.ankaufsprofil.min_volumen}
                        onChange={(e) => updateAnkauf('min_volumen', e.target.value)}
                        className="ob-input w-full px-3 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base" placeholder="1.000.000" />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Max. Volumen (EUR)</label>
                      <input type="text" inputMode="numeric" value={formData.ankaufsprofil.max_volumen}
                        onChange={(e) => updateAnkauf('max_volumen', e.target.value)}
                        className="ob-input w-full px-3 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base" placeholder="10.000.000" />
                    </div>
                  </div>
                </div>
              )}

              {ankaufSubStep === 2 && (
                <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-5">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Städte / Regionen</label>
                    <textarea value={formData.ankaufsprofil.regionen} onChange={(e) => updateAnkauf('regionen', e.target.value)}
                      className="ob-input w-full px-3 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base" rows={3} placeholder="z.B. München, Berlin, Hamburg..." />
                    <p className="text-[10px] sm:text-xs text-slate-400 mt-1">Kommagetrennt oder als Freitext</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Lagepräferenz</label>
                    <MultiSelectChips options={LAGEPRAEFERENZEN} selected={formData.ankaufsprofil.lagepraeferenz}
                      onChange={(s) => updateAnkauf('lagepraeferenz', s)} />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Kaufpreisfaktor (max.)</label>
                    <input type="text" inputMode="decimal" value={formData.ankaufsprofil.kaufpreisfaktor}
                      onChange={(e) => updateAnkauf('kaufpreisfaktor', e.target.value)}
                      className="ob-input w-full px-3 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base" placeholder="z.B. 25" />
                    <p className="text-[10px] sm:text-xs text-slate-400 mt-1">Kaufpreis geteilt durch Jahresnettokaltmiete</p>
                  </div>
                </div>
              )}

              {ankaufSubStep === 3 && (
                <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-5">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Min. Rendite (%)</label>
                      <input type="text" inputMode="decimal" value={formData.ankaufsprofil.rendite_min}
                        onChange={(e) => updateAnkauf('rendite_min', e.target.value)}
                        className="ob-input w-full px-3 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base" placeholder="4.5" />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Soll-Rendite (%)</label>
                      <input type="text" inputMode="decimal" value={formData.ankaufsprofil.rendite_soll}
                        onChange={(e) => updateAnkauf('rendite_soll', e.target.value)}
                        className="ob-input w-full px-3 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base" placeholder="6.0" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Finanzierungsform</label>
                    <select value={formData.ankaufsprofil.finanzierungsform} onChange={(e) => updateAnkauf('finanzierungsform', e.target.value)}
                      className="ob-input w-full px-3 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base">
                      <option value="">Wählen...</option>
                      {FINANZIERUNGSFORMEN.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div className="p-3 sm:p-4 rounded-xl border border-slate-200" style={{ backgroundColor: COLORS.blueBone.lightest }}>
                    <p className="text-[10px] sm:text-xs text-slate-500 mb-0.5">Zusammenfassung Volumen</p>
                    <p className="text-xs sm:text-sm text-slate-700">
                      {formData.ankaufsprofil.min_volumen || '–'} € bis {formData.ankaufsprofil.max_volumen || '–'} €
                    </p>
                    <p className="text-[10px] sm:text-xs text-slate-400 mt-1">Änderbar unter Schritt 1 (Basics)</p>
                  </div>
                </div>
              )}

              {ankaufSubStep === 4 && (
                <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-5">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Zustand / Objektstrategie</label>
                    <MultiSelectChips options={ZUSTAENDE} selected={formData.ankaufsprofil.zustand}
                      onChange={(s) => updateAnkauf('zustand', s)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Baujahr von</label>
                      <input type="text" inputMode="numeric" value={formData.ankaufsprofil.baujahr_von}
                        onChange={(e) => updateAnkauf('baujahr_von', e.target.value)}
                        className="ob-input w-full px-3 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base" placeholder="1950" />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Baujahr bis</label>
                      <input type="text" inputMode="numeric" value={formData.ankaufsprofil.baujahr_bis}
                        onChange={(e) => updateAnkauf('baujahr_bis', e.target.value)}
                        className="ob-input w-full px-3 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base" placeholder="2020" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Min. Wohnfläche (m²)</label>
                      <input type="text" inputMode="numeric" value={formData.ankaufsprofil.min_wohnflaeche}
                        onChange={(e) => updateAnkauf('min_wohnflaeche', e.target.value)}
                        className="ob-input w-full px-3 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base" placeholder="500" />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Min. Gewerbefläche (m²)</label>
                      <input type="text" inputMode="numeric" value={formData.ankaufsprofil.min_gewerbeflaeche}
                        onChange={(e) => updateAnkauf('min_gewerbeflaeche', e.target.value)}
                        className="ob-input w-full px-3 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base" placeholder="200" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Min. Wohneinheiten</label>
                      <input type="text" inputMode="numeric" value={formData.ankaufsprofil.min_wohneinheiten}
                        onChange={(e) => updateAnkauf('min_wohneinheiten', e.target.value)}
                        className="ob-input w-full px-3 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base" placeholder="6" />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Min. Grundstück (m²)</label>
                      <input type="text" inputMode="numeric" value={formData.ankaufsprofil.min_grundstueck}
                        onChange={(e) => updateAnkauf('min_grundstueck', e.target.value)}
                        className="ob-input w-full px-3 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base" placeholder="1000" />
                    </div>
                  </div>
                </div>
              )}

              {ankaufSubStep === 5 && (
                <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-5">
                  <div className="flex items-center justify-between gap-2 p-3 sm:p-4 rounded-xl border border-slate-200" style={{ backgroundColor: COLORS.blueBone.lightest }}>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-slate-700">Ausgeschlossene Partner?</p>
                      <p className="text-[10px] sm:text-xs text-slate-500">Bestimmte Makler/Vermittler ausschließen</p>
                    </div>
                    <div className="flex gap-3">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" checked={formData.ankaufsprofil.ausgeschlossene_partner === true}
                          onChange={() => updateAnkauf('ausgeschlossene_partner', true)}
                          className="w-4 h-4" style={{ accentColor: COLORS.growthBlue.base }} />
                        <span className="text-xs sm:text-sm">Ja</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" checked={formData.ankaufsprofil.ausgeschlossene_partner === false}
                          onChange={() => updateAnkauf('ausgeschlossene_partner', false)}
                          className="w-4 h-4" style={{ accentColor: COLORS.growthBlue.base }} />
                        <span className="text-xs sm:text-sm">Nein</span>
                      </label>
                    </div>
                  </div>
                  {formData.ankaufsprofil.ausgeschlossene_partner && (
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Ausgeschlossene Partner</label>
                      <textarea value={formData.ankaufsprofil.ausgeschlossene_partner_liste}
                        onChange={(e) => updateAnkauf('ausgeschlossene_partner_liste', e.target.value)}
                        className="ob-input w-full px-3 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base" rows={3} placeholder="Namen kommagetrennt..." />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Sonstige Anforderungen</label>
                    <textarea value={formData.ankaufsprofil.sonstiges} onChange={(e) => updateAnkauf('sonstiges', e.target.value)}
                      className="ob-input w-full px-3 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base" rows={4} placeholder="Weitere Kriterien, besondere Wünsche..." />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===== STEP 3: OBJEKTE ===== */}
          {mainStep === 3 && (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex justify-between items-center mb-1 sm:mb-2 flex-shrink-0">
                <h2 className="text-sm sm:text-lg font-bold" style={{ color: COLORS.royalNavy.dark }}>
                  Objekt {currentObjektIndex + 1}/{formData.objekte.length}
                </h2>
                {formData.objekte.length > 1 && (
                  <button onClick={() => removeObjekt(currentObjektIndex)} className="text-red-500 text-[10px] sm:text-sm hover:underline">
                    Löschen
                  </button>
                )}
              </div>
              <div className="flex-shrink-0">
                <SubStepIndicator current={objektSubStep} total={6} labels={['Adresse', 'Gebäude', 'Finanzen', 'Kosten', 'Recht', 'Einheiten']} />
              </div>

              {objektSubStep === 1 && (
                <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-5 min-h-0">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Straße *</label>
                    <input type="text" value={currentObjekt.strasse} onChange={(e) => updateObjekt('strasse', e.target.value)}
                      className={`ob-input w-full px-3 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base ${duplicateObjektNr ? 'border-amber-400 border-2' : ''}`}
                      placeholder="Musterstraße 1" />
                    {duplicateObjektNr && (
                      <div className="flex items-center gap-1 mt-1.5 text-amber-700 text-xs">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Bereits bei Objekt {duplicateObjektNr}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">PLZ *</label>
                      <input type="text" value={currentObjekt.plz} onChange={(e) => updateObjekt('plz', e.target.value)}
                        className="ob-input w-full px-3 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base" placeholder="80000" />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Ort *</label>
                      <input type="text" value={currentObjekt.ort} onChange={(e) => updateObjekt('ort', e.target.value)}
                        className="ob-input w-full px-3 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base" placeholder="München" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Gebäudetyp</label>
                      <select value={currentObjekt.gebaeudetyp} onChange={(e) => updateObjekt('gebaeudetyp', e.target.value)}
                        className="ob-input w-full px-3 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base">
                        {GEBAEUDETYPEN.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Baujahr</label>
                      <input type="text" inputMode="numeric" value={currentObjekt.baujahr} onChange={(e) => updateObjekt('baujahr', e.target.value)}
                        className="ob-input w-full px-3 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base" placeholder="1985" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Heizungsart</label>
                      <select value={currentObjekt.heizungsart} onChange={(e) => updateObjekt('heizungsart', e.target.value)}
                        className="ob-input w-full px-3 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base">
                        <option value="">Auswählen...</option>
                        {HEIZUNGSARTEN.map((h) => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Geschosse</label>
                      <input type="text" inputMode="numeric" value={currentObjekt.geschosse} onChange={(e) => updateObjekt('geschosse', e.target.value)}
                        className="ob-input w-full px-3 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base" placeholder="5" />
                    </div>
                  </div>

                  {/* Anzahl Einheiten */}
                  <div className="p-3 sm:p-4 rounded-xl" style={{ backgroundColor: COLORS.blueBone.lightest }}>
                    <span className="block text-xs font-medium text-slate-600 mb-2">Einheiten im Objekt</span>
                    <div className="grid grid-cols-3 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Wohnen</label>
                        <input type="number" min="0" value={currentObjekt.anzahl_wohneinheiten}
                          onChange={(e) => updateObjektAnzahl('anzahl_wohneinheiten', Math.max(0, parseInt(e.target.value) || 0))}
                          className="ob-input w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-center text-sm font-medium" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Gewerbe</label>
                        <input type="number" min="0" value={currentObjekt.anzahl_gewerbeeinheiten}
                          onChange={(e) => updateObjektAnzahl('anzahl_gewerbeeinheiten', Math.max(0, parseInt(e.target.value) || 0))}
                          className="ob-input w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-center text-sm font-medium" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Stellpl.</label>
                        <input type="number" min="0" value={currentObjekt.anzahl_stellplaetze}
                          onChange={(e) => updateObjektAnzahl('anzahl_stellplaetze', Math.max(0, parseInt(e.target.value) || 0))}
                          className="ob-input w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-center text-sm font-medium" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {objektSubStep === 2 && (
                <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-5 min-h-0">
                  {/* Flächen */}
                  <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Wohnfläche (m²)</label>
                      <input type="text" inputMode="decimal" value={currentObjekt.wohnflaeche} onChange={(e) => updateObjekt('wohnflaeche', e.target.value)}
                        className="ob-input w-full px-3 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base" placeholder="850" />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Gewerbefläche (m²)</label>
                      <input type="text" inputMode="decimal" value={currentObjekt.gewerbeflaeche} onChange={(e) => updateObjekt('gewerbeflaeche', e.target.value)}
                        className="ob-input w-full px-3 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base" placeholder="200" />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Grundstück (m²)</label>
                      <input type="text" inputMode="decimal" value={currentObjekt.grundstueck} onChange={(e) => updateObjekt('grundstueck', e.target.value)}
                        className="ob-input w-full px-3 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base" placeholder="500" />
                    </div>
                  </div>

                  {/* Gebäude-Details */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Kernsanierung (Jahr)</label>
                      <input type="text" inputMode="numeric" value={currentObjekt.kernsanierung_jahr} onChange={(e) => updateObjekt('kernsanierung_jahr', e.target.value)}
                        className="ob-input w-full px-3 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base" placeholder="2015" />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Denkmalschutz</label>
                      <select value={currentObjekt.denkmalschutz} onChange={(e) => updateObjekt('denkmalschutz', e.target.value)}
                        className="ob-input w-full px-3 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base">
                        {BOOLEAN_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Aufzug</label>
                      <select value={currentObjekt.aufzug} onChange={(e) => updateObjekt('aufzug', e.target.value)}
                        className="ob-input w-full px-3 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base">
                        {BOOLEAN_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {objektSubStep === 3 && (
                <div className="flex-1 overflow-y-auto min-h-0">
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Kaufpreis *</label>
                    <input type="text" inputMode="numeric" value={currentObjekt.kaufpreis} onChange={(e) => updateObjekt('kaufpreis', e.target.value)}
                      className="ob-input w-full px-3 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base" placeholder="2500000" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Kaufdatum</label>
                    <input type="date" value={currentObjekt.kaufdatum} onChange={(e) => updateObjekt('kaufdatum', e.target.value)}
                      className="ob-input w-full px-3 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:cursor-pointer" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Darlehensstand (€)</label>
                    <input type="text" inputMode="numeric" value={currentObjekt.darlehensstand} onChange={(e) => updateObjekt('darlehensstand', e.target.value)}
                      className="ob-input w-full px-3 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base" placeholder="1500000" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">EK %</label>
                    <input type="text" inputMode="decimal" value={currentObjekt.eigenkapital_prozent}
                      onChange={(e) => updateObjekt('eigenkapital_prozent', e.target.value)}
                      className="ob-input w-full px-3 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base" placeholder="30" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Zins % (p.a.)</label>
                    <input type="text" inputMode="decimal" value={currentObjekt.zinssatz}
                      onChange={(e) => updateObjekt('zinssatz', e.target.value)}
                      className="ob-input w-full px-3 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base" placeholder="3.8" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Tilgung %</label>
                    <input type="text" inputMode="decimal" value={currentObjekt.tilgung}
                      onChange={(e) => updateObjekt('tilgung', e.target.value)}
                      className="ob-input w-full px-3 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base" placeholder="2" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Grundstückswert (€)</label>
                    <input type="text" inputMode="numeric" value={currentObjekt.grundstueck_wert} onChange={(e) => updateObjekt('grundstueck_wert', e.target.value)}
                      className="ob-input w-full px-3 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base" placeholder="Für AfA" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Gebäudewert (€)</label>
                    <input type="text" inputMode="numeric" value={currentObjekt.gebaeude_wert} onChange={(e) => updateObjekt('gebaeude_wert', e.target.value)}
                      className="ob-input w-full px-3 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base" placeholder="Für AfA" />
                  </div>
                </div>
                </div>
              )}

              {objektSubStep === 4 && (
                <div className="flex-1 overflow-y-auto min-h-0">
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Leerstandsquote (%)</label>
                    <input type="text" inputMode="decimal" value={currentObjekt.leerstandsquote} onChange={(e) => updateObjekt('leerstandsquote', e.target.value)}
                      className="ob-input w-full px-3 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base" placeholder="5" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">BK nicht umlagef. (€/J)</label>
                    <input type="text" inputMode="numeric" value={currentObjekt.betriebskosten_nicht_umlage} onChange={(e) => updateObjekt('betriebskosten_nicht_umlage', e.target.value)}
                      className="ob-input w-full px-3 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base" placeholder="5000" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Instandhaltung (€/J)</label>
                    <input type="text" inputMode="numeric" value={currentObjekt.instandhaltung} onChange={(e) => updateObjekt('instandhaltung', e.target.value)}
                      className="ob-input w-full px-3 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base" placeholder="15000" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Verwaltungskosten (€/J)</label>
                    <input type="text" inputMode="numeric" value={currentObjekt.verwaltung} onChange={(e) => updateObjekt('verwaltung', e.target.value)}
                      className="ob-input w-full px-3 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base" placeholder="4800" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Rücklagen (€/J)</label>
                    <input type="text" inputMode="numeric" value={currentObjekt.ruecklagen} onChange={(e) => updateObjekt('ruecklagen', e.target.value)}
                      className="ob-input w-full px-3 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base" placeholder="10000" />
                  </div>
                  <div className="col-span-1 xs:col-span-2 mt-2 p-3 rounded-xl" style={{ backgroundColor: COLORS.blueBone.lightest }}>
                    <span className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">CAPEX / Investitionen</span>
                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] sm:text-xs text-slate-500 mb-1">Vergangene Investitionen</label>
                        <input type="text" value={currentObjekt.capex_vergangen} onChange={(e) => updateObjekt('capex_vergangen', e.target.value)}
                          className="ob-input w-full px-3 py-2.5 rounded-lg text-xs sm:text-sm" placeholder="Dachsanierung 2020" />
                      </div>
                      <div>
                        <label className="block text-[10px] sm:text-xs text-slate-500 mb-1">Geplante Investitionen</label>
                        <input type="text" value={currentObjekt.capex_geplant} onChange={(e) => updateObjekt('capex_geplant', e.target.value)}
                          className="ob-input w-full px-3 py-2.5 rounded-lg text-xs sm:text-sm" placeholder="Fassadendämmung" />
                      </div>
                      <div className="xs:col-span-2">
                        <label className="block text-[10px] sm:text-xs text-slate-500 mb-1">CAPEX-Budget (€)</label>
                        <input type="text" inputMode="numeric" value={currentObjekt.capex_geplant_betrag} onChange={(e) => updateObjekt('capex_geplant_betrag', e.target.value)}
                          className="ob-input w-full px-3 py-2.5 rounded-lg text-xs sm:text-sm" placeholder="150000" />
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              )}

              {objektSubStep === 5 && (
                <div className="flex-1 overflow-y-auto min-h-0">
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">WEG aufgeteilt</label>
                    <select value={currentObjekt.weg_aufgeteilt} onChange={(e) => updateObjekt('weg_aufgeteilt', e.target.value)}
                      className="ob-input w-full px-3 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base">
                      {BOOLEAN_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">WEG geplant</label>
                    <select value={currentObjekt.weg_geplant} onChange={(e) => updateObjekt('weg_geplant', e.target.value)}
                      className="ob-input w-full px-3 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base">
                      {BOOLEAN_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Milieuschutz</label>
                    <select value={currentObjekt.milieuschutz} onChange={(e) => updateObjekt('milieuschutz', e.target.value)}
                      className="ob-input w-full px-3 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base">
                      {BOOLEAN_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Umwandlungsverbot</label>
                    <select value={currentObjekt.umwandlungsverbot} onChange={(e) => updateObjekt('umwandlungsverbot', e.target.value)}
                      className="ob-input w-full px-3 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base">
                      {BOOLEAN_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Mietpreisbindung</label>
                    <select value={currentObjekt.mietpreisbindung} onChange={(e) => updateObjekt('mietpreisbindung', e.target.value)}
                      className="ob-input w-full px-3 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base">
                      {BOOLEAN_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Sozialbindung</label>
                    <select value={currentObjekt.sozialbindung} onChange={(e) => updateObjekt('sozialbindung', e.target.value)}
                      className="ob-input w-full px-3 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base">
                      {BOOLEAN_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Modernisierungsstopp</label>
                    <select value={currentObjekt.modernisierungsstopp} onChange={(e) => updateObjekt('modernisierungsstopp', e.target.value)}
                      className="ob-input w-full px-3 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base">
                      {BOOLEAN_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Gewerbe-Sonderklauseln</label>
                    <select value={currentObjekt.gewerbe_sonderklauseln} onChange={(e) => updateObjekt('gewerbe_sonderklauseln', e.target.value)}
                      className="ob-input w-full px-3 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base">
                      {BOOLEAN_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div className="col-span-1 xs:col-span-2 mt-2 p-3 rounded-xl" style={{ backgroundColor: COLORS.blueBone.lightest }}>
                    <span className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Strategie</span>
                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] sm:text-xs text-slate-500 mb-1">Haltedauer</label>
                        <select value={currentObjekt.haltedauer} onChange={(e) => updateObjekt('haltedauer', e.target.value)}
                          className="ob-input w-full px-3 py-2.5 rounded-lg text-xs sm:text-sm">
                          <option value="">Auswählen...</option>
                          {HALTEDAUER.map((h) => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] sm:text-xs text-slate-500 mb-1">Primäres Ziel</label>
                        <select value={currentObjekt.primaeres_ziel} onChange={(e) => updateObjekt('primaeres_ziel', e.target.value)}
                          className="ob-input w-full px-3 py-2.5 rounded-lg text-xs sm:text-sm">
                          <option value="">Auswählen...</option>
                          {PRIMAERE_ZIELE.map((z) => <option key={z} value={z}>{z}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] sm:text-xs text-slate-500 mb-1">Risikoprofil</label>
                        <select value={currentObjekt.risikoprofil} onChange={(e) => updateObjekt('risikoprofil', e.target.value)}
                          className="ob-input w-full px-3 py-2.5 rounded-lg text-xs sm:text-sm">
                          <option value="">Auswählen...</option>
                          {RISIKOPROFILE.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] sm:text-xs text-slate-500 mb-1">Investitionsbereitschaft</label>
                        <input type="text" value={currentObjekt.investitionsbereitschaft} onChange={(e) => updateObjekt('investitionsbereitschaft', e.target.value)}
                          className="ob-input w-full px-3 py-2.5 rounded-lg text-xs sm:text-sm" placeholder="Bis 200.000€" />
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              )}

              {objektSubStep === 6 && (
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex justify-between items-center mb-2 sm:mb-3 flex-shrink-0">
                    <span className="text-xs sm:text-sm font-medium" style={{ color: COLORS.growthBlue.dark }}>
                      {currentObjekt.anzahl_wohneinheiten}W + {currentObjekt.anzahl_gewerbeeinheiten}G + {currentObjekt.anzahl_stellplaetze}S
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 min-h-0">
                    {currentObjekt.einheiten.map((einheit, idx) => {
                      const bgbKey = `${currentObjektIndex}-${idx}`;
                      const isBGBExpanded = expandedBGB.has(bgbKey);
                      const hasBGBFields = einheit.nutzung === 'Wohnen' && einheit.mietvertragsart !== 'Index';

                      return (
                        <div key={idx} className="p-3 sm:p-4 rounded-xl border-l-4"
                          style={{
                            backgroundColor: COLORS.blueBone.lightest,
                            borderLeftColor: einheit.nutzung === 'Wohnen' ? '#3B82F6' : einheit.nutzung === 'Gewerbe' ? '#F59E0B' : '#6B7280'
                          }}>
                          {/* Header */}
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-sm sm:text-base font-semibold" style={{ color: COLORS.royalNavy.dark }}>
                              {einheit.nutzung === 'Wohnen' ? 'Wohnung' : einheit.nutzung === 'Gewerbe' ? 'Gewerbe' : 'Stellplatz'} {idx + 1}
                            </span>
                            <span className="text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full font-medium"
                              style={{
                                backgroundColor: einheit.nutzung === 'Wohnen' ? '#DBEAFE' : einheit.nutzung === 'Gewerbe' ? '#FEF3C7' : '#F3F4F6',
                                color: einheit.nutzung === 'Wohnen' ? '#1D4ED8' : einheit.nutzung === 'Gewerbe' ? '#B45309' : '#4B5563'
                              }}>
                              {einheit.nutzung}
                            </span>
                          </div>

                          {/* Basis-Felder - 2 Spalten auf Mobile, 4 auf Desktop */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-3">
                            <div>
                              <label className="block text-[10px] sm:text-xs text-slate-500 mb-1">Fläche m² *</label>
                              <input type="text" inputMode="decimal" value={einheit.flaeche}
                                onChange={(e) => updateEinheit(idx, 'flaeche', e.target.value)}
                                className="ob-input w-full px-2 sm:px-3 py-2.5 rounded-lg text-xs sm:text-sm" placeholder="75" />
                            </div>
                            <div>
                              <label className="block text-[10px] sm:text-xs text-slate-500 mb-1">Miete €/M *</label>
                              <input type="text" inputMode="decimal" value={einheit.kaltmiete}
                                onChange={(e) => updateEinheit(idx, 'kaltmiete', e.target.value)}
                                className="ob-input w-full px-2 sm:px-3 py-2.5 rounded-lg text-xs sm:text-sm" placeholder="850" />
                            </div>
                            <div>
                              <label className="block text-[10px] sm:text-xs text-slate-500 mb-1">
                                Markt €/m²
                                {marktdatenLoading[currentObjektIndex] && (
                                  <span className="ml-1 inline-block animate-pulse text-blue-500">⟳</span>
                                )}
                              </label>
                              <input type="text" inputMode="decimal" value={einheit.vergleichsmiete}
                                onChange={(e) => updateEinheit(idx, 'vergleichsmiete', e.target.value)}
                                className={`ob-input w-full px-2 sm:px-3 py-2.5 rounded-lg text-xs sm:text-sm ${marktdatenLoading[currentObjektIndex] ? 'animate-pulse' : ''}`} placeholder="14" />
                              {idx === 0 && marktdatenQuelle[currentObjektIndex] && !marktdatenLoading[currentObjektIndex] && (
                                <span className="block text-[8px] sm:text-[10px] text-blue-500 mt-0.5 truncate" title={marktdatenQuelle[currentObjektIndex]}>
                                  📊 {marktdatenQuelle[currentObjektIndex]}
                                </span>
                              )}
                            </div>
                            <div>
                              <label className="block text-[10px] sm:text-xs text-slate-500 mb-1">Vertragsart *</label>
                              <select value={einheit.mietvertragsart} onChange={(e) => updateEinheit(idx, 'mietvertragsart', e.target.value)}
                                className="ob-input w-full px-2 sm:px-3 py-2.5 rounded-lg text-xs sm:text-sm">
                                <option value="Standard">Standard</option>
                                <option value="Index">Index</option>
                                <option value="Staffel">Staffel</option>
                              </select>
                            </div>
                          </div>

                          {/* Vertragsdaten */}
                          <div className="pt-3 border-t border-slate-200 mb-3">
                            <span className="block text-[10px] sm:text-xs font-medium text-slate-500 mb-2">Vertragsdaten</span>
                            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                              <div>
                                <label className="block text-[10px] sm:text-xs text-slate-500 mb-1">Vertragsbeginn *</label>
                                <input type="date" value={einheit.vertragsbeginn}
                                  onChange={(e) => updateEinheit(idx, 'vertragsbeginn', e.target.value)}
                                  className="ob-input w-full px-2 sm:px-3 py-2.5 rounded-lg text-xs sm:text-sm" />
                              </div>
                              <div>
                                <label className="block text-[10px] sm:text-xs text-slate-500 mb-1">Letzte Erhöhung</label>
                                <input type="date" value={einheit.letzte_mieterhoehung}
                                  onChange={(e) => updateEinheit(idx, 'letzte_mieterhoehung', e.target.value)}
                                  className="ob-input w-full px-2 sm:px-3 py-2.5 rounded-lg text-xs sm:text-sm" />
                              </div>
                              <div className="xs:col-span-2 sm:col-span-2">
                                <label className="block text-[10px] sm:text-xs text-slate-500 mb-1">Höhe Erhöhung (€)</label>
                                <input type="text" inputMode="decimal" value={einheit.hoehe_mieterhoehung}
                                  onChange={(e) => updateEinheit(idx, 'hoehe_mieterhoehung', e.target.value)}
                                  className="ob-input w-full px-2 sm:px-3 py-2.5 rounded-lg text-xs sm:text-sm" placeholder="50" />
                              </div>
                            </div>
                          </div>

                          {/* Collapsible BGB Section */}
                          {hasBGBFields && (
                            <div className="pt-2 border-t border-slate-200">
                              <button type="button" onClick={() => toggleBGB(bgbKey)}
                                className="w-full flex items-center justify-between py-2 text-left active:scale-[0.99] transition-transform min-h-[44px]">
                                <span className="text-[10px] sm:text-xs font-medium text-slate-600">
                                  §558/§559 BGB Details
                                </span>
                                <span className="text-[10px] sm:text-xs text-slate-400">
                                  {isBGBExpanded ? '▲ Einklappen' : '▼ Ausklappen'}
                                </span>
                              </button>

                              {isBGBExpanded && (
                                <div className="space-y-3 pt-2">
                                  {/* §558 BGB - nur für Standard-Vertrag */}
                                  {einheit.mietvertragsart === 'Standard' && (
                                    <div className="p-2.5 sm:p-3 rounded-lg bg-blue-50/50">
                                      <span className="block text-[10px] sm:text-xs font-medium text-blue-700 mb-2">§558 BGB - Vergleichsmiete</span>
                                      <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3">
                                        <div>
                                          <label className="block text-[10px] sm:text-xs text-slate-500 mb-1">Datum</label>
                                          <input type="date" value={einheit.datum_558}
                                            onChange={(e) => updateEinheit(idx, 'datum_558', e.target.value)}
                                            className="ob-input w-full px-2 sm:px-3 py-2.5 rounded-lg text-xs sm:text-sm" />
                                        </div>
                                        <div>
                                          <label className="block text-[10px] sm:text-xs text-slate-500 mb-1">Höhe (€)</label>
                                          <input type="text" inputMode="decimal" value={einheit.hoehe_558}
                                            onChange={(e) => updateEinheit(idx, 'hoehe_558', e.target.value)}
                                            className="ob-input w-full px-2 sm:px-3 py-2.5 rounded-lg text-xs sm:text-sm" placeholder="30" />
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* §559 BGB - Modernisierung */}
                                  <div className="p-2.5 sm:p-3 rounded-lg bg-amber-50/50">
                                    <span className="block text-[10px] sm:text-xs font-medium text-amber-700 mb-2">§559 BGB - Modernisierung</span>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                                      <div>
                                        <label className="block text-[10px] sm:text-xs text-slate-500 mb-1">Datum</label>
                                        <input type="date" value={einheit.datum_559}
                                          onChange={(e) => updateEinheit(idx, 'datum_559', e.target.value)}
                                          className="ob-input w-full px-2 sm:px-3 py-2.5 rounded-lg text-xs sm:text-sm" />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] sm:text-xs text-slate-500 mb-1">Art</label>
                                        <input type="text" value={einheit.art_modernisierung_559}
                                          onChange={(e) => updateEinheit(idx, 'art_modernisierung_559', e.target.value)}
                                          className="ob-input w-full px-2 sm:px-3 py-2.5 rounded-lg text-xs sm:text-sm" placeholder="Dämmung" />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] sm:text-xs text-slate-500 mb-1">Höhe (€/M)</label>
                                        <input type="text" inputMode="decimal" value={einheit.hoehe_559}
                                          onChange={(e) => updateEinheit(idx, 'hoehe_559', e.target.value)}
                                          className="ob-input w-full px-2 sm:px-3 py-2.5 rounded-lg text-xs sm:text-sm" placeholder="25" />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===== STEP 4: ÜBERSICHT ===== */}
          {mainStep === 4 && (
            <div className="flex-1 flex flex-col min-h-0">
              <h2 className="text-sm sm:text-lg font-bold mb-2 sm:mb-4 flex-shrink-0" style={{ color: COLORS.royalNavy.dark }}>Übersicht</h2>

              <div className="flex-1 overflow-y-auto space-y-2 sm:space-y-4 min-h-0">
                <div className="p-2 sm:p-4 rounded-lg" style={{ backgroundColor: COLORS.blueBone.lightest }}>
                  <h3 className="font-semibold mb-1 sm:mb-2 text-xs sm:text-base" style={{ color: COLORS.royalNavy.dark }}>Kontakt</h3>
                  <div className="grid grid-cols-2 gap-1 sm:gap-2 text-[10px] sm:text-sm">
                    <div className="truncate"><span className="text-slate-500">Firma:</span> {formData.name}</div>
                    <div className="truncate"><span className="text-slate-500">Name:</span> {formData.vorname} {formData.nachname}</div>
                    <div className="truncate col-span-2"><span className="text-slate-500">Adresse:</span> {formData.strasse}, {formData.plz} {formData.ort}{formData.land && formData.land !== 'Deutschland' ? `, ${formData.land}` : ''}</div>
                    <div className="truncate col-span-2"><span className="text-slate-500">E-Mail:</span> {formData.email}</div>
                  </div>
                </div>

                {formData.createAnkaufsprofil && (
                  <div className="p-2 sm:p-4 rounded-lg" style={{ backgroundColor: COLORS.blueBone.light }}>
                    <h3 className="font-semibold mb-1 sm:mb-2 text-xs sm:text-base" style={{ color: COLORS.royalNavy.dark }}>Ankaufsprofil</h3>
                    <div className="text-[10px] sm:text-sm truncate">
                      {formData.ankaufsprofil.assetklassen.slice(0, 3).join(', ') || '-'}{formData.ankaufsprofil.assetklassen.length > 3 ? '...' : ''}
                    </div>
                  </div>
                )}

                <div className="p-2 sm:p-4 rounded-lg" style={{ backgroundColor: COLORS.blueBone.lightest }}>
                  <h3 className="font-semibold mb-1 sm:mb-3 text-xs sm:text-base" style={{ color: COLORS.royalNavy.dark }}>Portfolio</h3>
                  <div className="grid grid-cols-4 gap-1 sm:gap-4 text-center mb-2 sm:mb-4">
                    <div>
                      <div className="text-slate-500 text-[8px] sm:text-xs">Objekte</div>
                      <div className="text-sm sm:text-2xl font-bold" style={{ color: COLORS.royalNavy.dark }}>{stats.totalObjekte}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-[8px] sm:text-xs">Einh.</div>
                      <div className="text-sm sm:text-2xl font-bold" style={{ color: COLORS.royalNavy.dark }}>{stats.totalEinheiten}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-[8px] sm:text-xs">m²</div>
                      <div className="text-sm sm:text-2xl font-bold" style={{ color: COLORS.royalNavy.dark }}>{stats.totalFlaeche.toLocaleString('de-DE')}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-[8px] sm:text-xs">€/Jahr</div>
                      <div className="text-sm sm:text-2xl font-bold text-green-600">{(stats.totalMiete * 12).toLocaleString('de-DE')}</div>
                    </div>
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    {formData.objekte.slice(0, 3).map((obj, idx) => (
                      <div key={idx} className="flex justify-between items-center p-1.5 sm:p-2 bg-white rounded text-[10px] sm:text-sm gap-1">
                        <span className="truncate">{obj.strasse || `Objekt ${idx + 1}`}</span>
                        <span className="text-green-600 whitespace-nowrap">{obj.einheiten.reduce((sum, e) => sum + (parseFloat(e.kaltmiete) || 0), 0).toLocaleString('de-DE')}€</span>
                      </div>
                    ))}
                    {formData.objekte.length > 3 && (
                      <div className="text-center text-[10px] sm:text-xs text-slate-500">
                        +{formData.objekte.length - 3} weitere
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && <div className="mt-2 sm:mt-4 p-2 sm:p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-[10px] sm:text-sm flex-shrink-0">{error}</div>}

          {/* Navigation - Fixed at bottom */}
          <div className="flex justify-between gap-2 mt-2 pt-2 border-t border-slate-200 flex-shrink-0">
            <button onClick={goBack} disabled={isFirstStep}
              className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed text-xs sm:text-base active:scale-95 transition-transform">
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            {isLastStep ? (
              <button onClick={handleSubmit} disabled={loading}
                className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-8 py-2 sm:py-3 text-white rounded-lg disabled:opacity-50 text-xs sm:text-base active:scale-95 transition-transform"
                style={{ backgroundColor: COLORS.growthBlue.base }}>
                {loading ? 'Senden...' : 'Absenden'}
                {loading ? null : <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              </button>
            ) : (
              <button onClick={goNext}
                className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 text-white rounded-lg text-xs sm:text-base active:scale-95 transition-transform"
                style={{ backgroundColor: COLORS.growthBlue.base }}>
                Weiter <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
