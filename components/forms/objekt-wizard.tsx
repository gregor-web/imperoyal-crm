'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { objektSchema, type ObjektInput } from '@/lib/validators';
import { Input, Select, Button } from '@/components/ui';
import { OPTIONS } from '@/lib/types';
import { ChevronLeft, ChevronRight, Check, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

// Einheiten-Daten Typ
interface EinheitData {
  position: number;
  nutzung: 'Wohnen' | 'Gewerbe' | 'Stellplatz';
  flaeche: number | null;
  kaltmiete: number | null;
  vergleichsmiete: number;
  mietvertragsart: 'Standard' | 'Index' | 'Staffel';
  vertragsbeginn: string | null;
  letzte_mieterhoehung: string | null;
  hoehe_mieterhoehung: number | null;
  datum_558: string | null;
  hoehe_558: number | null;
  datum_559: string | null;
  art_modernisierung_559: string | null;
  hoehe_559: number | null;
}

interface ObjektWizardProps {
  defaultValues?: Partial<ObjektInput>;
  onSubmit: (data: ObjektInput, einheiten: EinheitData[]) => Promise<void>;
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
  { id: 9, title: 'Einheiten', description: 'Details pro Einheit' },
];

export function ObjektWizard({ defaultValues, onSubmit, onCancel, isLoading, mandantId }: ObjektWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [einheiten, setEinheiten] = useState<EinheitData[]>([]);
  const [expandedUnits, setExpandedUnits] = useState<Set<number>>(new Set());
  const [stellplaetze, setStellplaetze] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    watch,
    getValues,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<ObjektInput>({
    resolver: zodResolver(objektSchema) as any,
    defaultValues: {
      mandant_id: mandantId,
      zinssatz: 3.8,
      tilgung: 2,
      eigenkapital_prozent: 30,
      wohneinheiten: 0,
      gewerbeeinheiten: 0,
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

  // Watch einheiten counts
  const wohneinheiten = watch('wohneinheiten') || 0;
  const gewerbeeinheiten = watch('gewerbeeinheiten') || 0;

  // Generiere Einheiten basierend auf Anzahlen wenn zu Step 9 gewechselt wird
  useEffect(() => {
    if (currentStep === 9) {
      generateEinheiten();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  const generateEinheiten = () => {
    const wohn = Number(getValues('wohneinheiten')) || 0;
    const gewerbe = Number(getValues('gewerbeeinheiten')) || 0;
    const stell = stellplaetze || 0;
    const total = wohn + gewerbe + stell;

    // Nur neu generieren wenn Anzahl nicht übereinstimmt
    const currentWohn = einheiten.filter(e => e.nutzung === 'Wohnen').length;
    const currentGewerbe = einheiten.filter(e => e.nutzung === 'Gewerbe').length;
    const currentStell = einheiten.filter(e => e.nutzung === 'Stellplatz').length;

    if (currentWohn === wohn && currentGewerbe === gewerbe && currentStell === stell) {
      return; // Keine Änderung nötig
    }

    const newEinheiten: EinheitData[] = [];
    let position = 1;

    // Wohneinheiten
    for (let i = 0; i < wohn; i++) {
      const existing = einheiten.find(e => e.nutzung === 'Wohnen' && e.position === position);
      newEinheiten.push(existing || createEmptyEinheit(position, 'Wohnen'));
      position++;
    }

    // Gewerbeeinheiten
    for (let i = 0; i < gewerbe; i++) {
      const existing = einheiten.find(e => e.nutzung === 'Gewerbe' && e.position === position);
      newEinheiten.push(existing || createEmptyEinheit(position, 'Gewerbe'));
      position++;
    }

    // Stellplätze
    for (let i = 0; i < stell; i++) {
      const existing = einheiten.find(e => e.nutzung === 'Stellplatz' && e.position === position);
      newEinheiten.push(existing || createEmptyEinheit(position, 'Stellplatz'));
      position++;
    }

    setEinheiten(newEinheiten);
  };

  const createEmptyEinheit = (position: number, nutzung: 'Wohnen' | 'Gewerbe' | 'Stellplatz'): EinheitData => ({
    position,
    nutzung,
    flaeche: null,
    kaltmiete: null,
    vergleichsmiete: nutzung === 'Gewerbe' ? 20 : nutzung === 'Stellplatz' ? 0 : 12,
    mietvertragsart: 'Standard',
    vertragsbeginn: null,
    letzte_mieterhoehung: null,
    hoehe_mieterhoehung: null,
    datum_558: null,
    hoehe_558: null,
    datum_559: null,
    art_modernisierung_559: null,
    hoehe_559: null,
  });

  const updateEinheit = (index: number, field: keyof EinheitData, value: string | number | null) => {
    setEinheiten(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const toggleExpanded = (index: number) => {
    setExpandedUnits(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const expandAll = () => setExpandedUnits(new Set(einheiten.map((_, i) => i)));
  const collapseAll = () => setExpandedUnits(new Set());

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

  // Final submit
  const onFormSubmit = (data: ObjektInput) => {
    onSubmit(data, einheiten);
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
        <div className="flex items-center justify-between mb-4 overflow-x-auto pb-2">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center flex-shrink-0">
              <button
                type="button"
                onClick={() => goToStep(step.id)}
                className={`
                  w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm transition-all
                  ${currentStep === step.id
                    ? 'bg-blue-600 text-white shadow-lg scale-110'
                    : currentStep > step.id
                    ? 'bg-green-500 text-white cursor-pointer hover:bg-green-600'
                    : 'bg-slate-200 text-slate-500'
                  }
                `}
              >
                {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
              </button>
              {index < STEPS.length - 1 && (
                <div
                  className={`w-4 sm:w-8 h-1 mx-1 rounded ${
                    currentStep > step.id ? 'bg-green-500' : 'bg-slate-200'
                  }`}
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
      <form onSubmit={handleSubmit(onFormSubmit)} className="flex-1 flex flex-col">
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

              {/* Einheiten-Anzahlen - Wichtig für Step 9 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-800 mb-3">Anzahl Einheiten (bestimmt Felder in Step 9)</h4>
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
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Stellplätze</label>
                    <input
                      type="number"
                      value={stellplaetze}
                      onChange={(e) => setStellplaetze(Number(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  Basierend auf diesen Angaben werden im letzten Schritt automatisch {Number(wohneinheiten) + Number(gewerbeeinheiten) + stellplaetze} Einheit(en) zum Ausfüllen generiert.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="Geschosse"
                  type="number"
                  placeholder="z.B. 5"
                  {...register('geschosse')}
                />
                <Select label="Denkmalschutz" options={booleanOptions} {...register('denkmalschutz')} />
                <Select label="Aufzug" options={booleanOptions} {...register('aufzug')} />
              </div>
              <Select
                label="Heizungsart"
                options={OPTIONS.heizungsart}
                {...register('heizungsart')}
                placeholder="Auswählen..."
              />
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

          {/* Step 9: Einheiten */}
          {currentStep === 9 && (
            <div className="space-y-4">
              {einheiten.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-lg">
                  <p className="text-slate-500">
                    Keine Einheiten definiert. Bitte gehen Sie zurück zu Schritt 2 und geben Sie die Anzahl der Einheiten ein.
                  </p>
                </div>
              ) : (
                <>
                  {/* Header mit Buttons */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-800">
                      {einheiten.length} Einheit(en)
                    </h3>
                    <div className="flex gap-2">
                      <Button type="button" variant="secondary" size="sm" onClick={expandAll}>
                        Alle öffnen
                      </Button>
                      <Button type="button" variant="secondary" size="sm" onClick={collapseAll}>
                        Alle schließen
                      </Button>
                    </div>
                  </div>

                  {/* Einheiten-Liste */}
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {einheiten.map((einheit, index) => {
                      const isExpanded = expandedUnits.has(index);
                      const nutzungColor = einheit.nutzung === 'Wohnen' ? 'blue' : einheit.nutzung === 'Gewerbe' ? 'amber' : 'slate';

                      return (
                        <div key={index} className={`border rounded-lg p-3 bg-${nutzungColor}-50/50 border-${nutzungColor}-200`}>
                          {/* Header */}
                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => toggleExpanded(index)}
                              className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold bg-${nutzungColor}-100 text-${nutzungColor}-700`}>
                                {einheit.nutzung}
                              </span>
                              Einheit {index + 1}
                              {einheit.flaeche && einheit.kaltmiete && (
                                <span className="text-slate-500 font-normal">
                                  ({einheit.flaeche}m², {einheit.kaltmiete}€)
                                </span>
                              )}
                            </button>
                          </div>

                          {/* Basis-Felder (immer sichtbar) */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">Nutzung</label>
                              <select
                                value={einheit.nutzung}
                                onChange={(e) => updateEinheit(index, 'nutzung', e.target.value as 'Wohnen' | 'Gewerbe' | 'Stellplatz')}
                                className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg"
                              >
                                <option value="Wohnen">Wohnen</option>
                                <option value="Gewerbe">Gewerbe</option>
                                <option value="Stellplatz">Stellplatz</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">Fläche (m²)</label>
                              <input
                                type="number"
                                step="0.01"
                                value={einheit.flaeche || ''}
                                onChange={(e) => updateEinheit(index, 'flaeche', e.target.value ? Number(e.target.value) : null)}
                                className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">Kaltmiete (€)</label>
                              <input
                                type="number"
                                step="0.01"
                                value={einheit.kaltmiete || ''}
                                onChange={(e) => updateEinheit(index, 'kaltmiete', e.target.value ? Number(e.target.value) : null)}
                                className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">Vertragsart</label>
                              <select
                                value={einheit.mietvertragsart}
                                onChange={(e) => updateEinheit(index, 'mietvertragsart', e.target.value as 'Standard' | 'Index' | 'Staffel')}
                                className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg"
                              >
                                <option value="Standard">Standard</option>
                                <option value="Index">Index</option>
                                <option value="Staffel">Staffel</option>
                              </select>
                            </div>
                          </div>

                          {/* Erweiterte Felder */}
                          {isExpanded && (
                            <>
                              {/* Vertragsdaten */}
                              <div className="mt-4 pt-3 border-t border-slate-200">
                                <h5 className="text-xs font-semibold text-slate-500 mb-2">Vertragsdaten</h5>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                  <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Vertragsbeginn</label>
                                    <input
                                      type="date"
                                      value={einheit.vertragsbeginn || ''}
                                      onChange={(e) => updateEinheit(index, 'vertragsbeginn', e.target.value || null)}
                                      className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Marktmiete (€/m²)</label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={einheit.vergleichsmiete || ''}
                                      onChange={(e) => updateEinheit(index, 'vergleichsmiete', Number(e.target.value) || 12)}
                                      className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Letzte Erhöhung</label>
                                    <input
                                      type="date"
                                      value={einheit.letzte_mieterhoehung || ''}
                                      onChange={(e) => updateEinheit(index, 'letzte_mieterhoehung', e.target.value || null)}
                                      className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Höhe (€)</label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={einheit.hoehe_mieterhoehung || ''}
                                      onChange={(e) => updateEinheit(index, 'hoehe_mieterhoehung', e.target.value ? Number(e.target.value) : null)}
                                      className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* §558 BGB */}
                              <div className="mt-3 pt-3 border-t border-slate-200">
                                <h5 className="text-xs font-semibold text-slate-500 mb-2">§558 BGB - Vergleichsmiete</h5>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Datum §558</label>
                                    <input
                                      type="date"
                                      value={einheit.datum_558 || ''}
                                      onChange={(e) => updateEinheit(index, 'datum_558', e.target.value || null)}
                                      className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Höhe §558 (€)</label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={einheit.hoehe_558 || ''}
                                      onChange={(e) => updateEinheit(index, 'hoehe_558', e.target.value ? Number(e.target.value) : null)}
                                      className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* §559 BGB */}
                              <div className="mt-3 pt-3 border-t border-slate-200">
                                <h5 className="text-xs font-semibold text-slate-500 mb-2">§559 BGB - Modernisierung</h5>
                                <div className="grid grid-cols-3 gap-3">
                                  <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Datum §559</label>
                                    <input
                                      type="date"
                                      value={einheit.datum_559 || ''}
                                      onChange={(e) => updateEinheit(index, 'datum_559', e.target.value || null)}
                                      className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Art</label>
                                    <input
                                      type="text"
                                      placeholder="z.B. Dämmung"
                                      value={einheit.art_modernisierung_559 || ''}
                                      onChange={(e) => updateEinheit(index, 'art_modernisierung_559', e.target.value || null)}
                                      className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Höhe (€/Mon)</label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={einheit.hoehe_559 || ''}
                                      onChange={(e) => updateEinheit(index, 'hoehe_559', e.target.value ? Number(e.target.value) : null)}
                                      className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg"
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
                </>
              )}
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
