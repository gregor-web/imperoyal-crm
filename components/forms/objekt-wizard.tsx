'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { objektSchema, type ObjektInput } from '@/lib/validators';
import { Input, Select, Button } from '@/components/ui';
import { OPTIONS } from '@/lib/types';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface ObjektWizardProps {
  defaultValues?: Partial<ObjektInput>;
  onSubmit: (data: ObjektInput) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  mandantId?: string;
}

const STEPS = [
  { id: 1, title: 'Adresse', description: 'Wo befindet sich das Objekt?' },
  { id: 2, title: 'Gebäude', description: 'Gebäudedaten & Ausstattung' },
  { id: 3, title: 'Flächen', description: 'Wohn- & Gewerbeflächen' },
  { id: 4, title: 'Finanzierung', description: 'Kaufpreis & Darlehen' },
  { id: 5, title: 'Bewirtschaftung', description: 'Laufende Kosten' },
  { id: 6, title: 'Investitionen', description: 'CAPEX & Modernisierung' },
  { id: 7, title: 'Rechtliches', description: 'WEG, Milieuschutz & mehr' },
  { id: 8, title: 'Strategie', description: 'Ziele & Haltedauer' },
];

export function ObjektWizard({ defaultValues, onSubmit, onCancel, isLoading, mandantId }: ObjektWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    watch,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<ObjektInput>({
    resolver: zodResolver(objektSchema) as any,
    defaultValues: {
      mandant_id: mandantId,
      zinssatz: 3.8,
      tilgung: 2,
      eigenkapital_prozent: 30,
      denkmalschutz: false,
      aufzug: false,
      weg_aufgeteilt: false,
      weg_geplant: false,
      milieuschutz: false,
      umwandlungsverbot: false,
      mietpreisbindung: false,
      sozialbindung: false,
      modernisierungsstopp: false,
      gewerbe_sonderklauseln: false,
      ...defaultValues,
    },
  });

  const booleanOptions = [
    { value: 'true', label: 'Ja' },
    { value: 'false', label: 'Nein' },
  ];

  // Validate current step before moving forward
  const validateStep = async (step: number): Promise<boolean> => {
    switch (step) {
      case 1:
        return await trigger(['strasse', 'plz', 'ort']);
      case 4:
        return await trigger(['kaufpreis']);
      default:
        return true;
    }
  };

  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = async (step: number) => {
    if (step < currentStep) {
      setCurrentStep(step);
    } else if (step === currentStep + 1) {
      await nextStep();
    }
  };

  // Watch some values for display
  const strasse = watch('strasse');
  const plz = watch('plz');
  const ort = watch('ort');

  return (
    <div className="min-h-[600px] flex flex-col">
      {/* Progress Header */}
      <div className="mb-8">
        {/* Step Indicators */}
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <button
                type="button"
                onClick={() => goToStep(step.id)}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all
                  ${currentStep === step.id
                    ? 'bg-blue-600 text-white shadow-lg scale-110'
                    : currentStep > step.id
                    ? 'bg-green-500 text-white cursor-pointer hover:bg-green-600'
                    : 'bg-slate-200 text-slate-500'
                  }
                `}
              >
                {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
              </button>
              {index < STEPS.length - 1 && (
                <div
                  className={`w-full h-1 mx-2 rounded ${
                    currentStep > step.id ? 'bg-green-500' : 'bg-slate-200'
                  }`}
                  style={{ minWidth: '20px', maxWidth: '60px' }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Current Step Info */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-800">{STEPS[currentStep - 1].title}</h2>
          <p className="text-slate-500 text-sm">{STEPS[currentStep - 1].description}</p>
          {strasse && plz && ort && currentStep > 1 && (
            <p className="text-xs text-blue-600 mt-1">{strasse}, {plz} {ort}</p>
          )}
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col">
        <div className="flex-1">
          {/* Step 1: Adresse */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <Input
                label="Straße & Hausnummer *"
                placeholder="z.B. Musterstraße 42"
                {...register('strasse')}
                error={errors.strasse?.message}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="PLZ *"
                  placeholder="z.B. 10115"
                  {...register('plz')}
                  error={errors.plz?.message}
                />
                <Input
                  label="Ort *"
                  placeholder="z.B. Berlin"
                  {...register('ort')}
                  error={errors.ort?.message}
                />
              </div>
            </div>
          )}

          {/* Step 2: Gebäudedaten */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Gebäudetyp"
                  options={OPTIONS.gebaeudetyp}
                  {...register('gebaeudetyp')}
                  placeholder="Auswählen..."
                />
                <Input
                  label="Baujahr"
                  type="number"
                  placeholder="z.B. 1985"
                  {...register('baujahr')}
                />
              </div>
              <Input
                label="Kernsanierung (Jahr)"
                type="number"
                placeholder="Falls saniert..."
                {...register('kernsanierung_jahr')}
              />
              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="Wohneinheiten"
                  type="number"
                  placeholder="0"
                  {...register('wohneinheiten')}
                />
                <Input
                  label="Gewerbeeinheiten"
                  type="number"
                  placeholder="0"
                  {...register('gewerbeeinheiten')}
                />
                <Input
                  label="Geschosse"
                  type="number"
                  placeholder="z.B. 5"
                  {...register('geschosse')}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Select label="Denkmalschutz" options={booleanOptions} {...register('denkmalschutz')} />
                <Select label="Aufzug" options={booleanOptions} {...register('aufzug')} />
                <Select
                  label="Heizungsart"
                  options={OPTIONS.heizungsart}
                  {...register('heizungsart')}
                  placeholder="Auswählen..."
                />
              </div>
            </div>
          )}

          {/* Step 3: Flächen */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <Input
                label="Wohnfläche (m²)"
                type="number"
                step="0.01"
                placeholder="z.B. 850"
                {...register('wohnflaeche')}
              />
              <Input
                label="Gewerbefläche (m²)"
                type="number"
                step="0.01"
                placeholder="z.B. 200"
                {...register('gewerbeflaeche')}
              />
              <Input
                label="Grundstücksfläche (m²)"
                type="number"
                step="0.01"
                placeholder="z.B. 500"
                {...register('grundstueck')}
              />
            </div>
          )}

          {/* Step 4: Finanzierung */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <Input
                label="Kaufpreis (€) *"
                type="number"
                placeholder="z.B. 2500000"
                {...register('kaufpreis')}
                error={errors.kaufpreis?.message}
              />
              <Input
                label="Kaufdatum"
                type="date"
                {...register('kaufdatum')}
              />
              <Input
                label="Darlehensstand (€)"
                type="number"
                placeholder="Aktueller Darlehensstand"
                {...register('darlehensstand')}
              />
              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="Zinssatz (%)"
                  type="number"
                  step="0.1"
                  {...register('zinssatz')}
                />
                <Input
                  label="Tilgung (%)"
                  type="number"
                  step="0.1"
                  {...register('tilgung')}
                />
                <Input
                  label="Eigenkapital (%)"
                  type="number"
                  {...register('eigenkapital_prozent')}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Grundstückswert (€)"
                  type="number"
                  placeholder="Für AfA-Berechnung"
                  {...register('grundstueck_wert')}
                />
                <Input
                  label="Gebäudewert (€)"
                  type="number"
                  placeholder="Für AfA-Berechnung"
                  {...register('gebaeude_wert')}
                />
              </div>
            </div>
          )}

          {/* Step 5: Bewirtschaftung */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <Input
                label="Leerstandsquote (%)"
                type="number"
                step="0.1"
                placeholder="z.B. 5"
                {...register('leerstandsquote')}
              />
              <Input
                label="Betriebskosten nicht umlagefähig (€/Jahr)"
                type="number"
                placeholder="z.B. 5000"
                {...register('betriebskosten_nicht_umlage')}
              />
              <Input
                label="Instandhaltung (€/Jahr)"
                type="number"
                placeholder="z.B. 15000"
                {...register('instandhaltung')}
              />
              <Input
                label="Verwaltungskosten (€/Jahr)"
                type="number"
                placeholder="z.B. 8000"
                {...register('verwaltung')}
              />
              <Input
                label="Rücklagen (€/Jahr)"
                type="number"
                placeholder="z.B. 10000"
                {...register('ruecklagen')}
              />
            </div>
          )}

          {/* Step 6: CAPEX */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <Input
                label="Vergangene Investitionen"
                placeholder="z.B. Dachsanierung 2020, Heizung 2022..."
                {...register('capex_vergangen')}
              />
              <Input
                label="Geplante Investitionen"
                placeholder="z.B. Fassadendämmung, neue Fenster..."
                {...register('capex_geplant')}
              />
              <Input
                label="Geplantes CAPEX-Budget (€)"
                type="number"
                placeholder="z.B. 150000"
                {...register('capex_geplant_betrag')}
              />
              <p className="text-sm text-slate-500 bg-blue-50 p-3 rounded-lg">
                CAPEX-Investitionen können nach §559 BGB auf Mieter umgelegt werden (8% p.a., mit Kappungsgrenzen).
              </p>
            </div>
          )}

          {/* Step 7: Rechtliches */}
          {currentStep === 7 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Select label="WEG aufgeteilt" options={booleanOptions} {...register('weg_aufgeteilt')} />
                <Select label="WEG geplant" options={booleanOptions} {...register('weg_geplant')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Select label="Milieuschutzgebiet" options={booleanOptions} {...register('milieuschutz')} />
                <Select label="Umwandlungsverbot" options={booleanOptions} {...register('umwandlungsverbot')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Select label="Mietpreisbindung" options={booleanOptions} {...register('mietpreisbindung')} />
                <Select label="Sozialbindung" options={booleanOptions} {...register('sozialbindung')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Select label="Modernisierungsstopp" options={booleanOptions} {...register('modernisierungsstopp')} />
                <Select label="Gewerbe-Sonderklauseln" options={booleanOptions} {...register('gewerbe_sonderklauseln')} />
              </div>
            </div>
          )}

          {/* Step 8: Strategie */}
          {currentStep === 8 && (
            <div className="space-y-4">
              <Select
                label="Geplante Haltedauer"
                options={OPTIONS.haltedauer}
                {...register('haltedauer')}
                placeholder="Auswählen..."
              />
              <Select
                label="Primäres Ziel"
                options={OPTIONS.primaeresziel}
                {...register('primaeres_ziel')}
                placeholder="Auswählen..."
              />
              <Select
                label="Risikoprofil"
                options={OPTIONS.risikoprofil}
                {...register('risikoprofil')}
                placeholder="Auswählen..."
              />
              <Input
                label="Investitionsbereitschaft"
                placeholder="z.B. Bis 200.000€ für Wertsteigerung"
                {...register('investitionsbereitschaft')}
              />
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6 mt-6 border-t border-slate-200">
          <div>
            {currentStep > 1 ? (
              <Button type="button" variant="secondary" onClick={prevStep}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Zurück
              </Button>
            ) : onCancel ? (
              <Button type="button" variant="secondary" onClick={onCancel}>
                Abbrechen
              </Button>
            ) : (
              <div />
            )}
          </div>

          <div className="text-sm text-slate-500">
            Schritt {currentStep} von {STEPS.length}
          </div>

          <div>
            {currentStep < STEPS.length ? (
              <Button type="button" onClick={nextStep}>
                Weiter
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button type="submit" loading={isLoading}>
                <Check className="w-4 h-4 mr-1" />
                Objekt erstellen
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
