'use client';

import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { einheitSchema } from '@/lib/validators';
import { Input, Select, Button } from '@/components/ui';
import { OPTIONS, type Einheit } from '@/lib/types';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

const einheitenFormSchema = z.object({
  einheiten: z.array(einheitSchema),
});

type EinheitenFormData = z.infer<typeof einheitenFormSchema>;

interface EinheitenFormProps {
  objektId: string;
  defaultValues?: Einheit[];
  onSubmit: (data: Einheit[]) => Promise<void>;
  isLoading?: boolean;
}

export function EinheitenForm({ objektId, defaultValues = [], onSubmit, isLoading }: EinheitenFormProps) {
  const [expandedUnits, setExpandedUnits] = useState<Set<number>>(new Set());

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<EinheitenFormData>({
    resolver: zodResolver(einheitenFormSchema) as any,
    defaultValues: {
      einheiten: defaultValues.length > 0
        ? defaultValues.map((e, i) => ({ ...e, position: e.position || i + 1 }))
        : [{ position: 1, nutzung: 'Wohnen' as const, vergleichsmiete: 12, mietvertragsart: 'Standard' as const }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'einheiten',
  });

  const handleFormSubmit = async (data: EinheitenFormData) => {
    const einheitenWithObjektId = data.einheiten.map((e, i) => ({
      ...e,
      objekt_id: objektId,
      position: i + 1,
    })) as Einheit[];
    await onSubmit(einheitenWithObjektId);
  };

  const addEinheit = () => {
    append({
      position: fields.length + 1,
      nutzung: 'Wohnen',
      flaeche: null,
      kaltmiete: null,
      vergleichsmiete: 12,
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
  };

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedUnits);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedUnits(newExpanded);
  };

  const expandAll = () => {
    setExpandedUnits(new Set(fields.map((_, i) => i)));
  };

  const collapseAll = () => {
    setExpandedUnits(new Set());
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h3 className="text-lg font-semibold text-slate-800">Einheiten ({fields.length})</h3>
        <div className="flex flex-wrap gap-2">
          {fields.length > 0 && (
            <>
              <Button type="button" variant="secondary" size="sm" onClick={expandAll}>
                Alle öffnen
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={collapseAll}>
                Alle schließen
              </Button>
            </>
          )}
          <Button type="button" variant="secondary" size="sm" onClick={addEinheit}>
            <Plus className="w-4 h-4 mr-1" />
            Einheit hinzufügen
          </Button>
        </div>
      </div>

      {/* Einheiten Liste */}
      <div className="space-y-4">
        {fields.map((field, index) => {
          const isExpanded = expandedUnits.has(index);

          return (
            <div key={field.id} className="glass-card rounded-lg p-4">
              {/* Kompakte Kopfzeile */}
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  onClick={() => toggleExpanded(index)}
                  className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  Einheit {index + 1}
                </button>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Basis-Felder (immer sichtbar) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <Select
                  label="Nutzung"
                  options={OPTIONS.nutzung}
                  {...register(`einheiten.${index}.nutzung`)}
                  error={errors.einheiten?.[index]?.nutzung?.message}
                />
                <Input
                  label="Fläche (m²)"
                  type="number"
                  step="0.01"
                  {...register(`einheiten.${index}.flaeche`)}
                  error={errors.einheiten?.[index]?.flaeche?.message}
                />
                <Input
                  label="Kaltmiete aktuell (€)"
                  type="number"
                  step="0.01"
                  {...register(`einheiten.${index}.kaltmiete`)}
                  error={errors.einheiten?.[index]?.kaltmiete?.message}
                />
                <Select
                  label="Mietvertragsart"
                  options={OPTIONS.mietvertragsart}
                  {...register(`einheiten.${index}.mietvertragsart`)}
                  error={errors.einheiten?.[index]?.mietvertragsart?.message}
                />
              </div>

              {/* Erweiterte Felder (nur wenn aufgeklappt) */}
              {isExpanded && (
                <>
                  {/* Vertragsdaten */}
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <h4 className="text-sm font-medium text-slate-600 mb-3">Vertragsdaten</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      <Input
                        label="Vertragsbeginn"
                        type="date"
                        {...register(`einheiten.${index}.vertragsbeginn`)}
                        error={errors.einheiten?.[index]?.vertragsbeginn?.message}
                      />
                      <Input
                        label="Marktmiete (€/m²)"
                        type="number"
                        step="0.01"
                        {...register(`einheiten.${index}.vergleichsmiete`)}
                        error={errors.einheiten?.[index]?.vergleichsmiete?.message}
                      />
                      <Input
                        label="Letzte Mieterhöhung"
                        type="date"
                        {...register(`einheiten.${index}.letzte_mieterhoehung`)}
                        error={errors.einheiten?.[index]?.letzte_mieterhoehung?.message}
                      />
                      <Input
                        label="Höhe Mieterhöhung (€)"
                        type="number"
                        step="0.01"
                        {...register(`einheiten.${index}.hoehe_mieterhoehung`)}
                        error={errors.einheiten?.[index]?.hoehe_mieterhoehung?.message}
                      />
                    </div>
                  </div>

                  {/* §558 BGB */}
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <h4 className="text-sm font-medium text-slate-600 mb-3">§558 BGB - Mieterhöhung bis zur ortsüblichen Vergleichsmiete</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <Input
                        label="Datum letzte Erhöhung §558"
                        type="date"
                        {...register(`einheiten.${index}.datum_558`)}
                        error={errors.einheiten?.[index]?.datum_558?.message}
                      />
                      <Input
                        label="Höhe §558 (€)"
                        type="number"
                        step="0.01"
                        {...register(`einheiten.${index}.hoehe_558`)}
                        error={errors.einheiten?.[index]?.hoehe_558?.message}
                      />
                    </div>
                  </div>

                  {/* §559 BGB */}
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <h4 className="text-sm font-medium text-slate-600 mb-3">§559 BGB - Modernisierungsumlage</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <Input
                        label="Datum letzte Erhöhung §559"
                        type="date"
                        {...register(`einheiten.${index}.datum_559`)}
                        error={errors.einheiten?.[index]?.datum_559?.message}
                      />
                      <Input
                        label="Art der Modernisierung"
                        placeholder="z.B. Fassadendämmung"
                        {...register(`einheiten.${index}.art_modernisierung_559`)}
                        error={errors.einheiten?.[index]?.art_modernisierung_559?.message}
                      />
                      <Input
                        label="Höhe §559 (€/Monat)"
                        type="number"
                        step="0.01"
                        {...register(`einheiten.${index}.hoehe_559`)}
                        error={errors.einheiten?.[index]?.hoehe_559?.message}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-4">
        <Button type="submit" loading={isLoading}>
          Einheiten speichern
        </Button>
      </div>
    </form>
  );
}
