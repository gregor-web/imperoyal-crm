'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CheckCircle, ArrowRight, ArrowLeft, Building2, User, Home, Euro, Plus, Trash2 } from 'lucide-react';

type Einheit = {
  nutzung: 'Wohnen' | 'Gewerbe' | 'Stellplatz';
  flaeche: string;
  kaltmiete: string;
  vergleichsmiete: string;
  mietvertragsart: 'Standard' | 'Index' | 'Staffel';
};

type FormData = {
  // Mandanteninformationen
  name: string;
  ansprechpartner: string;
  position: string;
  email: string;
  telefon: string;
  // Objektdaten
  objekt_strasse: string;
  objekt_plz: string;
  objekt_ort: string;
  gebaeudetyp: string;
  baujahr: string;
  kaufpreis: string;
  kaufdatum: string;
  // Finanzierung
  eigenkapital_prozent: string;
  zinssatz: string;
  tilgung: string;
  // Kosten
  instandhaltung: string;
  verwaltung: string;
  // Einheiten
  einheiten: Einheit[];
};

const STEPS = [
  { id: 1, title: 'Kontakt', icon: User },
  { id: 2, title: 'Objekt', icon: Home },
  { id: 3, title: 'Einheiten', icon: Building2 },
  { id: 4, title: 'Finanzen', icon: Euro },
];

const GEBAEUDETYPEN = ['MFH', 'Wohn- & Geschäftshaus', 'Büro', 'Retail', 'Logistik', 'Spezialimmobilie'];

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
    objekt_strasse: '',
    objekt_plz: '',
    objekt_ort: '',
    gebaeudetyp: 'MFH',
    baujahr: '',
    kaufpreis: '',
    kaufdatum: '',
    eigenkapital_prozent: '30',
    zinssatz: '3.8',
    tilgung: '2',
    instandhaltung: '',
    verwaltung: '',
    einheiten: [{ nutzung: 'Wohnen', flaeche: '', kaltmiete: '', vergleichsmiete: '12', mietvertragsart: 'Standard' }],
  });

  const updateField = (field: keyof Omit<FormData, 'einheiten'>, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addEinheit = () => {
    setFormData((prev) => ({
      ...prev,
      einheiten: [...prev.einheiten, { nutzung: 'Wohnen', flaeche: '', kaltmiete: '', vergleichsmiete: '12', mietvertragsart: 'Standard' }],
    }));
  };

  const removeEinheit = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      einheiten: prev.einheiten.filter((_, i) => i !== index),
    }));
  };

  const updateEinheit = (index: number, field: keyof Einheit, value: string) => {
    setFormData((prev) => ({
      ...prev,
      einheiten: prev.einheiten.map((e, i) => (i === index ? { ...e, [field]: value } : e)),
    }));
  };

  const fillTestDataAndSubmit = async () => {
    const testData: FormData = {
      name: 'Müller Immobilien GmbH',
      ansprechpartner: 'Thomas Müller',
      position: 'Geschäftsführer',
      email: `test${Date.now()}@example.com`,
      telefon: '+49 89 123456789',
      objekt_strasse: 'Leopoldstraße 42',
      objekt_plz: '80802',
      objekt_ort: 'München',
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
        { nutzung: 'Wohnen', flaeche: '75', kaltmiete: '850', vergleichsmiete: '14', mietvertragsart: 'Standard' },
        { nutzung: 'Wohnen', flaeche: '65', kaltmiete: '720', vergleichsmiete: '14', mietvertragsart: 'Standard' },
        { nutzung: 'Wohnen', flaeche: '80', kaltmiete: '950', vergleichsmiete: '14', mietvertragsart: 'Index' },
        { nutzung: 'Wohnen', flaeche: '55', kaltmiete: '600', vergleichsmiete: '14', mietvertragsart: 'Standard' },
        { nutzung: 'Gewerbe', flaeche: '120', kaltmiete: '1800', vergleichsmiete: '18', mietvertragsart: 'Index' },
        { nutzung: 'Stellplatz', flaeche: '12', kaltmiete: '80', vergleichsmiete: '80', mietvertragsart: 'Standard' },
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

  // Calculate summary stats
  const totalMiete = formData.einheiten.reduce((sum, e) => sum + (parseFloat(e.kaltmiete) || 0), 0);
  const totalFlaeche = formData.einheiten.reduce((sum, e) => sum + (parseFloat(e.flaeche) || 0), 0);

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="glass-card rounded-2xl p-8 max-w-lg text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-4">
            Vielen Dank!
          </h1>
          <p className="text-slate-600 mb-6">
            Ihre Daten wurden erfolgreich übermittelt. Wir werden Ihr Objekt analysieren und uns in Kürze bei Ihnen melden.
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
              onClick={fillTestDataAndSubmit}
              disabled={loading}
              className="px-3 py-1.5 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Wird gesendet...' : 'Testdaten & Absenden'}
            </button>
            <span className="text-white/70 text-sm hidden sm:block">Objekt-Onboarding</span>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-4 mb-4 sm:mb-6">
        <div className="sm:hidden mb-4">
          <div className="flex justify-between text-white text-sm mb-2">
            <span>Schritt {step} von 4</span>
            <span>{STEPS[step - 1].title}</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>
        <div className="hidden sm:flex items-center justify-between">
          {STEPS.map((s, idx) => (
            <div key={s.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                  step >= s.id ? 'bg-blue-500 text-white' : 'bg-white/20 text-white/50'
                }`}
              >
                <s.icon className="w-5 h-5" />
              </div>
              <span className={`ml-2 text-sm ${step >= s.id ? 'text-white' : 'text-white/50'}`}>
                {s.title}
              </span>
              {idx < STEPS.length - 1 && (
                <div className={`w-20 h-0.5 mx-3 transition-colors ${step > s.id ? 'bg-blue-500' : 'bg-white/20'}`} />
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
              <h2 className="text-lg font-bold text-slate-800 mb-4">1. Ihre Kontaktdaten</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Firmenname / Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="glass-input w-full px-3 py-2.5 rounded-lg text-base"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ansprechpartner *</label>
                  <input
                    type="text"
                    value={formData.ansprechpartner}
                    onChange={(e) => updateField('ansprechpartner', e.target.value)}
                    className="glass-input w-full px-3 py-2.5 rounded-lg text-base"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Position</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => updateField('position', e.target.value)}
                    className="glass-input w-full px-3 py-2.5 rounded-lg text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">E-Mail *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="glass-input w-full px-3 py-2.5 rounded-lg text-base"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
                  <input
                    type="tel"
                    value={formData.telefon}
                    onChange={(e) => updateField('telefon', e.target.value)}
                    className="glass-input w-full px-3 py-2.5 rounded-lg text-base"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Objektdaten */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 mb-4">2. Objektdaten</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Straße / Hausnummer *</label>
                  <input
                    type="text"
                    value={formData.objekt_strasse}
                    onChange={(e) => updateField('objekt_strasse', e.target.value)}
                    className="glass-input w-full px-3 py-2.5 rounded-lg text-base"
                    placeholder="z.B. Leopoldstraße 42"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">PLZ *</label>
                  <input
                    type="text"
                    value={formData.objekt_plz}
                    onChange={(e) => updateField('objekt_plz', e.target.value)}
                    className="glass-input w-full px-3 py-2.5 rounded-lg text-base"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ort *</label>
                  <input
                    type="text"
                    value={formData.objekt_ort}
                    onChange={(e) => updateField('objekt_ort', e.target.value)}
                    className="glass-input w-full px-3 py-2.5 rounded-lg text-base"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Gebäudetyp</label>
                  <select
                    value={formData.gebaeudetyp}
                    onChange={(e) => updateField('gebaeudetyp', e.target.value)}
                    className="glass-input w-full px-3 py-2.5 rounded-lg text-base"
                  >
                    {GEBAEUDETYPEN.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Baujahr</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.baujahr}
                    onChange={(e) => updateField('baujahr', e.target.value)}
                    className="glass-input w-full px-3 py-2.5 rounded-lg text-base"
                    placeholder="z.B. 1985"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Kaufpreis (EUR) *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.kaufpreis}
                    onChange={(e) => updateField('kaufpreis', e.target.value)}
                    className="glass-input w-full px-3 py-2.5 rounded-lg text-base"
                    placeholder="z.B. 2500000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Kaufdatum</label>
                  <input
                    type="date"
                    value={formData.kaufdatum}
                    onChange={(e) => updateField('kaufdatum', e.target.value)}
                    className="glass-input w-full px-3 py-2.5 rounded-lg text-base"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Einheiten */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-slate-800">3. Mieteinheiten</h2>
                <button
                  type="button"
                  onClick={addEinheit}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Einheit
                </button>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-3 gap-4 p-3 bg-blue-50 rounded-lg text-sm">
                <div>
                  <span className="text-slate-600">Einheiten:</span>
                  <span className="font-bold ml-2">{formData.einheiten.length}</span>
                </div>
                <div>
                  <span className="text-slate-600">Fläche:</span>
                  <span className="font-bold ml-2">{totalFlaeche.toFixed(0)} m²</span>
                </div>
                <div>
                  <span className="text-slate-600">Miete/Monat:</span>
                  <span className="font-bold ml-2 text-green-600">{totalMiete.toFixed(0)} €</span>
                </div>
              </div>

              {/* Einheiten Liste */}
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {formData.einheiten.map((einheit, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 p-3 bg-slate-50 rounded-lg items-end">
                    <div className="col-span-3 sm:col-span-2">
                      <label className="block text-xs text-slate-600 mb-1">Nutzung</label>
                      <select
                        value={einheit.nutzung}
                        onChange={(e) => updateEinheit(index, 'nutzung', e.target.value)}
                        className="glass-input w-full px-2 py-2 rounded text-sm"
                      >
                        <option value="Wohnen">Wohnen</option>
                        <option value="Gewerbe">Gewerbe</option>
                        <option value="Stellplatz">Stellplatz</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-slate-600 mb-1">m²</label>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={einheit.flaeche}
                        onChange={(e) => updateEinheit(index, 'flaeche', e.target.value)}
                        className="glass-input w-full px-2 py-2 rounded text-sm"
                        placeholder="75"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-slate-600 mb-1">Kaltmiete €</label>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={einheit.kaltmiete}
                        onChange={(e) => updateEinheit(index, 'kaltmiete', e.target.value)}
                        className="glass-input w-full px-2 py-2 rounded text-sm"
                        placeholder="850"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-slate-600 mb-1">Vgl.miete €/m²</label>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={einheit.vergleichsmiete}
                        onChange={(e) => updateEinheit(index, 'vergleichsmiete', e.target.value)}
                        className="glass-input w-full px-2 py-2 rounded text-sm"
                        placeholder="14"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-2">
                      <label className="block text-xs text-slate-600 mb-1">Vertrag</label>
                      <select
                        value={einheit.mietvertragsart}
                        onChange={(e) => updateEinheit(index, 'mietvertragsart', e.target.value)}
                        className="glass-input w-full px-2 py-2 rounded text-sm"
                      >
                        <option value="Standard">Standard</option>
                        <option value="Index">Index</option>
                        <option value="Staffel">Staffel</option>
                      </select>
                    </div>
                    <div className="col-span-1">
                      <button
                        type="button"
                        onClick={() => removeEinheit(index)}
                        disabled={formData.einheiten.length <= 1}
                        className="p-2 text-red-500 hover:bg-red-50 rounded disabled:opacity-30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Finanzierung & Kosten */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 mb-4">4. Finanzierung & Kosten</h2>

              <h3 className="font-semibold text-slate-700 mt-4">Finanzierung</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Eigenkapital (%)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formData.eigenkapital_prozent}
                    onChange={(e) => updateField('eigenkapital_prozent', e.target.value)}
                    className="glass-input w-full px-3 py-2.5 rounded-lg text-base"
                    placeholder="30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Zinssatz (%)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formData.zinssatz}
                    onChange={(e) => updateField('zinssatz', e.target.value)}
                    className="glass-input w-full px-3 py-2.5 rounded-lg text-base"
                    placeholder="3.8"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tilgung (%)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formData.tilgung}
                    onChange={(e) => updateField('tilgung', e.target.value)}
                    className="glass-input w-full px-3 py-2.5 rounded-lg text-base"
                    placeholder="2"
                  />
                </div>
              </div>

              <h3 className="font-semibold text-slate-700 mt-6">Jährliche Kosten</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Instandhaltung (€/Jahr)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.instandhaltung}
                    onChange={(e) => updateField('instandhaltung', e.target.value)}
                    className="glass-input w-full px-3 py-2.5 rounded-lg text-base"
                    placeholder="ca. 12 €/m²"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Verwaltung (€/Jahr)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.verwaltung}
                    onChange={(e) => updateField('verwaltung', e.target.value)}
                    className="glass-input w-full px-3 py-2.5 rounded-lg text-base"
                    placeholder="ca. 300 €/Einheit"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="mt-6 p-4 bg-slate-100 rounded-lg">
                <h4 className="font-semibold text-slate-800 mb-3">Zusammenfassung</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Kaufpreis:</div>
                  <div className="font-semibold">{parseInt(formData.kaufpreis || '0').toLocaleString('de-DE')} €</div>
                  <div>Einheiten:</div>
                  <div className="font-semibold">{formData.einheiten.length}</div>
                  <div>Gesamtfläche:</div>
                  <div className="font-semibold">{totalFlaeche.toFixed(0)} m²</div>
                  <div>Jahresmiete (IST):</div>
                  <div className="font-semibold text-green-600">{(totalMiete * 12).toLocaleString('de-DE')} €</div>
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
            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(4, s + 1))}
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
