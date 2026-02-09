'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CheckCircle, ArrowRight, ArrowLeft, Building2, User, MapPin, Euro, Settings } from 'lucide-react';

type FormData = {
  // Mandanteninformationen
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
  // Ankaufsprofil - Allgemein
  kaufinteresse_aktiv: boolean;
  assetklassen: string[];
  // Standortprofil
  regionen: string;
  lagepraeferenz: string[];
  // Finanzielle Parameter
  min_volumen: string;
  max_volumen: string;
  kaufpreisfaktor: string;
  zielrendite_ist: string;
  zielrendite_soll: string;
  finanzierungsform: string;
  // Objektspezifische Kriterien
  zustand: string[];
  baujahr_von: string;
  baujahr_bis: string;
  min_wohnflaeche: string;
  min_gewerbeflaeche: string;
  min_wohneinheiten: string;
  min_gewerbeeinheiten: string;
  min_grundstueck: string;
  // Zusätzliche Angaben
  ausgeschlossene_partner: boolean;
  partner_liste: string;
  besondere_bedingungen: string;
  weitere_projektarten: string;
};

const STEPS = [
  { id: 1, title: 'Kontaktdaten', icon: User },
  { id: 2, title: 'Ankaufsprofil', icon: Building2 },
  { id: 3, title: 'Standort', icon: MapPin },
  { id: 4, title: 'Finanzen', icon: Euro },
  { id: 5, title: 'Kriterien', icon: Settings },
];

const ASSETKLASSEN = [
  'MFH',
  'Wohn- & Geschäftshaus',
  'Büro',
  'Logistik',
  'Retail',
  'Betreiberimmobilien',
  'Light Industrial',
  'Grundstücke',
  'Development',
];

const LAGEPRAEFERENZEN = [
  'A-Lage',
  'B-Lage',
  'C-Lage',
  'Metropolregion',
  'Universitätsstadt',
  'Wachstumsregion',
];

const ZUSTAND_OPTIONS = [
  'Sanierungsbedürftig',
  'Teilsaniert',
  'Vollsaniert',
  'Denkmal',
  'Revitalisierung möglich',
];

const FINANZIERUNGSFORMEN = [
  'Voll-EK',
  'EK-dominant',
  'Standard-Finanzierung',
  'Offen',
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    ansprechpartner: '',
    position: '',
    email: '',
    telefon: '',
    strasse: '',
    plz: '',
    ort: '',
    land: 'Deutschland',
    kontaktart: 'E-Mail',
    kaufinteresse_aktiv: true,
    assetklassen: [],
    regionen: '',
    lagepraeferenz: [],
    min_volumen: '',
    max_volumen: '',
    kaufpreisfaktor: '',
    zielrendite_ist: '',
    zielrendite_soll: '',
    finanzierungsform: 'Standard-Finanzierung',
    zustand: [],
    baujahr_von: '',
    baujahr_bis: '',
    min_wohnflaeche: '',
    min_gewerbeflaeche: '',
    min_wohneinheiten: '',
    min_gewerbeeinheiten: '',
    min_grundstueck: '',
    ausgeschlossene_partner: false,
    partner_liste: '',
    besondere_bedingungen: '',
    weitere_projektarten: '',
  });

  const updateField = (field: keyof FormData, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = (field: 'assetklassen' | 'lagepraeferenz' | 'zustand', value: string) => {
    setFormData((prev) => {
      const arr = prev[field];
      if (arr.includes(value)) {
        return { ...prev, [field]: arr.filter((v) => v !== value) };
      }
      return { ...prev, [field]: [...arr, value] };
    });
  };

  const fillTestData = () => {
    setFormData({
      name: 'Müller Immobilien GmbH',
      ansprechpartner: 'Thomas Müller',
      position: 'Geschäftsführer',
      email: `test${Date.now()}@example.com`,
      telefon: '+49 89 123456789',
      strasse: 'Maximilianstraße 35',
      plz: '80539',
      ort: 'München',
      land: 'Deutschland',
      kontaktart: 'Telefon',
      kaufinteresse_aktiv: true,
      assetklassen: ['MFH', 'Wohn- & Geschäftshaus', 'Büro'],
      regionen: 'München, Hamburg, Berlin, Frankfurt am Main, Rhein-Main-Gebiet',
      lagepraeferenz: ['A-Lage', 'B-Lage', 'Metropolregion'],
      min_volumen: '1000000',
      max_volumen: '10000000',
      kaufpreisfaktor: '22',
      zielrendite_ist: '4.5',
      zielrendite_soll: '6.0',
      finanzierungsform: 'Standard-Finanzierung',
      zustand: ['Teilsaniert', 'Vollsaniert'],
      baujahr_von: '1950',
      baujahr_bis: '2020',
      min_wohnflaeche: '500',
      min_gewerbeflaeche: '200',
      min_wohneinheiten: '6',
      min_gewerbeeinheiten: '2',
      min_grundstueck: '800',
      ausgeschlossene_partner: false,
      partner_liste: '',
      besondere_bedingungen: 'Bevorzugt Objekte mit Entwicklungspotenzial',
      weitere_projektarten: 'ESG-konforme Sanierungen, energetische Modernisierung',
    });
  };

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

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="glass-card rounded-2xl p-8 max-w-lg text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-4">
            Vielen Dank für Ihre Registrierung!
          </h1>
          <p className="text-slate-600 mb-6">
            Wir haben Ihre Daten erhalten und werden uns in Kürze bei Ihnen melden.
            Sie erhalten eine Bestätigung per E-Mail.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Zur Startseite
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
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
              onClick={fillTestData}
              className="px-3 py-1.5 text-xs bg-white/10 text-white/80 rounded hover:bg-white/20 transition-colors"
            >
              Testdaten einfügen
            </button>
            <span className="text-white/70 text-sm hidden sm:block">Mandanten-Onboarding</span>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-4 mb-4 sm:mb-6">
        {/* Mobile: Simple progress bar */}
        <div className="sm:hidden mb-4">
          <div className="flex justify-between text-white text-sm mb-2">
            <span>Schritt {step} von 5</span>
            <span>{STEPS[step - 1].title}</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>
        {/* Desktop: Full step indicators */}
        <div className="hidden sm:flex items-center justify-between">
          {STEPS.map((s, idx) => (
            <div key={s.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                  step >= s.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/20 text-white/50'
                }`}
              >
                <s.icon className="w-5 h-5" />
              </div>
              <span
                className={`ml-2 text-sm ${
                  step >= s.id ? 'text-white' : 'text-white/50'
                }`}
              >
                {s.title}
              </span>
              {idx < STEPS.length - 1 && (
                <div
                  className={`w-16 h-0.5 mx-2 transition-colors ${
                    step > s.id ? 'bg-blue-500' : 'bg-white/20'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Card */}
      <div className="max-w-4xl mx-auto px-4 pb-6">
        <div className="glass-card rounded-2xl p-4 sm:p-6">
          {/* Step 1: Kontaktdaten */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 mb-4">
                1. Mandanteninformationen
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Personen-/Unternehmensname *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="glass-input w-full px-3 py-2.5 rounded-lg text-base"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Ansprechpartner (Vor- & Nachname) *
                  </label>
                  <input
                    type="text"
                    value={formData.ansprechpartner}
                    onChange={(e) => updateField('ansprechpartner', e.target.value)}
                    className="glass-input w-full px-3 py-2.5 rounded-lg text-base"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Position im Unternehmen
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => updateField('position', e.target.value)}
                    className="glass-input w-full px-3 py-2.5 rounded-lg text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    E-Mail *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="glass-input w-full px-3 py-2.5 rounded-lg text-base"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Telefonnummer
                  </label>
                  <input
                    type="tel"
                    value={formData.telefon}
                    onChange={(e) => updateField('telefon', e.target.value)}
                    className="glass-input w-full px-3 py-2.5 rounded-lg text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Bevorzugte Kontaktart
                  </label>
                  <select
                    value={formData.kontaktart}
                    onChange={(e) => updateField('kontaktart', e.target.value)}
                    className="glass-input w-full px-3 py-2.5 rounded-lg text-base"
                  >
                    <option value="Telefon">Telefon</option>
                    <option value="E-Mail">E-Mail</option>
                    <option value="Videokonferenz">Videokonferenz</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Straße / Hausnummer
                  </label>
                  <input
                    type="text"
                    value={formData.strasse}
                    onChange={(e) => updateField('strasse', e.target.value)}
                    className="glass-input w-full px-3 py-2.5 rounded-lg text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    PLZ
                  </label>
                  <input
                    type="text"
                    value={formData.plz}
                    onChange={(e) => updateField('plz', e.target.value)}
                    className="glass-input w-full px-3 py-2.5 rounded-lg text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Ort
                  </label>
                  <input
                    type="text"
                    value={formData.ort}
                    onChange={(e) => updateField('ort', e.target.value)}
                    className="glass-input w-full px-3 py-2.5 rounded-lg text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Land
                  </label>
                  <select
                    value={formData.land}
                    onChange={(e) => updateField('land', e.target.value)}
                    className="glass-input w-full px-3 py-2.5 rounded-lg text-base"
                  >
                    <option value="Deutschland">Deutschland</option>
                    <option value="Österreich">Österreich</option>
                    <option value="Schweiz">Schweiz</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Ankaufsprofil */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 mb-4">
                2. Ankaufsprofil
              </h2>
              <div>
                <label className="flex items-center gap-3 mb-6">
                  <input
                    type="checkbox"
                    checked={formData.kaufinteresse_aktiv}
                    onChange={(e) => updateField('kaufinteresse_aktiv', e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-slate-700 font-medium">Kaufinteresse aktiv</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Bevorzugte Assetklassen (Mehrfachauswahl)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {ASSETKLASSEN.map((asset) => (
                    <label
                      key={asset}
                      className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                        formData.assetklassen.includes(asset)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.assetklassen.includes(asset)}
                        onChange={() => toggleArrayField('assetklassen', asset)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-slate-700">{asset}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Standortprofil */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 mb-4">
                3. Standortprofil
              </h2>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Bevorzugte Städte / Regionen
                </label>
                <textarea
                  value={formData.regionen}
                  onChange={(e) => updateField('regionen', e.target.value)}
                  className="glass-input w-full px-3 py-2.5 rounded-lg text-base"
                  rows={4}
                  placeholder="z.B. München, Hamburg, Berlin, Rhein-Main-Gebiet..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Lagepräferenz (Mehrfachauswahl)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {LAGEPRAEFERENZEN.map((lage) => (
                    <label
                      key={lage}
                      className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                        formData.lagepraeferenz.includes(lage)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.lagepraeferenz.includes(lage)}
                        onChange={() => toggleArrayField('lagepraeferenz', lage)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-slate-700">{lage}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Finanzielle Parameter */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 mb-4">
                4. Finanzielle Ankaufsparameter
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Mindestinvestitionsvolumen (EUR)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={formData.min_volumen}
                    onChange={(e) => updateField('min_volumen', e.target.value)}
                    className="glass-input w-full px-3 py-2.5 rounded-lg text-base"
                    placeholder="z.B. 500000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Maximalvolumen (EUR)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={formData.max_volumen}
                    onChange={(e) => updateField('max_volumen', e.target.value)}
                    className="glass-input w-full px-3 py-2.5 rounded-lg text-base"
                    placeholder="z.B. 5000000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Bevorzugter Kaufpreisfaktor
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formData.kaufpreisfaktor}
                    onChange={(e) => updateField('kaufpreisfaktor', e.target.value)}
                    className="glass-input w-full px-3 py-2.5 rounded-lg text-base"
                    placeholder="z.B. 20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Finanzierungsform
                  </label>
                  <select
                    value={formData.finanzierungsform}
                    onChange={(e) => updateField('finanzierungsform', e.target.value)}
                    className="glass-input w-full px-3 py-2.5 rounded-lg text-base"
                  >
                    {FINANZIERUNGSFORMEN.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Zielrendite IST (%)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formData.zielrendite_ist}
                    onChange={(e) => updateField('zielrendite_ist', e.target.value)}
                    className="glass-input w-full px-3 py-2.5 rounded-lg text-base"
                    placeholder="z.B. 4.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Zielrendite SOLL (%)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formData.zielrendite_soll}
                    onChange={(e) => updateField('zielrendite_soll', e.target.value)}
                    className="glass-input w-full px-3 py-2.5 rounded-lg text-base"
                    placeholder="z.B. 6.0"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Objektspezifische Kriterien & Zusätzliches */}
          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 mb-4">
                5. Objektspezifische Kriterien
              </h2>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Zustand (Mehrfachauswahl)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {ZUSTAND_OPTIONS.map((z) => (
                    <label
                      key={z}
                      className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                        formData.zustand.includes(z)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.zustand.includes(z)}
                        onChange={() => toggleArrayField('zustand', z)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-slate-700">{z}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Baujahr von
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={formData.baujahr_von}
                    onChange={(e) => updateField('baujahr_von', e.target.value)}
                    className="glass-input w-full px-3 sm:px-3 py-2.5 rounded-lg text-base"
                    placeholder="1900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Baujahr bis
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={formData.baujahr_bis}
                    onChange={(e) => updateField('baujahr_bis', e.target.value)}
                    className="glass-input w-full px-3 sm:px-3 py-2.5 rounded-lg text-base"
                    placeholder="2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Min. Wohnfläche (m²)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={formData.min_wohnflaeche}
                    onChange={(e) => updateField('min_wohnflaeche', e.target.value)}
                    className="glass-input w-full px-3 sm:px-3 py-2.5 rounded-lg text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Min. Gewerbefl. (m²)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={formData.min_gewerbeflaeche}
                    onChange={(e) => updateField('min_gewerbeflaeche', e.target.value)}
                    className="glass-input w-full px-3 sm:px-3 py-2.5 rounded-lg text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Min. Wohneinh.
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={formData.min_wohneinheiten}
                    onChange={(e) => updateField('min_wohneinheiten', e.target.value)}
                    className="glass-input w-full px-3 sm:px-3 py-2.5 rounded-lg text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Min. Gewerbeinh.
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={formData.min_gewerbeeinheiten}
                    onChange={(e) => updateField('min_gewerbeeinheiten', e.target.value)}
                    className="glass-input w-full px-3 sm:px-3 py-2.5 rounded-lg text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Min. Grundstück (m²)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={formData.min_grundstueck}
                    onChange={(e) => updateField('min_grundstueck', e.target.value)}
                    className="glass-input w-full px-3 sm:px-3 py-2.5 rounded-lg text-base"
                  />
                </div>
              </div>

              <hr className="my-6 border-slate-200" />

              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Zusätzliche Angaben
              </h3>
              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.ausgeschlossene_partner}
                    onChange={(e) => updateField('ausgeschlossene_partner', e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-slate-700">Ausgeschlossene Partner / Makler?</span>
                </label>
                {formData.ausgeschlossene_partner && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Liste ausgeschlossener Partner
                    </label>
                    <input
                      type="text"
                      value={formData.partner_liste}
                      onChange={(e) => updateField('partner_liste', e.target.value)}
                      className="glass-input w-full px-3 py-2.5 rounded-lg text-base"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Besondere Bedingungen / Präferenzen
                  </label>
                  <textarea
                    value={formData.besondere_bedingungen}
                    onChange={(e) => updateField('besondere_bedingungen', e.target.value)}
                    className="glass-input w-full px-3 py-2.5 rounded-lg text-base"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Weitere Projektarten (ESG, CO₂, Redevelopment etc.)
                  </label>
                  <input
                    type="text"
                    value={formData.weitere_projektarten}
                    onChange={(e) => updateField('weitere_projektarten', e.target.value)}
                    className="glass-input w-full px-3 py-2.5 rounded-lg text-base"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 mt-6 sm:mt-8 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className="flex items-center justify-center gap-2 px-6 py-3 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Zurück
            </button>
            {step < 5 ? (
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(5, s + 1))}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Weiter
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-8 py-3.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-medium"
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
