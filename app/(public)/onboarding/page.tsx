'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CheckCircle, ArrowRight, ArrowLeft, Building2, User, Home, Plus, Trash2, ShoppingCart } from 'lucide-react';

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
  ansprechpartner: string;
  position: string;
  email: string;
  telefon: string;
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
  einheiten: [createEmptyEinheit()],
});

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
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button key={option} type="button" onClick={() => toggle(option)}
          className="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
          style={selected.includes(option) ? { backgroundColor: COLORS.growthBlue.base, color: 'white' } : { backgroundColor: COLORS.blueBone.lightest, color: COLORS.royalNavy.dark }}>
          {option}
        </button>
      ))}
    </div>
  );
}

function SubStepIndicator({ current, total, labels }: { current: number; total: number; labels: string[] }) {
  return (
    <div className="flex items-center gap-1 mb-4">
      {labels.map((label, idx) => (
        <div key={idx} className="flex items-center">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${idx + 1 <= current ? 'text-white' : 'text-slate-400'}`}
            style={{ backgroundColor: idx + 1 <= current ? COLORS.growthBlue.base : COLORS.blueBone.light }}>
            {idx + 1}
          </div>
          <span className={`ml-1 text-xs hidden sm:inline ${idx + 1 === current ? 'font-medium text-slate-700' : 'text-slate-400'}`}>{label}</span>
          {idx < total - 1 && <div className="w-4 h-0.5 mx-1" style={{ backgroundColor: idx + 1 < current ? COLORS.growthBlue.base : COLORS.blueBone.light }} />}
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
    name: '', ansprechpartner: '', position: '', email: '', telefon: '',
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
  const updateMandant = (field: keyof Pick<FormData, 'name' | 'ansprechpartner' | 'position' | 'email' | 'telefon'>, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateAnkauf = (field: keyof Ankaufsprofil, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, ankaufsprofil: { ...prev.ankaufsprofil, [field]: value } }));
  };

  const updateObjekt = (field: keyof Omit<Objekt, 'einheiten'>, value: string) => {
    setFormData((prev) => ({
      ...prev,
      objekte: prev.objekte.map((o, i) => (i === currentObjektIndex ? { ...o, [field]: value } : o)),
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

  const addObjekt = () => {
    setFormData((prev) => ({ ...prev, objekte: [...prev.objekte, createEmptyObjekt()] }));
  };

  const removeObjekt = (idx: number) => {
    if (formData.objekte.length <= 1) return;
    setFormData((prev) => ({ ...prev, objekte: prev.objekte.filter((_, i) => i !== idx) }));
    if (currentObjektIndex >= formData.objekte.length - 1) {
      setCurrentObjektIndex(Math.max(0, formData.objekte.length - 2));
    }
  };

  const addEinheit = () => {
    setFormData((prev) => ({
      ...prev,
      objekte: prev.objekte.map((o, i) =>
        i === currentObjektIndex ? { ...o, einheiten: [...o.einheiten, createEmptyEinheit()] } : o
      ),
    }));
  };

  const removeEinheit = (einheitIndex: number) => {
    const objekt = formData.objekte[currentObjektIndex];
    if (objekt.einheiten.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      objekte: prev.objekte.map((o, i) =>
        i === currentObjektIndex ? { ...o, einheiten: o.einheiten.filter((_, ei) => ei !== einheitIndex) } : o
      ),
    }));
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
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #1E2A3A 0%, #2A3F54 50%, #3D5167 100%)' }}>
        <div className="glass-card rounded-2xl p-8 max-w-lg text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: COLORS.growthBlue.base }}>
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-4" style={{ color: COLORS.royalNavy.dark }}>Vielen Dank!</h1>
          <p className="text-slate-600 mb-6">
            Ihre Daten wurden erfolgreich übermittelt. Wir werden Ihre {stats.totalObjekte} Objekte analysieren.
          </p>
          <a href="/" className="inline-block px-6 py-3 text-white rounded-lg" style={{ backgroundColor: COLORS.growthBlue.base }}>
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
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #1E2A3A 0%, #2A3F54 50%, #3D5167 100%)' }}>
      {/* Header */}
      <div className="py-4 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Image src="/logo_imperoyal.png" alt="Imperoyal" width={160} height={48} className="h-8 sm:h-10 w-auto brightness-0 invert" priority />
          <span className="text-white/70 text-sm">Schritt {currentStepNumber} von {totalSteps}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto px-4 mb-4">
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full transition-all duration-300" style={{ width: `${(currentStepNumber / totalSteps) * 100}%`, backgroundColor: COLORS.growthBlue.base }} />
        </div>
        <div className="flex justify-between mt-2">
          {MAIN_STEPS.map((s) => (
            <span key={s.id} className={`text-xs ${mainStep >= s.id || (s.id === 3 && mainStep >= 3) ? 'text-white' : 'text-white/40'}`}>
              {s.title}
            </span>
          ))}
        </div>
      </div>

      {/* Form Card */}
      <div className="max-w-4xl mx-auto px-4 pb-6">
        <div className="glass-card rounded-2xl p-4 sm:p-6">

          {/* ===== STEP 1: KONTAKT ===== */}
          {mainStep === 1 && (
            <div>
              <h2 className="text-lg font-bold mb-4" style={{ color: COLORS.royalNavy.dark }}>Ihre Kontaktdaten</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Firmenname / Name *</label>
                  <input type="text" value={formData.name} onChange={(e) => updateMandant('name', e.target.value)}
                    className="glass-input w-full px-3 py-2.5 rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ansprechpartner *</label>
                  <input type="text" value={formData.ansprechpartner} onChange={(e) => updateMandant('ansprechpartner', e.target.value)}
                    className="glass-input w-full px-3 py-2.5 rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">E-Mail *</label>
                  <input type="email" value={formData.email} onChange={(e) => updateMandant('email', e.target.value)}
                    className="glass-input w-full px-3 py-2.5 rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
                  <input type="tel" value={formData.telefon} onChange={(e) => updateMandant('telefon', e.target.value)}
                    className="glass-input w-full px-3 py-2.5 rounded-lg" />
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-200">
                <label className="flex items-center gap-3 cursor-pointer p-4 rounded-lg" style={{ backgroundColor: COLORS.blueBone.lightest }}>
                  <input type="checkbox" checked={formData.createAnkaufsprofil}
                    onChange={(e) => setFormData((prev) => ({ ...prev, createAnkaufsprofil: e.target.checked }))}
                    className="w-5 h-5 rounded" style={{ accentColor: COLORS.growthBlue.base }} />
                  <div>
                    <span className="font-medium" style={{ color: COLORS.royalNavy.dark }}>Ankaufsprofil erstellen</span>
                    <p className="text-sm text-slate-600">Erhalten Sie passende Objekt-Angebote von uns</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* ===== STEP 2: ANKAUFSPROFIL ===== */}
          {mainStep === 2 && formData.createAnkaufsprofil && (
            <div>
              <h2 className="text-lg font-bold mb-2" style={{ color: COLORS.royalNavy.dark }}>Ihr Ankaufsprofil</h2>
              <SubStepIndicator current={ankaufSubStep} total={5} labels={['Basics', 'Standort', 'Finanzen', 'Objekt', 'Sonstiges']} />

              {ankaufSubStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Profilname</label>
                    <input type="text" value={formData.ankaufsprofil.name} onChange={(e) => updateAnkauf('name', e.target.value)}
                      className="glass-input w-full px-3 py-2 rounded-lg" placeholder="z.B. Core-Portfolio" />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-slate-700">Kaufinteresse aktiv?</label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={formData.ankaufsprofil.kaufinteresse_aktiv === true}
                        onChange={() => updateAnkauf('kaufinteresse_aktiv', true)}
                        className="w-4 h-4" style={{ accentColor: COLORS.growthBlue.base }} />
                      <span className="text-sm">Ja</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={formData.ankaufsprofil.kaufinteresse_aktiv === false}
                        onChange={() => updateAnkauf('kaufinteresse_aktiv', false)}
                        className="w-4 h-4" style={{ accentColor: COLORS.growthBlue.base }} />
                      <span className="text-sm">Nein</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Bevorzugte Assetklassen</label>
                    <MultiSelectChips options={ASSETKLASSEN} selected={formData.ankaufsprofil.assetklassen}
                      onChange={(s) => updateAnkauf('assetklassen', s)} />
                  </div>
                </div>
              )}

              {ankaufSubStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Bevorzugte Städte/Regionen</label>
                    <textarea value={formData.ankaufsprofil.regionen} onChange={(e) => updateAnkauf('regionen', e.target.value)}
                      className="glass-input w-full px-3 py-2 rounded-lg" rows={3} placeholder="z.B. München, Berlin, Hamburg..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Lagepräferenz</label>
                    <MultiSelectChips options={LAGEPRAEFERENZEN} selected={formData.ankaufsprofil.lagepraeferenz}
                      onChange={(s) => updateAnkauf('lagepraeferenz', s)} />
                  </div>
                </div>
              )}

              {ankaufSubStep === 3 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Min. Volumen (EUR)</label>
                    <input type="text" inputMode="numeric" value={formData.ankaufsprofil.min_volumen}
                      onChange={(e) => updateAnkauf('min_volumen', e.target.value)}
                      className="glass-input w-full px-3 py-2 rounded-lg" placeholder="1000000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Max. Volumen (EUR)</label>
                    <input type="text" inputMode="numeric" value={formData.ankaufsprofil.max_volumen}
                      onChange={(e) => updateAnkauf('max_volumen', e.target.value)}
                      className="glass-input w-full px-3 py-2 rounded-lg" placeholder="10000000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Zielrendite IST (%)</label>
                    <input type="text" inputMode="decimal" value={formData.ankaufsprofil.rendite_min}
                      onChange={(e) => updateAnkauf('rendite_min', e.target.value)}
                      className="glass-input w-full px-3 py-2 rounded-lg" placeholder="4.5" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Finanzierungsform</label>
                    <select value={formData.ankaufsprofil.finanzierungsform} onChange={(e) => updateAnkauf('finanzierungsform', e.target.value)}
                      className="glass-input w-full px-3 py-2 rounded-lg">
                      <option value="">Bitte wählen...</option>
                      {FINANZIERUNGSFORMEN.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {ankaufSubStep === 4 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Zustand</label>
                    <MultiSelectChips options={ZUSTAENDE} selected={formData.ankaufsprofil.zustand}
                      onChange={(s) => updateAnkauf('zustand', s)} />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Baujahr von</label>
                      <input type="text" inputMode="numeric" value={formData.ankaufsprofil.baujahr_von}
                        onChange={(e) => updateAnkauf('baujahr_von', e.target.value)}
                        className="glass-input w-full px-3 py-2 rounded-lg" placeholder="1950" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Baujahr bis</label>
                      <input type="text" inputMode="numeric" value={formData.ankaufsprofil.baujahr_bis}
                        onChange={(e) => updateAnkauf('baujahr_bis', e.target.value)}
                        className="glass-input w-full px-3 py-2 rounded-lg" placeholder="2020" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Min. Wohnfläche</label>
                      <input type="text" inputMode="numeric" value={formData.ankaufsprofil.min_wohnflaeche}
                        onChange={(e) => updateAnkauf('min_wohnflaeche', e.target.value)}
                        className="glass-input w-full px-3 py-2 rounded-lg" placeholder="500 m²" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Min. Einheiten</label>
                      <input type="text" inputMode="numeric" value={formData.ankaufsprofil.min_wohneinheiten}
                        onChange={(e) => updateAnkauf('min_wohneinheiten', e.target.value)}
                        className="glass-input w-full px-3 py-2 rounded-lg" placeholder="6" />
                    </div>
                  </div>
                </div>
              )}

              {ankaufSubStep === 5 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-slate-700">Ausgeschlossene Partner?</label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={formData.ankaufsprofil.ausgeschlossene_partner === true}
                        onChange={() => updateAnkauf('ausgeschlossene_partner', true)}
                        className="w-4 h-4" style={{ accentColor: COLORS.growthBlue.base }} />
                      <span className="text-sm">Ja</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={formData.ankaufsprofil.ausgeschlossene_partner === false}
                        onChange={() => updateAnkauf('ausgeschlossene_partner', false)}
                        className="w-4 h-4" style={{ accentColor: COLORS.growthBlue.base }} />
                      <span className="text-sm">Nein</span>
                    </label>
                  </div>
                  {formData.ankaufsprofil.ausgeschlossene_partner && (
                    <textarea value={formData.ankaufsprofil.ausgeschlossene_partner_liste}
                      onChange={(e) => updateAnkauf('ausgeschlossene_partner_liste', e.target.value)}
                      className="glass-input w-full px-3 py-2 rounded-lg" rows={2} placeholder="Namen..." />
                  )}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Sonstiges / Anmerkungen</label>
                    <textarea value={formData.ankaufsprofil.sonstiges} onChange={(e) => updateAnkauf('sonstiges', e.target.value)}
                      className="glass-input w-full px-3 py-2 rounded-lg" rows={3} placeholder="Weitere Kriterien..." />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===== STEP 3: OBJEKTE ===== */}
          {mainStep === 3 && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-bold" style={{ color: COLORS.royalNavy.dark }}>
                  Objekt {currentObjektIndex + 1} von {formData.objekte.length}
                </h2>
                {formData.objekte.length > 1 && (
                  <button onClick={() => removeObjekt(currentObjektIndex)} className="text-red-500 text-sm hover:underline">
                    Objekt löschen
                  </button>
                )}
              </div>
              <SubStepIndicator current={objektSubStep} total={3} labels={['Adresse', 'Finanzierung', 'Einheiten']} />

              {objektSubStep === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Straße *</label>
                    <input type="text" value={currentObjekt.strasse} onChange={(e) => updateObjekt('strasse', e.target.value)}
                      className="glass-input w-full px-3 py-2 rounded-lg" placeholder="Musterstraße 1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">PLZ *</label>
                    <input type="text" value={currentObjekt.plz} onChange={(e) => updateObjekt('plz', e.target.value)}
                      className="glass-input w-full px-3 py-2 rounded-lg" placeholder="80000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Ort *</label>
                    <input type="text" value={currentObjekt.ort} onChange={(e) => updateObjekt('ort', e.target.value)}
                      className="glass-input w-full px-3 py-2 rounded-lg" placeholder="München" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Gebäudetyp</label>
                    <select value={currentObjekt.gebaeudetyp} onChange={(e) => updateObjekt('gebaeudetyp', e.target.value)}
                      className="glass-input w-full px-3 py-2 rounded-lg">
                      {GEBAEUDETYPEN.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Baujahr</label>
                    <input type="text" inputMode="numeric" value={currentObjekt.baujahr} onChange={(e) => updateObjekt('baujahr', e.target.value)}
                      className="glass-input w-full px-3 py-2 rounded-lg" placeholder="1985" />
                  </div>
                </div>
              )}

              {objektSubStep === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Kaufpreis (EUR) *</label>
                    <input type="text" inputMode="numeric" value={currentObjekt.kaufpreis} onChange={(e) => updateObjekt('kaufpreis', e.target.value)}
                      className="glass-input w-full px-3 py-2 rounded-lg" placeholder="2500000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Kaufdatum</label>
                    <input type="date" value={currentObjekt.kaufdatum} onChange={(e) => updateObjekt('kaufdatum', e.target.value)}
                      className="glass-input w-full px-3 py-2 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Eigenkapital (%)</label>
                    <input type="text" inputMode="decimal" value={currentObjekt.eigenkapital_prozent}
                      onChange={(e) => updateObjekt('eigenkapital_prozent', e.target.value)}
                      className="glass-input w-full px-3 py-2 rounded-lg" placeholder="30" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Zinssatz (%)</label>
                    <input type="text" inputMode="decimal" value={currentObjekt.zinssatz}
                      onChange={(e) => updateObjekt('zinssatz', e.target.value)}
                      className="glass-input w-full px-3 py-2 rounded-lg" placeholder="3.8" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tilgung (%)</label>
                    <input type="text" inputMode="decimal" value={currentObjekt.tilgung}
                      onChange={(e) => updateObjekt('tilgung', e.target.value)}
                      className="glass-input w-full px-3 py-2 rounded-lg" placeholder="2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Verwaltung (EUR/Jahr)</label>
                    <input type="text" inputMode="numeric" value={currentObjekt.verwaltung}
                      onChange={(e) => updateObjekt('verwaltung', e.target.value)}
                      className="glass-input w-full px-3 py-2 rounded-lg" placeholder="4800" />
                  </div>
                </div>
              )}

              {objektSubStep === 3 && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-slate-600">{currentObjekt.einheiten.length} Einheit(en)</span>
                    <button onClick={addEinheit} className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg"
                      style={{ backgroundColor: COLORS.blueBone.lightest, color: COLORS.royalNavy.dark }}>
                      <Plus className="w-4 h-4" /> Einheit
                    </button>
                  </div>
                  <div className="space-y-3">
                    {currentObjekt.einheiten.map((einheit, idx) => (
                      <div key={idx} className="p-3 rounded-lg" style={{ backgroundColor: COLORS.blueBone.lightest }}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Einheit {idx + 1}</span>
                          {currentObjekt.einheiten.length > 1 && (
                            <button onClick={() => removeEinheit(idx)} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">Nutzung</label>
                            <select value={einheit.nutzung} onChange={(e) => updateEinheit(idx, 'nutzung', e.target.value)}
                              className="glass-input w-full px-2 py-1.5 rounded text-sm">
                              <option value="Wohnen">Wohnen</option>
                              <option value="Gewerbe">Gewerbe</option>
                              <option value="Stellplatz">Stellplatz</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">m²</label>
                            <input type="text" inputMode="decimal" value={einheit.flaeche}
                              onChange={(e) => updateEinheit(idx, 'flaeche', e.target.value)}
                              className="glass-input w-full px-2 py-1.5 rounded text-sm" placeholder="75" />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">Miete €</label>
                            <input type="text" inputMode="decimal" value={einheit.kaltmiete}
                              onChange={(e) => updateEinheit(idx, 'kaltmiete', e.target.value)}
                              className="glass-input w-full px-2 py-1.5 rounded text-sm" placeholder="850" />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">Markt €/m²</label>
                            <input type="text" inputMode="decimal" value={einheit.vergleichsmiete}
                              onChange={(e) => updateEinheit(idx, 'vergleichsmiete', e.target.value)}
                              className="glass-input w-full px-2 py-1.5 rounded text-sm" placeholder="14" />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">Vertrag</label>
                            <select value={einheit.mietvertragsart} onChange={(e) => updateEinheit(idx, 'mietvertragsart', e.target.value)}
                              className="glass-input w-full px-2 py-1.5 rounded text-sm">
                              <option value="Standard">Standard</option>
                              <option value="Index">Index</option>
                              <option value="Staffel">Staffel</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add another object option */}
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <button onClick={addObjekt} className="flex items-center gap-2 text-sm"
                      style={{ color: COLORS.growthBlue.base }}>
                      <Plus className="w-4 h-4" /> Weiteres Objekt hinzufügen
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===== STEP 4: ÜBERSICHT ===== */}
          {mainStep === 4 && (
            <div>
              <h2 className="text-lg font-bold mb-4" style={{ color: COLORS.royalNavy.dark }}>Übersicht</h2>

              <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: COLORS.blueBone.lightest }}>
                <h3 className="font-semibold mb-2" style={{ color: COLORS.royalNavy.dark }}>Kontakt</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-slate-500">Firma:</span> {formData.name}</div>
                  <div><span className="text-slate-500">Ansprechpartner:</span> {formData.ansprechpartner}</div>
                  <div><span className="text-slate-500">E-Mail:</span> {formData.email}</div>
                  <div><span className="text-slate-500">Telefon:</span> {formData.telefon || '-'}</div>
                </div>
              </div>

              {formData.createAnkaufsprofil && (
                <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: COLORS.blueBone.light }}>
                  <h3 className="font-semibold mb-2" style={{ color: COLORS.royalNavy.dark }}>Ankaufsprofil</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-slate-500">Assetklassen:</span> {formData.ankaufsprofil.assetklassen.join(', ') || '-'}</div>
                    <div><span className="text-slate-500">Regionen:</span> {formData.ankaufsprofil.regionen || '-'}</div>
                  </div>
                </div>
              )}

              <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.blueBone.lightest }}>
                <h3 className="font-semibold mb-3" style={{ color: COLORS.royalNavy.dark }}>Portfolio</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
                  <div>
                    <div className="text-slate-500">Objekte</div>
                    <div className="text-2xl font-bold" style={{ color: COLORS.royalNavy.dark }}>{stats.totalObjekte}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Einheiten</div>
                    <div className="text-2xl font-bold" style={{ color: COLORS.royalNavy.dark }}>{stats.totalEinheiten}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Fläche</div>
                    <div className="text-2xl font-bold" style={{ color: COLORS.royalNavy.dark }}>{stats.totalFlaeche.toLocaleString('de-DE')} m²</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Jahresmiete</div>
                    <div className="text-2xl font-bold text-green-600">{(stats.totalMiete * 12).toLocaleString('de-DE')} €</div>
                  </div>
                </div>
                <div className="space-y-2">
                  {formData.objekte.map((obj, idx) => (
                    <div key={idx} className="flex justify-between p-2 bg-white rounded text-sm">
                      <span>{obj.strasse || `Objekt ${idx + 1}`}, {obj.ort}</span>
                      <span className="text-green-600">{obj.einheiten.reduce((sum, e) => sum + (parseFloat(e.kaltmiete) || 0), 0).toLocaleString('de-DE')} €/Mon</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>}

          {/* Navigation */}
          <div className="flex justify-between gap-3 mt-6 pt-6 border-t border-slate-200">
            <button onClick={goBack} disabled={isFirstStep}
              className="flex items-center gap-2 px-6 py-3 text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
              <ArrowLeft className="w-4 h-4" /> Zurück
            </button>
            {isLastStep ? (
              <button onClick={handleSubmit} disabled={loading}
                className="flex items-center gap-2 px-8 py-3 text-white rounded-lg disabled:opacity-50"
                style={{ backgroundColor: COLORS.growthBlue.base }}>
                {loading ? 'Wird gesendet...' : 'Absenden'} <CheckCircle className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={goNext}
                className="flex items-center gap-2 px-6 py-3 text-white rounded-lg"
                style={{ backgroundColor: COLORS.growthBlue.base }}>
                Weiter <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
