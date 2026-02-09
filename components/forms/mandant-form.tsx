'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { mandantSchema, type MandantInput } from '@/lib/validators';
import { Input, Select, Button } from '@/components/ui';
import { OPTIONS } from '@/lib/types';

interface MandantFormProps {
  defaultValues?: Partial<MandantInput>;
  onSubmit: (data: MandantInput) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function MandantForm({ defaultValues, onSubmit, onCancel, isLoading }: MandantFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MandantInput>({
    resolver: zodResolver(mandantSchema),
    defaultValues: {
      land: 'Deutschland',
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Firma */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Firmenname *"
          {...register('name')}
          error={errors.name?.message}
        />
        <Input
          label="E-Mail *"
          type="email"
          {...register('email')}
          error={errors.email?.message}
        />
      </div>

      {/* Ansprechpartner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Ansprechpartner"
          {...register('ansprechpartner')}
          error={errors.ansprechpartner?.message}
        />
        <Input
          label="Position"
          {...register('position')}
          error={errors.position?.message}
        />
      </div>

      {/* Kontakt */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Telefon"
          {...register('telefon')}
          error={errors.telefon?.message}
        />
        <Select
          label="Bevorzugte Kontaktart"
          options={OPTIONS.kontaktart}
          {...register('kontaktart')}
          error={errors.kontaktart?.message}
          placeholder="Auswählen..."
        />
      </div>

      {/* Adresse */}
      <div className="border-t border-slate-200 pt-6">
        <h3 className="text-sm font-medium text-slate-700 mb-4">Adresse</h3>
        <div className="space-y-4">
          <Input
            label="Straße"
            {...register('strasse')}
            error={errors.strasse?.message}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="PLZ"
              {...register('plz')}
              error={errors.plz?.message}
            />
            <Input
              label="Ort"
              {...register('ort')}
              error={errors.ort?.message}
              className="md:col-span-2"
            />
          </div>
          <Select
            label="Land"
            options={OPTIONS.laender}
            {...register('land')}
            error={errors.land?.message}
          />
        </div>
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
