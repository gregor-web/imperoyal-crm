'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button, Input, Select } from '@/components/ui';
import { OPTIONS } from '@/lib/types';
import { formatCurrency } from '@/lib/formatters';
import { ArrowLeft, ArrowRight, Check, Building2, Euro, MapPin, Target } from 'lucide-react';
import Link from 'next/link';

interface Mandant {
  id: string;
  name: string;
}

interface FormData {
  mandant_id?: string;
  name: string;
  min_volumen: number | null;
  max_volumen: number | null;
  assetklassen: string[];
  regionen: string;
  rendite_min: number | null;
  sonstiges: string;
}

const STEPS = [
  { id: 1, title: 'Grunddaten', icon: Building2 },
  { id: 2, title: 'Volumen', icon: Euro },
  { id: 3, title: 'Assetklassen', icon: Target },
  { id: 4, title: 'Standort & Rendite', icon: MapPin },
];

export default function NeuesAnkaufsprofilPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mandanten, setMandanten] = useState<Mandant[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userMandantId, setUserMandantId] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    min_volumen: null,
    max_volumen: null,
    assetklassen: [],
    regionen: '',
    rendite_min: null,
    sonstiges: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, mandant_id')
        .single();

      if (profile) {
        setIsAdmin(profile.role === 'admin');
        setUserMandantId(profile.mandant_id);

        if (profile.role === 'admin') {
          const { data: mandantenData } = await supabase
            .from('mandanten')
            .select('id, name')
            .order('name');
          setMandanten(mandantenData || []);
        }
      }
    };

    fetchData();
  }, []);

  const updateFormData = (field: keyof FormData, value: FormData[keyof FormData]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAssetklasse = (assetklasse: string) => {
    const current = formData.assetklassen;
    const updated = current.includes(assetklasse)
      ? current.filter((a) => a !== assetklasse)
      : [...current, assetklasse];
    updateFormData('assetklassen', updated);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.name.trim()) {
          setError('Bitte geben Sie einen Profilnamen ein');
          return false;
        }
        if (isAdmin && !formData.mandant_id) {
          setError('Bitte wählen Sie einen Mandanten');
          return false;
        }
        break;
      case 2:
        // Optional fields, no validation needed
        break;
      case 3:
        if (formData.assetklassen.length === 0) {
          setError('Bitte wählen Sie mindestens eine Assetklasse');
          return false;
        }
        break;
      case 4:
        // Optional fields, no validation needed
        break;
    }
    setError(null);
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const prevStep = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const mandant_id = isAdmin ? formData.mandant_id : userMandantId;

      if (!mandant_id) {
        throw new Error('Mandant ID fehlt');
      }

      const { error } = await supabase.from('ankaufsprofile').insert({
        mandant_id,
        name: formData.name,
        min_volumen: formData.min_volumen,
        max_volumen: formData.max_volumen,
        assetklassen: formData.assetklassen,
        regionen: formData.regionen || null,
        rendite_min: formData.rendite_min,
        sonstiges: formData.sonstiges || null,
      });

      if (error) throw error;

      router.push('/ankaufsprofile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-xl font-semibold text-[#1E2A3A]">Wie soll Ihr Ankaufsprofil heißen?</h2>
              <p className="text-[#4A6A8D] mt-2">Geben Sie einen aussagekräftigen Namen für Ihr Profil ein</p>
            </div>

            {isAdmin && mandanten.length > 0 && (
              <Select
                label="Mandant"
                placeholder="Mandant wählen..."
                options={mandanten.map((m) => ({ value: m.id, label: m.name }))}
                value={formData.mandant_id || ''}
                onChange={(e) => updateFormData('mandant_id', e.target.value)}
              />
            )}

            <Input
              label="Profilname"
              placeholder="z.B. Core-Portfolio Süddeutschland"
              value={formData.name}
              onChange={(e) => updateFormData('name', e.target.value)}
              autoFocus
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-xl font-semibold text-[#1E2A3A]">Welches Investitionsvolumen?</h2>
              <p className="text-[#4A6A8D] mt-2">Definieren Sie Ihre Preisspanne für Ankäufe</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <Input
                  label="Mindestvolumen"
                  type="number"
                  placeholder="z.B. 1.000.000"
                  value={formData.min_volumen || ''}
                  onChange={(e) => updateFormData('min_volumen', e.target.value ? Number(e.target.value) : null)}
                />
                <p className="text-xs text-[#5B7A9D] mt-1">
                  {formData.min_volumen ? formatCurrency(formData.min_volumen) : 'Keine Untergrenze'}
                </p>
              </div>
              <div>
                <Input
                  label="Maximalvolumen"
                  type="number"
                  placeholder="z.B. 10.000.000"
                  value={formData.max_volumen || ''}
                  onChange={(e) => updateFormData('max_volumen', e.target.value ? Number(e.target.value) : null)}
                />
                <p className="text-xs text-[#5B7A9D] mt-1">
                  {formData.max_volumen ? formatCurrency(formData.max_volumen) : 'Keine Obergrenze'}
                </p>
              </div>
            </div>

            {/* Quick select buttons */}
            <div>
              <label className="block text-sm font-medium text-[#1E2A3A] mb-2">Schnellauswahl</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: '1-5 Mio.', min: 1000000, max: 5000000 },
                  { label: '5-10 Mio.', min: 5000000, max: 10000000 },
                  { label: '10-25 Mio.', min: 10000000, max: 25000000 },
                  { label: '25-50 Mio.', min: 25000000, max: 50000000 },
                  { label: '50+ Mio.', min: 50000000, max: null },
                ].map((range) => (
                  <button
                    key={range.label}
                    type="button"
                    onClick={() => {
                      updateFormData('min_volumen', range.min);
                      updateFormData('max_volumen', range.max);
                    }}
                    className={`px-3 sm:px-4 py-2 rounded-[10px] text-xs sm:text-sm font-medium transition-colors min-h-[40px] ${
                      formData.min_volumen === range.min && formData.max_volumen === range.max
                        ? 'bg-[#5B7A9D] text-white'
                        : 'bg-[#EDF1F5] text-[#1E2A3A] hover:bg-[#D5DEE6]'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-xl font-semibold text-[#1E2A3A]">Welche Assetklassen?</h2>
              <p className="text-[#4A6A8D] mt-2">Wählen Sie alle relevanten Immobilientypen aus</p>
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3">
              {OPTIONS.assetklassen.map((assetklasse) => {
                const isSelected = formData.assetklassen.includes(assetklasse);
                return (
                  <button
                    key={assetklasse}
                    type="button"
                    onClick={() => toggleAssetklasse(assetklasse)}
                    className={`p-4 rounded-xl text-sm font-medium transition-all border-2 ${
                      isSelected
                        ? 'bg-[#5B7A9D]/12 border-[#5B7A9D] text-[#4A6A8D]'
                        : 'bg-white border-[#D5DEE6] text-[#1E2A3A] hover:border-[#B8C5D1] hover:bg-[#EDF1F5]'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {isSelected && <Check className="w-4 h-4" />}
                      <span>{assetklasse}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <p className="text-center text-sm text-[#5B7A9D]">
              {formData.assetklassen.length} von {OPTIONS.assetklassen.length} ausgewählt
            </p>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-xl font-semibold text-[#1E2A3A]">Standort & Renditeerwartung</h2>
              <p className="text-[#4A6A8D] mt-2">Definieren Sie Ihre geografischen und finanziellen Kriterien</p>
            </div>

            <Input
              label="Zielregionen"
              placeholder="z.B. München, Berlin, Hamburg, Frankfurt"
              value={formData.regionen}
              onChange={(e) => updateFormData('regionen', e.target.value)}
              hint="Kommagetrennte Liste von Städten oder Regionen"
            />

            <Input
              label="Mindestrendite (%)"
              type="number"
              step="0.1"
              placeholder="z.B. 4.5"
              value={formData.rendite_min || ''}
              onChange={(e) => updateFormData('rendite_min', e.target.value ? Number(e.target.value) : null)}
            />

            <div>
              <label className="block text-sm font-medium text-[#1E2A3A] mb-1">
                Sonstige Anforderungen
              </label>
              <textarea
                value={formData.sonstiges}
                onChange={(e) => updateFormData('sonstiges', e.target.value)}
                rows={3}
                className="glass-input w-full px-4 py-2.5 rounded-lg text-[#1E2A3A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Weitere Kriterien oder Anmerkungen..."
              />
            </div>

            {/* Summary */}
            <div className="mt-8 p-4 bg-[#EDF1F5] rounded-xl">
              <h3 className="text-sm font-semibold text-[#1E2A3A] mb-3">Zusammenfassung</h3>
              <div className="space-y-2 text-sm">
                <div className="flex flex-wrap justify-between gap-1">
                  <span className="text-[#4A6A8D]">Profilname:</span>
                  <span className="font-medium text-[#1E2A3A] truncate max-w-[180px] sm:max-w-[250px]">{formData.name}</span>
                </div>
                <div className="flex flex-wrap justify-between gap-1">
                  <span className="text-[#4A6A8D] flex-shrink-0">Volumen:</span>
                  <span className="font-medium text-[#1E2A3A] text-right">
                    {formData.min_volumen || formData.max_volumen
                      ? `${formData.min_volumen ? formatCurrency(formData.min_volumen) : '∞'} - ${formData.max_volumen ? formatCurrency(formData.max_volumen) : '∞'}`
                      : 'Keine Einschränkung'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#4A6A8D]">Assetklassen:</span>
                  <span className="font-medium text-[#1E2A3A]">{formData.assetklassen.length} ausgewählt</span>
                </div>
                {formData.regionen && (
                  <div className="flex justify-between">
                    <span className="text-[#4A6A8D]">Regionen:</span>
                    <span className="font-medium text-[#1E2A3A] truncate max-w-[140px] sm:max-w-[200px]">{formData.regionen}</span>
                  </div>
                )}
                {formData.rendite_min && (
                  <div className="flex justify-between">
                    <span className="text-[#4A6A8D]">Mindestrendite:</span>
                    <span className="font-medium text-[#1E2A3A]">{formData.rendite_min}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/ankaufsprofile" className="p-2 hover:bg-[#EDF1F5] rounded-lg">
          <ArrowLeft className="w-5 h-5 text-[#5B7A9D]" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1E2A3A]">Neues Ankaufsprofil</h1>
          <p className="text-[#4A6A8D] mt-1">Schritt {currentStep} von {STEPS.length}</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8 overflow-x-auto pb-2">
        <div className="flex items-center justify-between min-w-0">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <div key={step.id} className="flex items-center flex-shrink-0">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isCurrent
                        ? 'bg-[#5B7A9D] text-white'
                        : 'bg-[#D5DEE6] text-[#5B7A9D]'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : <Icon className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </div>
                  <span className={`text-[10px] sm:text-xs mt-1 max-w-[60px] sm:max-w-none text-center truncate ${isCurrent ? 'text-[#5B7A9D] font-medium' : 'text-[#5B7A9D]'}`}>
                    {step.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`h-1 mx-1 sm:mx-2 rounded flex-shrink-0 ${
                      currentStep > step.id ? 'bg-[#5B7A9D]/40' : 'bg-[#D5DEE6]'
                    }`}
                    style={{ minWidth: '20px', width: '100%', maxWidth: '40px' }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Step Content */}
      <Card className="mb-6">
        <div className="p-4 sm:p-6">
          {renderStepContent()}
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="secondary"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zurück
        </Button>

        {currentStep < STEPS.length ? (
          <Button type="button" onClick={nextStep}>
            Weiter
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button type="button" onClick={handleSubmit} loading={isLoading}>
            <Check className="w-4 h-4 mr-2" />
            Profil erstellen
          </Button>
        )}
      </div>
    </div>
  );
}
