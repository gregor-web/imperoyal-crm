'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CheckCircle, ArrowRight, ArrowLeft, Building2, User, Home, Plus, Trash2, ChevronDown, ChevronUp, ShoppingCart } from 'lucide-react';

// =====================================================
// TYPES
// =====================================================

type Einheit = {
  nutzung: 'Wohnen' | 'Gewerbe' | 'Stellplatz';
  flaeche: string;
  kaltmiete: string;
  vergleichsmiete: string;
  mietvertragsart: 'Standard' | 'Index' | 'Staffel';
  vertragsbeginn: string;
  letzte_mieterhoehung: string;
  hoehe_mieterhoehung: string;
  datum_558: string;
  hoehe_558: string;
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
  weitere_projektarten: string;
};

type FormData = {
  // Mandanteninformationen
  name: string;
  ansprechpartner: string;
  position: string;
  email: string;
  telefon: string;
  // Ankaufsprofil (optional)
  createAnkaufsprofil: boolean;
  ankaufsprofil: Ankaufsprofil;
  // Objekte mit ihren Einheiten
  objekte: Objekt[];
};

// =====================================================
// BRAND COLORS
// =====================================================

const COLORS = {
  royalNavy: {
    dark: '#1E2A3A',
    medium: '#2A3F54',
    light: '#3D5167',
  },
  growthBlue: {
    dark: '#4A6A8D',
    base: '#5B7A9D',
    light: '#6B8AAD',
  },
  blueBone: {
    dark: '#9EAFC0',
    base: '#B8C5D1',
    light: '#D5DEE6',
    lightest: '#EDF1F5',
  },
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
  strasse: '',
  plz: '',
  ort: '',
  gebaeudetyp: 'MFH',
  baujahr: '',
  kaufpreis: '',
  kaufdatum: '',
  eigenkapital_prozent: '30',
  zinssatz: '3.8',
  tilgung: '2',
  instandhaltung: '',
  verwaltung: '',
  einheiten: [createEmptyEinheit()],
});

const createEmptyAnkaufsprofil = (): Ankaufsprofil => ({
  name: 'Ankaufsprofil',
  kaufinteresse_aktiv: true,
  assetklassen: [],
  regionen: '',
  lagepraeferenz: [],
  min_volumen: '',
  max_volumen: '',
  kaufpreisfaktor: '',
  rendite_min: '',
  rendite_soll: '',
  finanzierungsform: '',
  zustand: [],
  baujahr_von: '',
  baujahr_bis: '',
  min_wohnflaeche: '',
  min_gewerbeflaeche: '',
  min_wohneinheiten: '',
  min_gewerbeeinheiten: '',
  min_grundstueck: '',
  ausgeschlossene_partner: false,
  ausgeschlossene_partner_liste: '',
  sonstiges: '',
  weitere_projektarten: '',
});

// =====================================================
// HELPER COMPONENTS
// =====================================================

function MultiSelectChips({
  options,
  selected,
  onChange,
}: {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}) {
  const toggle = (option: string) => {
    const updated = selected.includes(option)
      ? selected.filter((s) => s !== option)
      : [...selected, option];
    onChange(updated);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => toggle(option)}
          className="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
          style={
            selected.includes(option)
              ? { backgroundColor: COLORS.growthBlue.base, color: 'white' }
              : { backgroundColor: COLORS.blueBone.lightest, color: COLORS.royalNavy.dark }
          }
        >
          {option}
        </button>
      ))}
    </div>
  );
}

// =====================================================
// COMPONENT
// =====================================================

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track which objects and units are expanded
  const [expandedObjekte, setExpandedObjekte] = useState<Set<number>>(new Set([0]));
  const [expandedEinheiten, setExpandedEinheiten] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState<FormData>({
    name: '',
    ansprechpartner: '',
    position: '',
    email: '',
    telefon: '',
    createAnkaufsprofil: false,
    ankaufsprofil: createEmptyAnkaufsprofil(),
    objekte: [createEmptyObjekt()],
  });

  // Dynamic steps based on whether Ankaufsprofil is being created
  const getSteps = () => {
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
      { id: 2, title: 'Objekte', icon: Home },
      { id: 3, title: 'Übersicht', icon: Building2 },
    ];
  };

  const STEPS = getSteps();
  const maxStep = STEPS.length;

  // =====================================================
  // TOGGLE FUNCTIONS
  // =====================================================

  const toggleObjektExpanded = (objektIndex: number) => {
    const newExpanded = new Set(expandedObjekte);
    if (newExpanded.has(objektIndex)) {
      newExpanded.delete(objektIndex);
    } else {
      newExpanded.add(objektIndex);
    }
    setExpandedObjekte(newExpanded);
  };

  const toggleEinheitExpanded = (objektIndex: number, einheitIndex: number) => {
    const key = `${objektIndex}-${einheitIndex}`;
    const newExpanded = new Set(expandedEinheiten);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedEinheiten(newExpanded);
  };

  // =====================================================
  // UPDATE FUNCTIONS
  // =====================================================

  const updateMandantField = (field: keyof Omit<FormData, 'objekte' | 'ankaufsprofil' | 'createAnkaufsprofil'>, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateAnkaufsprofilField = (field: keyof Ankaufsprofil, value: string | boolean | string[]) => {
    setFormData((prev) => ({
      ...prev,
      ankaufsprofil: { ...prev.ankaufsprofil, [field]: value },
    }));
  };

  const updateObjektField = (objektIndex: number, field: keyof Omit<Objekt, 'einheiten'>, value: string) => {
    setFormData((prev) => ({
      ...prev,
      objekte: prev.objekte.map((o, i) => (i === objektIndex ? { ...o, [field]: value } : o)),
    }));
  };

  const updateEinheitField = (objektIndex: number, einheitIndex: number, field: keyof Einheit, value: string) => {
    setFormData((prev) => ({
      ...prev,
      objekte: prev.objekte.map((o, oi) =>
        oi === objektIndex
          ? {
              ...o,
              einheiten: o.einheiten.map((e, ei) => (ei === einheitIndex ? { ...e, [field]: value } : e)),
            }
          : o
      ),
    }));
  };

  // =====================================================
  // ADD/REMOVE FUNCTIONS
  // =====================================================

  const addObjekt = () => {
    setFormData((prev) => ({
      ...prev,
      objekte: [...prev.objekte, createEmptyObjekt()],
    }));
    setExpandedObjekte((prev) => new Set([...prev, formData.objekte.length]));
  };

  const removeObjekt = (objektIndex: number) => {
    if (formData.objekte.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      objekte: prev.objekte.filter((_, i) => i !== objektIndex),
    }));
  };

  const addEinheit = (objektIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      objekte: prev.objekte.map((o, i) =>
        i === objektIndex ? { ...o, einheiten: [...o.einheiten, createEmptyEinheit()] } : o
      ),
    }));
  };

  const removeEinheit = (objektIndex: number, einheitIndex: number) => {
    const objekt = formData.objekte[objektIndex];
    if (objekt.einheiten.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      objekte: prev.objekte.map((o, i) =>
        i === objektIndex ? { ...o, einheiten: o.einheiten.filter((_, ei) => ei !== einheitIndex) } : o
      ),
    }));
  };

  // =====================================================
  // SUBMIT & TEST DATA
  // =====================================================

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

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Speichern');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  };

  const fillTestDataAndSubmit = async () => {
    const testData: FormData = {
      name: 'Müller Immobilien GmbH',
      ansprechpartner: 'Thomas Müller',
      position: 'Geschäftsführer',
      email: `test${Date.now()}@example.com`,
      telefon: '+49 89 123456789',
      createAnkaufsprofil: true,
      ankaufsprofil: {
        name: 'Core-Portfolio Bayern',
        kaufinteresse_aktiv: true,
        assetklassen: ['MFH', 'Wohn- & Geschäftshaus'],
        regionen: 'München, Augsburg, Nürnberg, Regensburg',
        lagepraeferenz: ['A-Lage', 'B-Lage', 'Metropolregion'],
        min_volumen: '1000000',
        max_volumen: '15000000',
        kaufpreisfaktor: '22',
        rendite_min: '3.5',
        rendite_soll: '5',
        finanzierungsform: 'Standard-Finanzierung',
        zustand: ['Teilsaniert', 'Vollsaniert'],
        baujahr_von: '1960',
        baujahr_bis: '2010',
        min_wohnflaeche: '500',
        min_gewerbeflaeche: '',
        min_wohneinheiten: '6',
        min_gewerbeeinheiten: '',
        min_grundstueck: '',
        ausgeschlossene_partner: false,
        ausgeschlossene_partner_liste: '',
        sonstiges: 'Bevorzugt mit Aufteilungspotenzial',
        weitere_projektarten: 'ESG-Sanierung',
      },
      objekte: [
        {
          strasse: 'Leopoldstraße 42',
          plz: '80802',
          ort: 'München',
          gebaeudetyp: 'MFH',
          baujahr: '1985',
          kaufpreis: '2500000',
          kaufdatum: '2024-01-15',
          eigenkapital_prozent: '30',
          zinssatz: '3.8',
          tilgung: '2',
          instandhaltung: '8000',
          verwaltung: '4800',
          einheiten: [
            { nutzung: 'Wohnen', flaeche: '75', kaltmiete: '850', vergleichsmiete: '14', mietvertragsart: 'Standard', vertragsbeginn: '2020-01-01', letzte_mieterhoehung: '2023-06-01', hoehe_mieterhoehung: '50', datum_558: '', hoehe_558: '', datum_559: '', art_modernisierung_559: '', hoehe_559: '' },
            { nutzung: 'Wohnen', flaeche: '65', kaltmiete: '720', vergleichsmiete: '14', mietvertragsart: 'Standard', vertragsbeginn: '2019-03-01', letzte_mieterhoehung: '', hoehe_mieterhoehung: '', datum_558: '', hoehe_558: '', datum_559: '', art_modernisierung_559: '', hoehe_559: '' },
            { nutzung: 'Wohnen', flaeche: '80', kaltmiete: '950', vergleichsmiete: '14', mietvertragsart: 'Index', vertragsbeginn: '2021-07-01', letzte_mieterhoehung: '', hoehe_mieterhoehung: '', datum_558: '', hoehe_558: '', datum_559: '', art_modernisierung_559: '', hoehe_559: '' },
            { nutzung: 'Stellplatz', flaeche: '12', kaltmiete: '80', vergleichsmiete: '80', mietvertragsart: 'Standard', vertragsbeginn: '', letzte_mieterhoehung: '', hoehe_mieterhoehung: '', datum_558: '', hoehe_558: '', datum_559: '', art_modernisierung_559: '', hoehe_559: '' },
          ],
        },
      ],
    };

    setFormData(testData);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Speichern');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CALCULATIONS
  // =====================================================

  const getTotalStats = () => {
    let totalObjekte = formData.objekte.length;
    let totalEinheiten = 0;
    let totalFlaeche = 0;
    let totalMiete = 0;
    let totalKaufpreis = 0;

    formData.objekte.forEach((o) => {
      totalKaufpreis += parseFloat(o.kaufpreis) || 0;
      o.einheiten.forEach((e) => {
        totalEinheiten++;
        totalFlaeche += parseFloat(e.flaeche) || 0;
        totalMiete += parseFloat(e.kaltmiete) || 0;
      });
    });

    return { totalObjekte, totalEinheiten, totalFlaeche, totalMiete, totalKaufpreis };
  };

  const getObjektStats = (objekt: Objekt) => {
    let totalFlaeche = 0;
    let totalMiete = 0;
    objekt.einheiten.forEach((e) => {
      totalFlaeche += parseFloat(e.flaeche) || 0;
      totalMiete += parseFloat(e.kaltmiete) || 0;
    });
    return { totalFlaeche, totalMiete };
  };

  const stats = getTotalStats();

  // Determine which content step we're showing
  const getContentStep = () => {
    if (formData.createAnkaufsprofil) {
      return step; // 1=Kontakt, 2=Ankaufsprofil, 3=Objekte, 4=Übersicht
    }
    // Map to content: 1=Kontakt, 2=Objekte, 3=Übersicht
    if (step === 1) return 1;
    if (step === 2) return 3; // Objekte
    return 4; // Übersicht
  };

  const contentStep = getContentStep();

  // =====================================================
  // SUCCESS STATE
  // =====================================================

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #1E2A3A 0%, #2A3F54 50%, #3D5167 100%)' }}>
        <div className="glass-card rounded-2xl p-8 max-w-lg text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#5B7A9D' }}>
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-4" style={{ color: '#1E2A3A' }}>Vielen Dank!</h1>
          <p className="text-slate-600 mb-6">
            Ihre Daten wurden erfolgreich übermittelt. Wir werden Ihre {stats.totalObjekte} Objekte analysieren und uns in Kürze bei Ihnen melden.
            {formData.createAnkaufsprofil && ' Ihr Ankaufsprofil wurde ebenfalls erstellt.'}
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 text-white rounded-lg transition-colors"
            style={{ backgroundColor: '#5B7A9D' }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4A6A8D'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#5B7A9D'}
          >
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
          <Image
            src="/logo_imperoyal.png"
            alt="Imperoyal Immobilien"
            width={160}
            height={48}
            className="h-8 sm:h-10 w-auto brightness-0 invert"
            priority
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fillTestDataAndSubmit}
              disabled={loading}
              className="px-3 py-1.5 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Wird gesendet...' : 'Testdaten + Ankaufsprofil'}
            </button>
            <span className="text-white/70 text-sm hidden sm:block">Objekt-Onboarding</span>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-4 mb-4 sm:mb-6">
        <div className="sm:hidden mb-4">
          <div className="flex justify-between text-white text-sm mb-2">
            <span>Schritt {step} von {maxStep}</span>
            <span>{STEPS[step - 1]?.title}</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full transition-all duration-300" style={{ width: `${(step / maxStep) * 100}%`, backgroundColor: COLORS.growthBlue.base }} />
          </div>
        </div>
        <div className="hidden sm:flex items-center justify-between">
          {STEPS.map((s, idx) => (
            <div key={s.id} className="flex items-center">
              <div
                className="flex items-center justify-center w-10 h-10 rounded-full transition-colors"
                style={step >= s.id ? { backgroundColor: COLORS.growthBlue.base, color: 'white' } : { backgroundColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.5)' }}
              >
                <s.icon className="w-5 h-5" />
              </div>
              <span className="ml-2 text-sm" style={{ color: step >= s.id ? 'white' : 'rgba(255,255,255,0.5)' }}>{s.title}</span>
              {idx < STEPS.length - 1 && (
                <div className="w-16 h-0.5 mx-3 transition-colors" style={{ backgroundColor: step > s.id ? COLORS.growthBlue.base : 'rgba(255,255,255,0.2)' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Card */}
      <div className="max-w-4xl mx-auto px-4 pb-6">
        <div className="glass-card rounded-2xl p-4 sm:p-6">
          {/* =====================================================
              STEP 1: KONTAKTDATEN
              ===================================================== */}
          {contentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[#1E2A3A] mb-4">1. Ihre Kontaktdaten</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Firmenname / Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateMandantField('name', e.target.value)}
                    className="glass-input w-full px-3 py-2.5 rounded-lg text-base"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ansprechpartner *</label>
                  <input
                    type="text"
                    value={formData.ansprechpartner}
                    onChange={(e) => updateMandantField('ansprechpartner', e.target.value)}
                    className="glass-input w-full px-3 py-2.5 rounded-lg text-base"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Position</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => updateMandantField('position', e.target.value)}
                    className="glass-input w-full px-3 py-2.5 rounded-lg text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">E-Mail *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateMandantField('email', e.target.value)}
                    className="glass-input w-full px-3 py-2.5 rounded-lg text-base"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
                  <input
                    type="tel"
                    value={formData.telefon}
                    onChange={(e) => updateMandantField('telefon', e.target.value)}
                    className="glass-input w-full px-3 py-2.5 rounded-lg text-base"
                  />
                </div>
              </div>

              {/* Ankaufsprofil Toggle */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <label
                  className="flex items-center gap-3 cursor-pointer p-4 rounded-lg transition-colors"
                  style={{ backgroundColor: COLORS.blueBone.lightest }}
                >
                  <input
                    type="checkbox"
                    checked={formData.createAnkaufsprofil}
                    onChange={(e) => setFormData((prev) => ({ ...prev, createAnkaufsprofil: e.target.checked }))}
                    className="w-5 h-5 rounded border-slate-300"
                    style={{ accentColor: COLORS.growthBlue.base }}
                  />
                  <div>
                    <span className="font-medium" style={{ color: COLORS.royalNavy.dark }}>Ankaufsprofil erstellen</span>
                    <p className="text-sm text-slate-600">
                      Erstellen Sie ein Ankaufsprofil, um passende Objekte von uns zu erhalten
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* =====================================================
              STEP 2: ANKAUFSPROFIL (nur wenn aktiviert)
              ===================================================== */}
          {contentStep === 2 && formData.createAnkaufsprofil && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-[#1E2A3A] mb-4">2. Ihr Ankaufsprofil</h2>

              {/* 2.1 Allgemeine Ankaufsparameter */}
              <div className="border border-slate-200 rounded-lg p-4">
                <h3 className="font-semibold text-slate-700 mb-4">2.1 Allgemeine Ankaufsparameter</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Profilname</label>
                    <input
                      type="text"
                      value={formData.ankaufsprofil.name}
                      onChange={(e) => updateAnkaufsprofilField('name', e.target.value)}
                      className="glass-input w-full px-3 py-2 rounded-lg text-sm"
                      placeholder="z.B. Core-Portfolio Deutschland"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-slate-700">Kaufinteresse aktiv?</label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.ankaufsprofil.kaufinteresse_aktiv === true}
                        onChange={() => updateAnkaufsprofilField('kaufinteresse_aktiv', true)}
                        className="w-4 h-4" style={{ accentColor: COLORS.growthBlue.base }}
                      />
                      <span className="text-sm">Ja</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.ankaufsprofil.kaufinteresse_aktiv === false}
                        onChange={() => updateAnkaufsprofilField('kaufinteresse_aktiv', false)}
                        className="w-4 h-4" style={{ accentColor: COLORS.growthBlue.base }}
                      />
                      <span className="text-sm">Nein</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Bevorzugte Assetklassen</label>
                    <MultiSelectChips
                      options={ASSETKLASSEN}
                      selected={formData.ankaufsprofil.assetklassen}
                      onChange={(selected) => updateAnkaufsprofilField('assetklassen', selected)}
                    />
                  </div>
                </div>
              </div>

              {/* 2.2 Standortprofil */}
              <div className="border border-slate-200 rounded-lg p-4">
                <h3 className="font-semibold text-slate-700 mb-4">2.2 Standortprofil</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Bevorzugte Städte/Regionen</label>
                    <textarea
                      value={formData.ankaufsprofil.regionen}
                      onChange={(e) => updateAnkaufsprofilField('regionen', e.target.value)}
                      className="glass-input w-full px-3 py-2 rounded-lg text-sm"
                      rows={2}
                      placeholder="z.B. München, Berlin, Hamburg, Rhein-Main-Gebiet..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Lagepräferenz</label>
                    <MultiSelectChips
                      options={LAGEPRAEFERENZEN}
                      selected={formData.ankaufsprofil.lagepraeferenz}
                      onChange={(selected) => updateAnkaufsprofilField('lagepraeferenz', selected)}
                    />
                  </div>
                </div>
              </div>

              {/* 2.3 Finanzielle Ankaufsparameter */}
              <div className="border border-slate-200 rounded-lg p-4">
                <h3 className="font-semibold text-slate-700 mb-4">2.3 Finanzielle Ankaufsparameter</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mindestinvestitionsvolumen (EUR)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formData.ankaufsprofil.min_volumen}
                      onChange={(e) => updateAnkaufsprofilField('min_volumen', e.target.value)}
                      className="glass-input w-full px-3 py-2 rounded-lg text-sm"
                      placeholder="z.B. 1000000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Maximalvolumen (EUR)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formData.ankaufsprofil.max_volumen}
                      onChange={(e) => updateAnkaufsprofilField('max_volumen', e.target.value)}
                      className="glass-input w-full px-3 py-2 rounded-lg text-sm"
                      placeholder="z.B. 10000000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Bevorzugter Kaufpreisfaktor</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={formData.ankaufsprofil.kaufpreisfaktor}
                      onChange={(e) => updateAnkaufsprofilField('kaufpreisfaktor', e.target.value)}
                      className="glass-input w-full px-3 py-2 rounded-lg text-sm"
                      placeholder="z.B. 20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Finanzierungsform</label>
                    <select
                      value={formData.ankaufsprofil.finanzierungsform}
                      onChange={(e) => updateAnkaufsprofilField('finanzierungsform', e.target.value)}
                      className="glass-input w-full px-3 py-2 rounded-lg text-sm"
                    >
                      <option value="">Bitte wählen...</option>
                      {FINANZIERUNGSFORMEN.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Zielrendite IST (%)</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={formData.ankaufsprofil.rendite_min}
                      onChange={(e) => updateAnkaufsprofilField('rendite_min', e.target.value)}
                      className="glass-input w-full px-3 py-2 rounded-lg text-sm"
                      placeholder="z.B. 4.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Zielrendite SOLL (%)</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={formData.ankaufsprofil.rendite_soll}
                      onChange={(e) => updateAnkaufsprofilField('rendite_soll', e.target.value)}
                      className="glass-input w-full px-3 py-2 rounded-lg text-sm"
                      placeholder="z.B. 5.5"
                    />
                  </div>
                </div>
              </div>

              {/* 2.4 Objektspezifische Kriterien */}
              <div className="border border-slate-200 rounded-lg p-4">
                <h3 className="font-semibold text-slate-700 mb-4">2.4 Objektspezifische Kriterien</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Zustand</label>
                    <MultiSelectChips
                      options={ZUSTAENDE}
                      selected={formData.ankaufsprofil.zustand}
                      onChange={(selected) => updateAnkaufsprofilField('zustand', selected)}
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Baujahr von</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formData.ankaufsprofil.baujahr_von}
                        onChange={(e) => updateAnkaufsprofilField('baujahr_von', e.target.value)}
                        className="glass-input w-full px-3 py-2 rounded-lg text-sm"
                        placeholder="1950"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Baujahr bis</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formData.ankaufsprofil.baujahr_bis}
                        onChange={(e) => updateAnkaufsprofilField('baujahr_bis', e.target.value)}
                        className="glass-input w-full px-3 py-2 rounded-lg text-sm"
                        placeholder="2020"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Min. Wohnfläche m²</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formData.ankaufsprofil.min_wohnflaeche}
                        onChange={(e) => updateAnkaufsprofilField('min_wohnflaeche', e.target.value)}
                        className="glass-input w-full px-3 py-2 rounded-lg text-sm"
                        placeholder="500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Min. Gewerbefläche m²</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formData.ankaufsprofil.min_gewerbeflaeche}
                        onChange={(e) => updateAnkaufsprofilField('min_gewerbeflaeche', e.target.value)}
                        className="glass-input w-full px-3 py-2 rounded-lg text-sm"
                        placeholder="200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Min. Wohneinheiten</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formData.ankaufsprofil.min_wohneinheiten}
                        onChange={(e) => updateAnkaufsprofilField('min_wohneinheiten', e.target.value)}
                        className="glass-input w-full px-3 py-2 rounded-lg text-sm"
                        placeholder="6"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Min. Gewerbeeinheiten</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formData.ankaufsprofil.min_gewerbeeinheiten}
                        onChange={(e) => updateAnkaufsprofilField('min_gewerbeeinheiten', e.target.value)}
                        className="glass-input w-full px-3 py-2 rounded-lg text-sm"
                        placeholder="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Min. Grundstück m²</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formData.ankaufsprofil.min_grundstueck}
                        onChange={(e) => updateAnkaufsprofilField('min_grundstueck', e.target.value)}
                        className="glass-input w-full px-3 py-2 rounded-lg text-sm"
                        placeholder="1000"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2.5 Zusätzliche Angaben */}
              <div className="border border-slate-200 rounded-lg p-4">
                <h3 className="font-semibold text-slate-700 mb-4">2.5 Zusätzliche Angaben</h3>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-4 mb-2">
                      <label className="text-sm font-medium text-slate-700">Ausgeschlossene Partner / Makler?</label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={formData.ankaufsprofil.ausgeschlossene_partner === true}
                          onChange={() => updateAnkaufsprofilField('ausgeschlossene_partner', true)}
                          className="w-4 h-4" style={{ accentColor: COLORS.growthBlue.base }}
                        />
                        <span className="text-sm">Ja</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={formData.ankaufsprofil.ausgeschlossene_partner === false}
                          onChange={() => updateAnkaufsprofilField('ausgeschlossene_partner', false)}
                          className="w-4 h-4" style={{ accentColor: COLORS.growthBlue.base }}
                        />
                        <span className="text-sm">Nein</span>
                      </label>
                    </div>
                    {formData.ankaufsprofil.ausgeschlossene_partner && (
                      <textarea
                        value={formData.ankaufsprofil.ausgeschlossene_partner_liste}
                        onChange={(e) => updateAnkaufsprofilField('ausgeschlossene_partner_liste', e.target.value)}
                        className="glass-input w-full px-3 py-2 rounded-lg text-sm"
                        rows={2}
                        placeholder="Namen der ausgeschlossenen Partner/Makler..."
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Besondere Bedingungen / Präferenzen</label>
                    <textarea
                      value={formData.ankaufsprofil.sonstiges}
                      onChange={(e) => updateAnkaufsprofilField('sonstiges', e.target.value)}
                      className="glass-input w-full px-3 py-2 rounded-lg text-sm"
                      rows={3}
                      placeholder="Weitere Kriterien oder Anmerkungen..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Weitere Projektarten (ESG, CO₂, Redevelopment etc.)</label>
                    <input
                      type="text"
                      value={formData.ankaufsprofil.weitere_projektarten}
                      onChange={(e) => updateAnkaufsprofilField('weitere_projektarten', e.target.value)}
                      className="glass-input w-full px-3 py-2 rounded-lg text-sm"
                      placeholder="z.B. ESG-Sanierung, CO₂-Reduzierung..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================
              STEP 3: OBJEKTE & EINHEITEN
              ===================================================== */}
          {contentStep === 3 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-[#1E2A3A]">{formData.createAnkaufsprofil ? '3' : '2'}. Ihre Objekte</h2>
                <button
                  type="button"
                  onClick={addObjekt}
                  className="flex items-center gap-1 px-3 py-1.5 text-white rounded-lg text-sm transition-colors"
                  style={{ backgroundColor: COLORS.growthBlue.base }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = COLORS.growthBlue.dark}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = COLORS.growthBlue.base}
                >
                  <Plus className="w-4 h-4" />
                  Objekt hinzufügen
                </button>
              </div>

              {/* Global Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg text-sm" style={{ backgroundColor: COLORS.blueBone.lightest }}>
                <div>
                  <span className="text-slate-600">Objekte:</span>
                  <span className="font-bold ml-2">{stats.totalObjekte}</span>
                </div>
                <div>
                  <span className="text-slate-600">Einheiten:</span>
                  <span className="font-bold ml-2">{stats.totalEinheiten}</span>
                </div>
                <div>
                  <span className="text-slate-600">Fläche:</span>
                  <span className="font-bold ml-2">{stats.totalFlaeche.toFixed(0)} m²</span>
                </div>
                <div>
                  <span className="text-slate-600">Miete/Mon:</span>
                  <span className="font-bold ml-2 text-green-600">{stats.totalMiete.toFixed(0)} €</span>
                </div>
              </div>

              {/* Objekte List */}
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {formData.objekte.map((objekt, objektIndex) => {
                  const isObjektExpanded = expandedObjekte.has(objektIndex);
                  const objektStats = getObjektStats(objekt);

                  return (
                    <div key={objektIndex} className="border border-slate-200 rounded-lg bg-white/50">
                      {/* Objekt Header */}
                      <div
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50"
                        onClick={() => toggleObjektExpanded(objektIndex)}
                      >
                        <div className="flex items-center gap-3">
                          {isObjektExpanded ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                          <div>
                            <h3 className="font-semibold text-[#1E2A3A]">
                              Objekt {objektIndex + 1}
                              {objekt.strasse && ` – ${objekt.strasse}`}
                              {objekt.ort && `, ${objekt.ort}`}
                            </h3>
                            <p className="text-sm text-slate-500">
                              {objekt.einheiten.length} Einheiten · {objektStats.totalFlaeche.toFixed(0)} m² · {objektStats.totalMiete.toFixed(0)} €/Mon
                            </p>
                          </div>
                        </div>
                        {formData.objekte.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeObjekt(objektIndex);
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Objekt Content (expanded) */}
                      {isObjektExpanded && (
                        <div className="p-4 pt-0 border-t border-slate-200">
                          {/* Objekt Grunddaten */}
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-slate-600 mb-3">Objektdaten</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-xs text-slate-600 mb-1">Straße *</label>
                                <input
                                  type="text"
                                  value={objekt.strasse}
                                  onChange={(e) => updateObjektField(objektIndex, 'strasse', e.target.value)}
                                  className="glass-input w-full px-2 py-2 rounded text-sm"
                                  placeholder="Musterstraße 1"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-slate-600 mb-1">PLZ *</label>
                                <input
                                  type="text"
                                  value={objekt.plz}
                                  onChange={(e) => updateObjektField(objektIndex, 'plz', e.target.value)}
                                  className="glass-input w-full px-2 py-2 rounded text-sm"
                                  placeholder="80000"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-slate-600 mb-1">Ort *</label>
                                <input
                                  type="text"
                                  value={objekt.ort}
                                  onChange={(e) => updateObjektField(objektIndex, 'ort', e.target.value)}
                                  className="glass-input w-full px-2 py-2 rounded text-sm"
                                  placeholder="München"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-slate-600 mb-1">Gebäudetyp</label>
                                <select
                                  value={objekt.gebaeudetyp}
                                  onChange={(e) => updateObjektField(objektIndex, 'gebaeudetyp', e.target.value)}
                                  className="glass-input w-full px-2 py-2 rounded text-sm"
                                >
                                  {GEBAEUDETYPEN.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs text-slate-600 mb-1">Baujahr</label>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={objekt.baujahr}
                                  onChange={(e) => updateObjektField(objektIndex, 'baujahr', e.target.value)}
                                  className="glass-input w-full px-2 py-2 rounded text-sm"
                                  placeholder="1985"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-slate-600 mb-1">Kaufpreis € *</label>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={objekt.kaufpreis}
                                  onChange={(e) => updateObjektField(objektIndex, 'kaufpreis', e.target.value)}
                                  className="glass-input w-full px-2 py-2 rounded text-sm"
                                  placeholder="2500000"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Finanzierung */}
                          <div className="mb-4 pt-4 border-t border-slate-200">
                            <h4 className="text-sm font-medium text-slate-600 mb-3">Finanzierung & Kosten</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              <div>
                                <label className="block text-xs text-slate-600 mb-1">EK %</label>
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  value={objekt.eigenkapital_prozent}
                                  onChange={(e) => updateObjektField(objektIndex, 'eigenkapital_prozent', e.target.value)}
                                  className="glass-input w-full px-2 py-2 rounded text-sm"
                                  placeholder="30"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-slate-600 mb-1">Zins %</label>
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  value={objekt.zinssatz}
                                  onChange={(e) => updateObjektField(objektIndex, 'zinssatz', e.target.value)}
                                  className="glass-input w-full px-2 py-2 rounded text-sm"
                                  placeholder="3.8"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-slate-600 mb-1">Tilgung %</label>
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  value={objekt.tilgung}
                                  onChange={(e) => updateObjektField(objektIndex, 'tilgung', e.target.value)}
                                  className="glass-input w-full px-2 py-2 rounded text-sm"
                                  placeholder="2"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-slate-600 mb-1">Kaufdatum</label>
                                <input
                                  type="date"
                                  value={objekt.kaufdatum}
                                  onChange={(e) => updateObjektField(objektIndex, 'kaufdatum', e.target.value)}
                                  className="glass-input w-full px-2 py-2 rounded text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-slate-600 mb-1">Instandhaltung €/J</label>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={objekt.instandhaltung}
                                  onChange={(e) => updateObjektField(objektIndex, 'instandhaltung', e.target.value)}
                                  className="glass-input w-full px-2 py-2 rounded text-sm"
                                  placeholder="8000"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-slate-600 mb-1">Verwaltung €/J</label>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={objekt.verwaltung}
                                  onChange={(e) => updateObjektField(objektIndex, 'verwaltung', e.target.value)}
                                  className="glass-input w-full px-2 py-2 rounded text-sm"
                                  placeholder="4800"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Einheiten */}
                          <div className="pt-4 border-t border-slate-200">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="text-sm font-medium text-slate-600">Einheiten ({objekt.einheiten.length})</h4>
                              <button
                                type="button"
                                onClick={() => addEinheit(objektIndex)}
                                className="flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs hover:bg-slate-200"
                              >
                                <Plus className="w-3 h-3" />
                                Einheit
                              </button>
                            </div>

                            <div className="space-y-2">
                              {objekt.einheiten.map((einheit, einheitIndex) => {
                                const einheitKey = `${objektIndex}-${einheitIndex}`;
                                const isEinheitExpanded = expandedEinheiten.has(einheitKey);

                                return (
                                  <div key={einheitIndex} className="bg-slate-50 rounded-lg p-3">
                                    {/* Einheit Header */}
                                    <div className="flex items-center justify-between mb-2">
                                      <button
                                        type="button"
                                        onClick={() => toggleEinheitExpanded(objektIndex, einheitIndex)}
                                        className="flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-[#1E2A3A]"
                                      >
                                        {isEinheitExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                        Einheit {einheitIndex + 1} ({einheit.nutzung})
                                      </button>
                                      {objekt.einheiten.length > 1 && (
                                        <button
                                          type="button"
                                          onClick={() => removeEinheit(objektIndex, einheitIndex)}
                                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>

                                    {/* Basis-Felder */}
                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                      <div>
                                        <label className="block text-xs text-slate-500 mb-1">Nutzung</label>
                                        <select
                                          value={einheit.nutzung}
                                          onChange={(e) => updateEinheitField(objektIndex, einheitIndex, 'nutzung', e.target.value)}
                                          className="glass-input w-full px-2 py-1.5 rounded text-xs"
                                        >
                                          <option value="Wohnen">Wohnen</option>
                                          <option value="Gewerbe">Gewerbe</option>
                                          <option value="Stellplatz">Stellplatz</option>
                                        </select>
                                      </div>
                                      <div>
                                        <label className="block text-xs text-slate-500 mb-1">m²</label>
                                        <input
                                          type="text"
                                          inputMode="decimal"
                                          value={einheit.flaeche}
                                          onChange={(e) => updateEinheitField(objektIndex, einheitIndex, 'flaeche', e.target.value)}
                                          className="glass-input w-full px-2 py-1.5 rounded text-xs"
                                          placeholder="75"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs text-slate-500 mb-1">Miete €</label>
                                        <input
                                          type="text"
                                          inputMode="decimal"
                                          value={einheit.kaltmiete}
                                          onChange={(e) => updateEinheitField(objektIndex, einheitIndex, 'kaltmiete', e.target.value)}
                                          className="glass-input w-full px-2 py-1.5 rounded text-xs"
                                          placeholder="850"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs text-slate-500 mb-1">Markt €/m²</label>
                                        <input
                                          type="text"
                                          inputMode="decimal"
                                          value={einheit.vergleichsmiete}
                                          onChange={(e) => updateEinheitField(objektIndex, einheitIndex, 'vergleichsmiete', e.target.value)}
                                          className="glass-input w-full px-2 py-1.5 rounded text-xs"
                                          placeholder="14"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs text-slate-500 mb-1">Vertrag</label>
                                        <select
                                          value={einheit.mietvertragsart}
                                          onChange={(e) => updateEinheitField(objektIndex, einheitIndex, 'mietvertragsart', e.target.value)}
                                          className="glass-input w-full px-2 py-1.5 rounded text-xs"
                                        >
                                          <option value="Standard">Standard</option>
                                          <option value="Index">Index</option>
                                          <option value="Staffel">Staffel</option>
                                        </select>
                                      </div>
                                    </div>

                                    {/* Erweiterte Felder */}
                                    {isEinheitExpanded && (
                                      <>
                                        <div className="mt-3 pt-3 border-t border-slate-200">
                                          <p className="text-xs text-slate-500 mb-2">Vertragsdaten</p>
                                          <div className="grid grid-cols-3 gap-2">
                                            <div>
                                              <label className="block text-xs text-slate-500 mb-1">Beginn</label>
                                              <input
                                                type="date"
                                                value={einheit.vertragsbeginn}
                                                onChange={(e) => updateEinheitField(objektIndex, einheitIndex, 'vertragsbeginn', e.target.value)}
                                                className="glass-input w-full px-2 py-1.5 rounded text-xs"
                                              />
                                            </div>
                                            <div>
                                              <label className="block text-xs text-slate-500 mb-1">Letzte Erhöhung</label>
                                              <input
                                                type="date"
                                                value={einheit.letzte_mieterhoehung}
                                                onChange={(e) => updateEinheitField(objektIndex, einheitIndex, 'letzte_mieterhoehung', e.target.value)}
                                                className="glass-input w-full px-2 py-2 rounded text-xs"
                                              />
                                            </div>
                                            <div>
                                              <label className="block text-xs text-slate-500 mb-1">Höhe €</label>
                                              <input
                                                type="text"
                                                inputMode="decimal"
                                                value={einheit.hoehe_mieterhoehung}
                                                onChange={(e) => updateEinheitField(objektIndex, einheitIndex, 'hoehe_mieterhoehung', e.target.value)}
                                                className="glass-input w-full px-2 py-1.5 rounded text-xs"
                                                placeholder="50"
                                              />
                                            </div>
                                          </div>
                                        </div>

                                        <div className="mt-3 pt-3 border-t border-slate-200">
                                          <p className="text-xs text-slate-500 mb-2">§558 / §559 BGB</p>
                                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            <div>
                                              <label className="block text-xs text-slate-500 mb-1">§558 Datum</label>
                                              <input
                                                type="date"
                                                value={einheit.datum_558}
                                                onChange={(e) => updateEinheitField(objektIndex, einheitIndex, 'datum_558', e.target.value)}
                                                className="glass-input w-full px-2 py-1.5 rounded text-xs"
                                              />
                                            </div>
                                            <div>
                                              <label className="block text-xs text-slate-500 mb-1">§558 €</label>
                                              <input
                                                type="text"
                                                inputMode="decimal"
                                                value={einheit.hoehe_558}
                                                onChange={(e) => updateEinheitField(objektIndex, einheitIndex, 'hoehe_558', e.target.value)}
                                                className="glass-input w-full px-2 py-1.5 rounded text-xs"
                                              />
                                            </div>
                                            <div>
                                              <label className="block text-xs text-slate-500 mb-1">§559 Datum</label>
                                              <input
                                                type="date"
                                                value={einheit.datum_559}
                                                onChange={(e) => updateEinheitField(objektIndex, einheitIndex, 'datum_559', e.target.value)}
                                                className="glass-input w-full px-2 py-1.5 rounded text-xs"
                                              />
                                            </div>
                                            <div>
                                              <label className="block text-xs text-slate-500 mb-1">§559 €/Mon</label>
                                              <input
                                                type="text"
                                                inputMode="decimal"
                                                value={einheit.hoehe_559}
                                                onChange={(e) => updateEinheitField(objektIndex, einheitIndex, 'hoehe_559', e.target.value)}
                                                className="glass-input w-full px-2 py-1.5 rounded text-xs"
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* =====================================================
              STEP 4: ÜBERSICHT
              ===================================================== */}
          {contentStep === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[#1E2A3A] mb-4">{formData.createAnkaufsprofil ? '4' : '3'}. Übersicht & Absenden</h2>

              {/* Mandant Info */}
              <div className="p-4 bg-slate-50 rounded-lg">
                <h3 className="font-semibold text-[#1E2A3A] mb-2">Kontaktdaten</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-slate-500">Firma:</span> {formData.name}</div>
                  <div><span className="text-slate-500">Ansprechpartner:</span> {formData.ansprechpartner}</div>
                  <div><span className="text-slate-500">E-Mail:</span> {formData.email}</div>
                  <div><span className="text-slate-500">Telefon:</span> {formData.telefon || '-'}</div>
                </div>
              </div>

              {/* Ankaufsprofil Summary */}
              {formData.createAnkaufsprofil && (
                <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.blueBone.light }}>
                  <h3 className="font-semibold text-[#1E2A3A] mb-2">Ankaufsprofil: {formData.ankaufsprofil.name}</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-slate-500">Kaufinteresse:</span> {formData.ankaufsprofil.kaufinteresse_aktiv ? 'Aktiv' : 'Inaktiv'}</div>
                    <div><span className="text-slate-500">Assetklassen:</span> {formData.ankaufsprofil.assetklassen.join(', ') || '-'}</div>
                    <div><span className="text-slate-500">Regionen:</span> {formData.ankaufsprofil.regionen || '-'}</div>
                    <div><span className="text-slate-500">Volumen:</span> {formData.ankaufsprofil.min_volumen && formData.ankaufsprofil.max_volumen ? `${parseInt(formData.ankaufsprofil.min_volumen).toLocaleString('de-DE')} - ${parseInt(formData.ankaufsprofil.max_volumen).toLocaleString('de-DE')} €` : '-'}</div>
                  </div>
                </div>
              )}

              {/* Objekte Summary */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.blueBone.lightest }}>
                <h3 className="font-semibold text-[#1E2A3A] mb-3">Portfolio-Übersicht</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
                  <div>
                    <div className="text-slate-500">Objekte</div>
                    <div className="text-2xl font-bold text-[#1E2A3A]">{stats.totalObjekte}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Einheiten</div>
                    <div className="text-2xl font-bold text-[#1E2A3A]">{stats.totalEinheiten}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Gesamtfläche</div>
                    <div className="text-2xl font-bold text-[#1E2A3A]">{stats.totalFlaeche.toLocaleString('de-DE')} m²</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Jahresmiete</div>
                    <div className="text-2xl font-bold text-green-600">{(stats.totalMiete * 12).toLocaleString('de-DE')} €</div>
                  </div>
                </div>

                {/* Per-Object Summary */}
                <div className="space-y-2">
                  {formData.objekte.map((objekt, idx) => {
                    const os = getObjektStats(objekt);
                    return (
                      <div key={idx} className="flex justify-between items-center p-2 bg-white rounded text-sm">
                        <div>
                          <span className="font-medium">{objekt.strasse || `Objekt ${idx + 1}`}</span>
                          <span className="text-slate-500 ml-2">{objekt.ort}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-600">{objekt.einheiten.length} Einh.</span>
                          <span className="text-slate-400 mx-2">·</span>
                          <span className="text-green-600 font-medium">{os.totalMiete.toLocaleString('de-DE')} €/Mon</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <p className="text-sm text-slate-600">
                Nach dem Absenden erhalten Sie per E-Mail Ihre Zugangsdaten zum Portal.
                Wir analysieren Ihre Objekte und benachrichtigen Sie, sobald die Auswertungen bereit sind.
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>
          )}

          {/* Navigation Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 mt-6 sm:mt-8 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className="flex items-center justify-center gap-2 px-6 py-3 text-slate-600 hover:text-[#1E2A3A] hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Zurück
            </button>
            {step < maxStep ? (
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(maxStep, s + 1))}
                className="flex items-center justify-center gap-2 px-6 py-3.5 text-white rounded-lg transition-colors font-medium"
                style={{ backgroundColor: COLORS.growthBlue.base }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = COLORS.growthBlue.dark}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = COLORS.growthBlue.base}
              >
                Weiter
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-8 py-3.5 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
                style={{ backgroundColor: COLORS.growthBlue.base }}
                onMouseOver={(e) => !loading && (e.currentTarget.style.backgroundColor = COLORS.growthBlue.dark)}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = COLORS.growthBlue.base}
              >
                {loading ? 'Wird gesendet...' : 'Absenden'}
                <CheckCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
