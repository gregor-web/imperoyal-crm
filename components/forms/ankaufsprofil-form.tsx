'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ankaufsprofilSchema, type AnkaufsprofilInput } from '@/lib/validators';
import { Input, Select, Button } from '@/components/ui';
import { OPTIONS } from '@/lib/types';

interface Mandant {
  id: string;
  name: string;
}

interface AnkaufsprofilFormProps {
  defaultValues?: Partial<AnkaufsprofilInput>;
  onSubmit: (data: AnkaufsprofilInput) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  mandantId?: string;
  mandanten?: Mandant[];
  showMandantSelect?: boolean;
}

export function AnkaufsprofilForm({ defaultValues, onSubmit, onCancel, isLoading, mandantId, mandanten, showMandantSelect }: AnkaufsprofilFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<AnkaufsprofilInput>({
    resolver: zodResolver(ankaufsprofilSchema) as any,
    defaultValues: {
      mandant_id: mandantId,
      assetklassen: [],
      ...defaultValues,
    },
  });

  const selectedAssetklassen = watch('assetklassen') || [];

  const toggleAssetklasse = (assetklasse: string) => {
    const current = selectedAssetklassen;
    const updated = current.includes(assetklasse)
      ? current.filter((a) => a !== assetklasse)
      : [...current, assetklasse];
    setValue('assetklassen', updated);
  };

  const handleFormSubmit = async (data: AnkaufsprofilInput) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Mandant Selection (Admin only) */}
      {showMandantSelect && mandanten && (
        <Select
          label="Mandant *"
          placeholder="Mandant wählen..."
          options={mandanten.map((m) => ({ value: m.id, label: m.name }))}
          {...register('mandant_id')}
          error={errors.mandant_id?.message}
        />
      )}

      {/* Name */}
      <Input
        label="Profilname *"
        placeholder="z.B. Core-Portfolio Deutschland"
        {...register('name')}
        error={errors.name?.message}
      />

      {/* Volumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Min. Volumen (€)"
          type="number"
          placeholder="z.B. 1000000"
          {...register('min_volumen')}
          error={errors.min_volumen?.message}
        />
        <Input
          label="Max. Volumen (€)"
          type="number"
          placeholder="z.B. 10000000"
          {...register('max_volumen')}
          error={errors.max_volumen?.message}
        />
      </div>

      {/* Assetklassen */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Assetklassen
        </label>
        <div className="flex flex-wrap gap-2">
          {OPTIONS.assetklassen.map((assetklasse) => (
            <button
              key={assetklasse}
              type="button"
              onClick={() => toggleAssetklasse(assetklasse)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedAssetklassen.includes(assetklasse)
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {assetklasse}
            </button>
          ))}
        </div>
      </div>

      {/* Regionen */}
      <Input
        label="Regionen"
        placeholder="z.B. München, Berlin, Hamburg"
        {...register('regionen')}
        error={errors.regionen?.message}
        hint="Kommagetrennte Liste von Städten oder Regionen"
      />

      {/* Rendite */}
      <Input
        label="Mindestrendite (%)"
        type="number"
        step="0.1"
        placeholder="z.B. 4.5"
        {...register('rendite_min')}
        error={errors.rendite_min?.message}
      />

      {/* Sonstiges */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Sonstige Anforderungen
        </label>
        <textarea
          {...register('sonstiges')}
          rows={3}
          className="glass-input w-full px-4 py-2.5 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Weitere Kriterien oder Anmerkungen..."
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Abbrechen
          </Button>
        )}
        <Button type="submit" loading={isLoading}>
          Speichern
        </Button>
      </div>
    </form>
  );
}
