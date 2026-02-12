'use client';

import { useState } from 'react';
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
};

type Objekt = {
  strasse: string;
  plz: string;
  ort: string;
  gebaeudetyp: string;
  baujahr: string;
  kaufpreis: string;
  kaufdatum: string;
  eigenkapital_prozent: string;
  zinssatz: string;
  tilgung: string;
  instandhaltung: string;
  verwaltung: string;
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
  email: string;
  telefon: string;
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
const ASSETKLASSEN = ['MFH', 'Wohn- & Geschäftshaus', 'Büro', 'Retail', 'Logistik', 'Light Industrial', 'Betreiberimmobilien', 'Grundstücke', 'Development'];
const LAGEPRAEFERENZEN = ['A-Lage', 'B-Lage', 'C-Lage', 'Metropolregion', 'Universitätsstadt', 'Wachstumsregion'];
const FINANZIERUNGSFORMEN = ['Voll-EK', 'EK-dominant', 'Standard-Finanzierung', 'Offen'];
const ZUSTAENDE = ['Sanierungsbedürftig', 'Teilsaniert', 'Vollsaniert', 'Denkmal', 'Revitalisierung möglich'];

const createEmptyEinheit = (): Einheit => ({
  nutzung: 'Wohnen',
  flaeche: '',
  kaltmiete: '',
  vergleichsmiete: '12',
  mietvertragsart: 'Standard',
});

const createEmptyObjekt = (): Objekt => ({
  strasse: '', plz: '', ort: '', gebaeudetyp: 'MFH', baujahr: '', kaufpreis: '', kaufdatum: '',
  eigenkapital_prozent: '30', zinssatz: '3.8', tilgung: '2', instandhaltung: '', verwaltung: '',
  anzahl_wohneinheiten: 1, anzahl_gewerbeeinheiten: 0, anzahl_stellplaetze: 0,
  einheiten: [createEmptyEinheit()],
});

// Generiert Einheiten basierend auf Anzahl pro Nutzungsart
const generateEinheiten = (wohn: number, gewerbe: number, stellplaetze: number): Einheit[] => {
  const einheiten: Einheit[] = [];
  for (let i = 0; i < wohn; i++) {
    einheiten.push({ nutzung: 'Wohnen', flaeche: '', kaltmiete: '', vergleichsmiete: '12', mietvertragsart: 'Standard' });
  }
  for (let i = 0; i < gewerbe; i++) {
    einheiten.push({ nutzung: 'Gewerbe', flaeche: '', kaltmiete: '', vergleichsmiete: '12', mietvertragsart: 'Standard' });
  }
  for (let i = 0; i < stellplaetze; i++) {
    einheiten.push({ nutzung: 'Stellplatz', flaeche: '', kaltmiete: '', vergleichsmiete: '0', mietvertragsart: 'Standard' });
  }
  return einheiten.length > 0 ? einheiten : [{ nutzung: 'Wohnen', flaeche: '', kaltmiete: '', vergleichsmiete: '12', mietvertragsart: 'Standard' }];
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
    <div className="flex flex-wrap gap-1 sm:gap-2">
      {options.map((option) => (
        <button key={option} type="button" onClick={() => toggle(option)}
          className="px-1.5 sm:px-3 py-0.5 sm:py-1.5 rounded-full text-[10px] sm:text-sm font-medium transition-colors active:scale-95"
          style={selected.includes(option) ? { backgroundColor: COLORS.growthBlue.base, color: 'white' } : { backgroundColor: COLORS.blueBone.lightest, color: COLORS.royalNavy.dark }}>
          {option}
        </button>
      ))}
    </div>
  );
}

function SubStepIndicator({ current, total, labels }: { current: number; total: number; labels: string[] }) {
  return (
    <div className="flex items-center justify-center gap-0.5 sm:gap-1 mb-2 sm:mb-4">
      {labels.map((label, idx) => (
        <div key={idx} className="flex items-center flex-shrink-0">
          <div className={`w-4 h-4 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[8px] sm:text-xs font-medium ${idx + 1 <= current ? 'text-white' : 'text-slate-400'}`}
            style={{ backgroundColor: idx + 1 <= current ? COLORS.growthBlue.base : COLORS.blueBone.light }}>
            {idx + 1}
          </div>
          <span className={`ml-0.5 sm:ml-1 text-[8px] sm:text-xs hidden sm:inline ${idx + 1 === current ? 'font-medium text-slate-700' : 'text-slate-400'}`}>{label}</span>
          {idx < total - 1 && <div className="w-1.5 sm:w-4 h-0.5 mx-0.5 sm:mx-1" style={{ backgroundColor: idx + 1 < current ? COLORS.growthBlue.base : COLORS.blueBone.light }} />}
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
  const [objektSubStep, setObjektSubStep] = useState(1); // 1=Adresse, 2=Finanzierung, 3=Einheiten
  const [currentObjektIndex, setCurrentObjektIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: '', anrede: '', vorname: '', nachname: '', email: '', telefon: '',
    anzahl_objekte: 1,
    createAnkaufsprofil: false, ankaufsprofil: createEmptyAnkaufsprofil(), objekte: [createEmptyObjekt()],
  });

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
      return pos + (currentObjektIndex * 3) + objektSubStep - 1;
    }
    pos += formData.objekte.length * 3;

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
      if (objektSubStep < 3) {
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
      setObjektSubStep(3);
    } else if (mainStep === 3) {
      if (objektSubStep > 1) {
        setObjektSubStep(objektSubStep - 1);
      } else if (currentObjektIndex > 0) {
        setCurrentObjektIndex(currentObjektIndex - 1);
        setObjektSubStep(3);
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
  const updateMandant = (field: keyof Pick<FormData, 'name' | 'anrede' | 'vorname' | 'nachname' | 'email' | 'telefon'>, value: string) => {
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

  const updateObjekt = (field: keyof Omit<Objekt, 'einheiten' | 'anzahl_wohneinheiten' | 'anzahl_gewerbeeinheiten' | 'anzahl_stellplaetze'>, value: string) => {
    setFormData((prev) => ({
      ...prev,
      objekte: prev.objekte.map((o, i) => (i === currentObjektIndex ? { ...o, [field]: value } : o)),
    }));
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
          newAnzahl.anzahl_stellplaetze
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
        <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-8 max-w-lg w-full text-center">
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
        <div className="glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 flex-1 flex flex-col min-h-0">

          {/* ===== STEP 1: KONTAKT ===== */}
          {mainStep === 1 && (
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
              <h2 className="text-sm sm:text-lg font-bold mb-2 sm:mb-4 flex-shrink-0" style={{ color: COLORS.royalNavy.dark }}>Ihre Kontaktdaten</h2>
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] sm:text-sm font-medium text-slate-700 mb-0.5 sm:mb-1">Firmenname *</label>
                  <input type="text" value={formData.name} onChange={(e) => updateMandant('name', e.target.value)}
                    className="glass-input w-full px-2 sm:px-3 py-1.5 sm:py-2.5 rounded-lg text-xs sm:text-base" required />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-sm font-medium text-slate-700 mb-0.5 sm:mb-1">Anrede *</label>
                  <select value={formData.anrede} onChange={(e) => updateMandant('anrede', e.target.value)}
                    className="glass-input w-full px-2 sm:px-3 py-1.5 sm:py-2.5 rounded-lg text-xs sm:text-base" required>
                    <option value="">Wählen...</option>
                    <option value="Herr">Herr</option>
                    <option value="Frau">Frau</option>
                    <option value="Herr Dr.">Herr Dr.</option>
                    <option value="Frau Dr.">Frau Dr.</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] sm:text-sm font-medium text-slate-700 mb-0.5 sm:mb-1">Vorname *</label>
                  <input type="text" value={formData.vorname} onChange={(e) => updateMandant('vorname', e.target.value)}
                    className="glass-input w-full px-2 sm:px-3 py-1.5 sm:py-2.5 rounded-lg text-xs sm:text-base" required />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-sm font-medium text-slate-700 mb-0.5 sm:mb-1">Nachname *</label>
                  <input type="text" value={formData.nachname} onChange={(e) => updateMandant('nachname', e.target.value)}
                    className="glass-input w-full px-2 sm:px-3 py-1.5 sm:py-2.5 rounded-lg text-xs sm:text-base" required />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-sm font-medium text-slate-700 mb-0.5 sm:mb-1">E-Mail *</label>
                  <input type="email" value={formData.email} onChange={(e) => updateMandant('email', e.target.value)}
                    className="glass-input w-full px-2 sm:px-3 py-1.5 sm:py-2.5 rounded-lg text-xs sm:text-base" required />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-sm font-medium text-slate-700 mb-0.5 sm:mb-1">Telefon</label>
                  <input type="tel" value={formData.telefon} onChange={(e) => updateMandant('telefon', e.target.value)}
                    className="glass-input w-full px-2 sm:px-3 py-1.5 sm:py-2.5 rounded-lg text-xs sm:text-base" />
                </div>
              </div>

              {/* Anzahl Objekte - Compact */}
              <div className="mt-2 sm:mt-6 pt-2 sm:pt-6 border-t border-slate-200 flex-shrink-0">
                <div className="p-2 sm:p-4 rounded-lg" style={{ backgroundColor: COLORS.blueBone.lightest }}>
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
                        className="glass-input w-10 sm:w-20 px-1 sm:px-3 py-1 sm:py-2 rounded-lg text-center text-sm sm:text-xl font-bold" />
                      <button type="button" onClick={() => updateAnzahlObjekte(formData.anzahl_objekte + 1)}
                        className="w-7 h-7 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-xl font-bold active:scale-95 transition-transform"
                        style={{ backgroundColor: COLORS.growthBlue.base, color: 'white' }}>
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-2 sm:mt-6 flex-shrink-0">
                <label className="flex items-center gap-2 sm:gap-3 cursor-pointer p-2 sm:p-4 rounded-lg" style={{ backgroundColor: COLORS.blueBone.lightest }}>
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
                <div className="space-y-2 sm:space-y-4 flex-1 overflow-y-auto">
                  <div>
                    <label className="block text-[10px] sm:text-sm font-medium text-slate-700 mb-0.5 sm:mb-1">Profilname</label>
                    <input type="text" value={formData.ankaufsprofil.name} onChange={(e) => updateAnkauf('name', e.target.value)}
                      className="glass-input w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-base" placeholder="z.B. Core-Portfolio" />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-[10px] sm:text-sm font-medium text-slate-700">Kaufinteresse aktiv?</label>
                    <div className="flex gap-3">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" checked={formData.ankaufsprofil.kaufinteresse_aktiv === true}
                          onChange={() => updateAnkauf('kaufinteresse_aktiv', true)}
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ accentColor: COLORS.growthBlue.base }} />
                        <span className="text-xs sm:text-sm">Ja</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" checked={formData.ankaufsprofil.kaufinteresse_aktiv === false}
                          onChange={() => updateAnkauf('kaufinteresse_aktiv', false)}
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ accentColor: COLORS.growthBlue.base }} />
                        <span className="text-xs sm:text-sm">Nein</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">Assetklassen</label>
                    <MultiSelectChips options={ASSETKLASSEN} selected={formData.ankaufsprofil.assetklassen}
                      onChange={(s) => updateAnkauf('assetklassen', s)} />
                  </div>
                </div>
              )}

              {ankaufSubStep === 2 && (
                <div className="space-y-2 sm:space-y-4 flex-1 overflow-y-auto">
                  <div>
                    <label className="block text-[10px] sm:text-sm font-medium text-slate-700 mb-0.5 sm:mb-1">Städte/Regionen</label>
                    <textarea value={formData.ankaufsprofil.regionen} onChange={(e) => updateAnkauf('regionen', e.target.value)}
                      className="glass-input w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-base" rows={2} placeholder="z.B. München, Berlin..." />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">Lagepräferenz</label>
                    <MultiSelectChips options={LAGEPRAEFERENZEN} selected={formData.ankaufsprofil.lagepraeferenz}
                      onChange={(s) => updateAnkauf('lagepraeferenz', s)} />
                  </div>
                </div>
              )}

              {ankaufSubStep === 3 && (
                <div className="grid grid-cols-2 gap-2 sm:gap-4 flex-1">
                  <div>
                    <label className="block text-[10px] sm:text-sm font-medium text-slate-700 mb-0.5 sm:mb-1">Min. Vol. (EUR)</label>
                    <input type="text" inputMode="numeric" value={formData.ankaufsprofil.min_volumen}
                      onChange={(e) => updateAnkauf('min_volumen', e.target.value)}
                      className="glass-input w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-base" placeholder="1000000" />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-sm font-medium text-slate-700 mb-0.5 sm:mb-1">Max. Vol. (EUR)</label>
                    <input type="text" inputMode="numeric" value={formData.ankaufsprofil.max_volumen}
                      onChange={(e) => updateAnkauf('max_volumen', e.target.value)}
                      className="glass-input w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-base" placeholder="10000000" />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-sm font-medium text-slate-700 mb-0.5 sm:mb-1">Rendite (%)</label>
                    <input type="text" inputMode="decimal" value={formData.ankaufsprofil.rendite_min}
                      onChange={(e) => updateAnkauf('rendite_min', e.target.value)}
                      className="glass-input w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-base" placeholder="4.5" />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-sm font-medium text-slate-700 mb-0.5 sm:mb-1">Finanzierung</label>
                    <select value={formData.ankaufsprofil.finanzierungsform} onChange={(e) => updateAnkauf('finanzierungsform', e.target.value)}
                      className="glass-input w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-base">
                      <option value="">Wählen...</option>
                      {FINANZIERUNGSFORMEN.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {ankaufSubStep === 4 && (
                <div className="space-y-2 sm:space-y-4 flex-1 overflow-y-auto">
                  <div>
                    <label className="block text-[10px] sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">Zustand</label>
                    <MultiSelectChips options={ZUSTAENDE} selected={formData.ankaufsprofil.zustand}
                      onChange={(s) => updateAnkauf('zustand', s)} />
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
                    <div>
                      <label className="block text-[10px] sm:text-xs font-medium text-slate-700 mb-0.5 sm:mb-1">BJ von</label>
                      <input type="text" inputMode="numeric" value={formData.ankaufsprofil.baujahr_von}
                        onChange={(e) => updateAnkauf('baujahr_von', e.target.value)}
                        className="glass-input w-full px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm" placeholder="1950" />
                    </div>
                    <div>
                      <label className="block text-[10px] sm:text-xs font-medium text-slate-700 mb-0.5 sm:mb-1">BJ bis</label>
                      <input type="text" inputMode="numeric" value={formData.ankaufsprofil.baujahr_bis}
                        onChange={(e) => updateAnkauf('baujahr_bis', e.target.value)}
                        className="glass-input w-full px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm" placeholder="2020" />
                    </div>
                    <div>
                      <label className="block text-[10px] sm:text-xs font-medium text-slate-700 mb-0.5 sm:mb-1">Wohnfl.</label>
                      <input type="text" inputMode="numeric" value={formData.ankaufsprofil.min_wohnflaeche}
                        onChange={(e) => updateAnkauf('min_wohnflaeche', e.target.value)}
                        className="glass-input w-full px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm" placeholder="500" />
                    </div>
                    <div>
                      <label className="block text-[10px] sm:text-xs font-medium text-slate-700 mb-0.5 sm:mb-1">Einh.</label>
                      <input type="text" inputMode="numeric" value={formData.ankaufsprofil.min_wohneinheiten}
                        onChange={(e) => updateAnkauf('min_wohneinheiten', e.target.value)}
                        className="glass-input w-full px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm" placeholder="6" />
                    </div>
                  </div>
                </div>
              )}

              {ankaufSubStep === 5 && (
                <div className="space-y-2 sm:space-y-4 flex-1 overflow-y-auto">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-[10px] sm:text-sm font-medium text-slate-700">Ausgeschl. Partner?</label>
                    <div className="flex gap-3">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" checked={formData.ankaufsprofil.ausgeschlossene_partner === true}
                          onChange={() => updateAnkauf('ausgeschlossene_partner', true)}
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ accentColor: COLORS.growthBlue.base }} />
                        <span className="text-xs sm:text-sm">Ja</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" checked={formData.ankaufsprofil.ausgeschlossene_partner === false}
                          onChange={() => updateAnkauf('ausgeschlossene_partner', false)}
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ accentColor: COLORS.growthBlue.base }} />
                        <span className="text-xs sm:text-sm">Nein</span>
                      </label>
                    </div>
                  </div>
                  {formData.ankaufsprofil.ausgeschlossene_partner && (
                    <textarea value={formData.ankaufsprofil.ausgeschlossene_partner_liste}
                      onChange={(e) => updateAnkauf('ausgeschlossene_partner_liste', e.target.value)}
                      className="glass-input w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-base" rows={2} placeholder="Namen..." />
                  )}
                  <div>
                    <label className="block text-[10px] sm:text-sm font-medium text-slate-700 mb-0.5 sm:mb-1">Sonstiges</label>
                    <textarea value={formData.ankaufsprofil.sonstiges} onChange={(e) => updateAnkauf('sonstiges', e.target.value)}
                      className="glass-input w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-base" rows={2} placeholder="Weitere Kriterien..." />
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
                <SubStepIndicator current={objektSubStep} total={3} labels={['Adresse', 'Finanzierung', 'Einheiten']} />
              </div>

              {objektSubStep === 1 && (
                <div className="grid grid-cols-2 gap-2 sm:gap-4 flex-1 overflow-y-auto">
                  <div className="col-span-2">
                    <label className="block text-[10px] sm:text-sm font-medium text-slate-700 mb-0.5 sm:mb-1">Straße *</label>
                    <input type="text" value={currentObjekt.strasse} onChange={(e) => updateObjekt('strasse', e.target.value)}
                      className={`glass-input w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-base ${duplicateObjektNr ? 'border-amber-400 border-2' : ''}`}
                      placeholder="Musterstraße 1" />
                    {duplicateObjektNr && (
                      <div className="flex items-center gap-1 mt-1 text-amber-700 text-[10px] sm:text-xs">
                        <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                        <span>Bereits bei Objekt {duplicateObjektNr}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-sm font-medium text-slate-700 mb-0.5 sm:mb-1">PLZ *</label>
                    <input type="text" value={currentObjekt.plz} onChange={(e) => updateObjekt('plz', e.target.value)}
                      className="glass-input w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-base" placeholder="80000" />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-sm font-medium text-slate-700 mb-0.5 sm:mb-1">Ort *</label>
                    <input type="text" value={currentObjekt.ort} onChange={(e) => updateObjekt('ort', e.target.value)}
                      className="glass-input w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-base" placeholder="München" />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-sm font-medium text-slate-700 mb-0.5 sm:mb-1">Typ</label>
                    <select value={currentObjekt.gebaeudetyp} onChange={(e) => updateObjekt('gebaeudetyp', e.target.value)}
                      className="glass-input w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-base">
                      {GEBAEUDETYPEN.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-sm font-medium text-slate-700 mb-0.5 sm:mb-1">Baujahr</label>
                    <input type="text" inputMode="numeric" value={currentObjekt.baujahr} onChange={(e) => updateObjekt('baujahr', e.target.value)}
                      className="glass-input w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-base" placeholder="1985" />
                  </div>

                  {/* Anzahl Einheiten - Compact */}
                  <div className="col-span-2 p-2 sm:p-4 rounded-lg" style={{ backgroundColor: COLORS.blueBone.lightest }}>
                    <div className="grid grid-cols-3 gap-2 sm:gap-4">
                      <div>
                        <label className="block text-[10px] sm:text-xs text-slate-500 mb-0.5">Wohnen</label>
                        <input type="number" min="0" value={currentObjekt.anzahl_wohneinheiten}
                          onChange={(e) => updateObjektAnzahl('anzahl_wohneinheiten', Math.max(0, parseInt(e.target.value) || 0))}
                          className="glass-input w-full px-1.5 sm:px-3 py-1 sm:py-2 rounded-lg text-center text-xs sm:text-sm" />
                      </div>
                      <div>
                        <label className="block text-[10px] sm:text-xs text-slate-500 mb-0.5">Gewerbe</label>
                        <input type="number" min="0" value={currentObjekt.anzahl_gewerbeeinheiten}
                          onChange={(e) => updateObjektAnzahl('anzahl_gewerbeeinheiten', Math.max(0, parseInt(e.target.value) || 0))}
                          className="glass-input w-full px-1.5 sm:px-3 py-1 sm:py-2 rounded-lg text-center text-xs sm:text-sm" />
                      </div>
                      <div>
                        <label className="block text-[10px] sm:text-xs text-slate-500 mb-0.5">Stellpl.</label>
                        <input type="number" min="0" value={currentObjekt.anzahl_stellplaetze}
                          onChange={(e) => updateObjektAnzahl('anzahl_stellplaetze', Math.max(0, parseInt(e.target.value) || 0))}
                          className="glass-input w-full px-1.5 sm:px-3 py-1 sm:py-2 rounded-lg text-center text-xs sm:text-sm" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {objektSubStep === 2 && (
                <div className="grid grid-cols-2 gap-2 sm:gap-4 flex-1 overflow-hidden">
                  <div>
                    <label className="block text-[10px] sm:text-sm font-medium text-slate-700 mb-0.5 sm:mb-1">Kaufpreis *</label>
                    <input type="text" inputMode="numeric" value={currentObjekt.kaufpreis} onChange={(e) => updateObjekt('kaufpreis', e.target.value)}
                      className="glass-input w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-base" placeholder="2500000" />
                  </div>
                  <div className="overflow-hidden">
                    <label className="block text-[10px] sm:text-sm font-medium text-slate-700 mb-0.5 sm:mb-1">Kaufdatum</label>
                    <input type="date" value={currentObjekt.kaufdatum} onChange={(e) => updateObjekt('kaufdatum', e.target.value)}
                      className="glass-input w-full max-w-full px-1 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-base box-border" />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-sm font-medium text-slate-700 mb-0.5 sm:mb-1">EK %</label>
                    <input type="text" inputMode="decimal" value={currentObjekt.eigenkapital_prozent}
                      onChange={(e) => updateObjekt('eigenkapital_prozent', e.target.value)}
                      className="glass-input w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-base" placeholder="30" />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-sm font-medium text-slate-700 mb-0.5 sm:mb-1">Zins %</label>
                    <input type="text" inputMode="decimal" value={currentObjekt.zinssatz}
                      onChange={(e) => updateObjekt('zinssatz', e.target.value)}
                      className="glass-input w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-base" placeholder="3.8" />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-sm font-medium text-slate-700 mb-0.5 sm:mb-1">Tilgung %</label>
                    <input type="text" inputMode="decimal" value={currentObjekt.tilgung}
                      onChange={(e) => updateObjekt('tilgung', e.target.value)}
                      className="glass-input w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-base" placeholder="2" />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-sm font-medium text-slate-700 mb-0.5 sm:mb-1">Verwaltung/J</label>
                    <input type="text" inputMode="numeric" value={currentObjekt.verwaltung}
                      onChange={(e) => updateObjekt('verwaltung', e.target.value)}
                      className="glass-input w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-base" placeholder="4800" />
                  </div>
                </div>
              )}

              {objektSubStep === 3 && (
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex justify-between items-center mb-1 sm:mb-2 flex-shrink-0">
                    <span className="text-[10px] sm:text-sm" style={{ color: COLORS.growthBlue.dark }}>
                      {currentObjekt.anzahl_wohneinheiten}W + {currentObjekt.anzahl_gewerbeeinheiten}G + {currentObjekt.anzahl_stellplaetze}S
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-1.5 sm:space-y-3 min-h-0">
                    {currentObjekt.einheiten.map((einheit, idx) => (
                      <div key={idx} className="p-1.5 sm:p-3 rounded-lg" style={{ backgroundColor: COLORS.blueBone.lightest }}>
                        <div className="flex justify-between items-center mb-1 sm:mb-2">
                          <span className="text-[10px] sm:text-sm font-medium" style={{ color: COLORS.royalNavy.dark }}>
                            {einheit.nutzung === 'Wohnen' ? 'WE' : einheit.nutzung === 'Gewerbe' ? 'GE' : 'SP'} {idx + 1}
                          </span>
                          <span className="text-[8px] sm:text-xs px-1 sm:px-2 py-0.5 rounded-full" style={{ backgroundColor: COLORS.growthBlue.base, color: 'white' }}>
                            {einheit.nutzung}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-1 sm:gap-2">
                          <div>
                            <label className="block text-[8px] sm:text-xs text-slate-500 mb-0.5">m²</label>
                            <input type="text" inputMode="decimal" value={einheit.flaeche}
                              onChange={(e) => updateEinheit(idx, 'flaeche', e.target.value)}
                              className="glass-input w-full px-1 sm:px-2 py-0.5 sm:py-1.5 rounded text-[10px] sm:text-sm" placeholder="75" />
                          </div>
                          <div>
                            <label className="block text-[8px] sm:text-xs text-slate-500 mb-0.5">€/M</label>
                            <input type="text" inputMode="decimal" value={einheit.kaltmiete}
                              onChange={(e) => updateEinheit(idx, 'kaltmiete', e.target.value)}
                              className="glass-input w-full px-1 sm:px-2 py-0.5 sm:py-1.5 rounded text-[10px] sm:text-sm" placeholder="850" />
                          </div>
                          <div>
                            <label className="block text-[8px] sm:text-xs text-slate-500 mb-0.5">€/m²</label>
                            <input type="text" inputMode="decimal" value={einheit.vergleichsmiete}
                              onChange={(e) => updateEinheit(idx, 'vergleichsmiete', e.target.value)}
                              className="glass-input w-full px-1 sm:px-2 py-0.5 sm:py-1.5 rounded text-[10px] sm:text-sm" placeholder="14" />
                          </div>
                          <div>
                            <label className="block text-[8px] sm:text-xs text-slate-500 mb-0.5">Typ</label>
                            <select value={einheit.mietvertragsart} onChange={(e) => updateEinheit(idx, 'mietvertragsart', e.target.value)}
                              className="glass-input w-full px-0.5 sm:px-2 py-0.5 sm:py-1.5 rounded text-[10px] sm:text-sm">
                              <option value="Standard">Std</option>
                              <option value="Index">Idx</option>
                              <option value="Staffel">Stf</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
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
          <div className="flex justify-between gap-2 mt-2 sm:mt-6 pt-2 sm:pt-6 border-t border-slate-200 flex-shrink-0">
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
