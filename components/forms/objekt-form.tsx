'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { objektSchema, type ObjektInput } from '@/lib/validators';
import { Input, Select, Button } from '@/components/ui';
import { OPTIONS } from '@/lib/types';

interface ObjektFormProps {
  defaultValues?: Partial<ObjektInput>;
  onSubmit: (data: ObjektInput) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  mandantId?: string;
}

export function ObjektForm({ defaultValues, onSubmit, onCancel, isLoading, mandantId }: ObjektFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
      {/* Adresse */}
      <section>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Adresse</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Straße *" {...register('strasse')} error={errors.strasse?.message} className="md:col-span-2" />
          <Input label="PLZ *" {...register('plz')} error={errors.plz?.message} />
          <Input label="Ort *" {...register('ort')} error={errors.ort?.message} className="md:col-span-3" />
        </div>
      </section>

      {/* Gebäudedaten */}
      <section>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Gebäudedaten</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select label="Gebäudetyp" options={OPTIONS.gebaeudetyp} {...register('gebaeudetyp')} placeholder="Auswählen..." />
          <Input label="Baujahr" type="number" {...register('baujahr')} error={errors.baujahr?.message} />
          <Input label="Kernsanierung (Jahr)" type="number" {...register('kernsanierung_jahr')} />
          <Input label="Wohneinheiten" type="number" {...register('wohneinheiten')} />
          <Input label="Gewerbeeinheiten" type="number" {...register('gewerbeeinheiten')} />
          <Input label="Geschosse" type="number" {...register('geschosse')} />
          <Select label="Denkmalschutz" options={booleanOptions} {...register('denkmalschutz')} />
          <Select label="Aufzug" options={booleanOptions} {...register('aufzug')} />
          <Select label="Heizungsart" options={OPTIONS.heizungsart} {...register('heizungsart')} placeholder="Auswählen..." />
        </div>
      </section>

      {/* Flächen */}
      <section>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Flächen</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Wohnfläche (m²)" type="number" step="0.01" {...register('wohnflaeche')} />
          <Input label="Gewerbefläche (m²)" type="number" step="0.01" {...register('gewerbeflaeche')} />
          <Input label="Grundstück (m²)" type="number" step="0.01" {...register('grundstueck')} />
        </div>
      </section>

      {/* Finanzierung */}
      <section>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Finanzierung</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Kaufpreis (€) *" type="number" {...register('kaufpreis')} error={errors.kaufpreis?.message} />
          <Input label="Kaufdatum" type="date" {...register('kaufdatum')} />
          <Input label="Darlehensstand (€)" type="number" {...register('darlehensstand')} />
          <Input label="Zinssatz (%)" type="number" step="0.1" {...register('zinssatz')} />
          <Input label="Tilgung (%)" type="number" step="0.1" {...register('tilgung')} />
          <Input label="Eigenkapital (%)" type="number" {...register('eigenkapital_prozent')} />
          <Input label="Grundstückswert (€)" type="number" {...register('grundstueck_wert')} />
          <Input label="Gebäudewert (€)" type="number" {...register('gebaeude_wert')} />
        </div>
      </section>

      {/* Bewirtschaftung */}
      <section>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Bewirtschaftung</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Leerstandsquote (%)" type="number" step="0.1" {...register('leerstandsquote')} />
          <Input label="BK nicht umlagefähig (€/Jahr)" type="number" {...register('betriebskosten_nicht_umlage')} />
          <Input label="Instandhaltung (€/Jahr)" type="number" {...register('instandhaltung')} />
          <Input label="Verwaltung (€/Jahr)" type="number" {...register('verwaltung')} />
          <Input label="Rücklagen (€/Jahr)" type="number" {...register('ruecklagen')} />
        </div>
      </section>

      {/* CAPEX */}
      <section>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">CAPEX / Investitionen</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Vergangene Investitionen (Beschreibung)" {...register('capex_vergangen')} />
          <Input label="Geplante Investitionen (Beschreibung)" {...register('capex_geplant')} />
          <Input label="Geplantes CAPEX-Budget (€)" type="number" {...register('capex_geplant_betrag')} />
        </div>
      </section>

      {/* Rechtliches */}
      <section>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Rechtliche Rahmenbedingungen</h3>
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <Select label="WEG aufgeteilt" options={booleanOptions} {...register('weg_aufgeteilt')} />
          <Select label="WEG geplant" options={booleanOptions} {...register('weg_geplant')} />
          <Select label="Milieuschutz" options={booleanOptions} {...register('milieuschutz')} />
          <Select label="Umwandlungsverbot" options={booleanOptions} {...register('umwandlungsverbot')} />
          <Select label="Mietpreisbindung" options={booleanOptions} {...register('mietpreisbindung')} />
          <Select label="Sozialbindung" options={booleanOptions} {...register('sozialbindung')} />
          <Select label="Modernisierungsstopp" options={booleanOptions} {...register('modernisierungsstopp')} />
          <Select label="Gewerbe-Sonderklauseln" options={booleanOptions} {...register('gewerbe_sonderklauseln')} />
        </div>
      </section>

      {/* Strategie */}
      <section>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Strategie</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label="Haltedauer" options={OPTIONS.haltedauer} {...register('haltedauer')} placeholder="Auswählen..." />
          <Select label="Primäres Ziel" options={OPTIONS.primaeresziel} {...register('primaeres_ziel')} placeholder="Auswählen..." />
          <Select label="Risikoprofil" options={OPTIONS.risikoprofil} {...register('risikoprofil')} placeholder="Auswählen..." />
          <Input label="Investitionsbereitschaft" {...register('investitionsbereitschaft')} />
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-slate-200">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} className="w-full sm:w-auto">
            Abbrechen
          </Button>
        )}
        <Button type="submit" loading={isLoading} className="w-full sm:w-auto">
          Speichern
        </Button>
      </div>
    </form>
  );
}
