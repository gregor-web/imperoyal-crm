'use client';

import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { einheitSchema } from '@/lib/validators';
import { Input, Select, Button } from '@/components/ui';
import { OPTIONS, type Einheit } from '@/lib/types';
import { Plus, Trash2 } from 'lucide-react';

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
      letzte_mieterhoehung: null,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800">Einheiten ({fields.length})</h3>
        <Button type="button" variant="secondary" size="sm" onClick={addEinheit}>
          <Plus className="w-4 h-4 mr-1" />
          Einheit hinzufügen
        </Button>
      </div>

      {/* Einheiten Liste */}
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="glass-card rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-700">Einheit {index + 1}</span>
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
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
                label="Kaltmiete (€)"
                type="number"
                step="0.01"
                {...register(`einheiten.${index}.kaltmiete`)}
                error={errors.einheiten?.[index]?.kaltmiete?.message}
              />
              <Input
                label="Vergleichsmiete (€/m²)"
                type="number"
                step="0.01"
                {...register(`einheiten.${index}.vergleichsmiete`)}
                error={errors.einheiten?.[index]?.vergleichsmiete?.message}
              />
              <Select
                label="Vertragsart"
                options={OPTIONS.mietvertragsart}
                {...register(`einheiten.${index}.mietvertragsart`)}
                error={errors.einheiten?.[index]?.mietvertragsart?.message}
              />
              <Input
                label="Letzte Erhöhung"
                type="date"
                {...register(`einheiten.${index}.letzte_mieterhoehung`)}
                error={errors.einheiten?.[index]?.letzte_mieterhoehung?.message}
              />
            </div>
          </div>
        ))}
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
