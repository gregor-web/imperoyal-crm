'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ankaufsprofilSchema, type AnkaufsprofilInput } from '@/lib/validators';
import { Input, Select, Button } from '@/components/ui';
import { OPTIONS } from '@/lib/types';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

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
  compact?: boolean; // Für Onboarding-Integration
}

// Wiederverwendbare Multi-Select Chip Component
function MultiSelectChips({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: readonly string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}) {
  const toggle = (option: string) => {
    const updated = selected.includes(option)
      ? selected.filter((s) => s !== option)
      : [...selected, option];
    onChange(updated);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-[#1E2A3A] mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selected.includes(option)
                ? 'bg-[#1E2A3A] text-white'
                : 'bg-[#EDF1F5] text-[#1E2A3A] hover:bg-[#D5DEE6]'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

// Collapsible Section Component
function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-[#D5DEE6] rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-[#EDF1F5] flex items-center justify-between text-left hover:bg-[#D5DEE6] transition-colors"
      >
        <span className="font-semibold text-[#1E2A3A]">{title}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-[#5B7A9D]" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[#5B7A9D]" />
        )}
      </button>
      {isOpen && <div className="p-4 space-y-4">{children}</div>}
    </div>
  );
}

export function AnkaufsprofilForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading,
  mandantId,
  mandanten,
  showMandantSelect,
  compact = false,
}: AnkaufsprofilFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AnkaufsprofilInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(ankaufsprofilSchema) as any,
    defaultValues: {
      mandant_id: mandantId,
      kaufinteresse_aktiv: true,
      assetklassen: [],
      lagepraeferenz: [],
      zustand: [],
      ausgeschlossene_partner: false,
      ...defaultValues,
    },
  });

  const selectedAssetklassen = watch('assetklassen') || [];
  const selectedLagepraeferenz = watch('lagepraeferenz') || [];
  const selectedZustand = watch('zustand') || [];
  const ausgeschlossenePartner = watch('ausgeschlossene_partner');
  const kaufinteresseAktiv = watch('kaufinteresse_aktiv');

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

      {/* Profilname */}
      <Input
        label="Profilname *"
        placeholder="z.B. Core-Portfolio Deutschland"
        {...register('name')}
        error={errors.name?.message}
      />

      {/* 2.1 Allgemeine Ankaufsparameter */}
      <Section title="2.1 Allgemeine Ankaufsparameter" defaultOpen={!compact}>
        {/* Kaufinteresse aktiv */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-[#1E2A3A]">Kaufinteresse aktiv?</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={kaufinteresseAktiv === true}
                onChange={() => setValue('kaufinteresse_aktiv', true)}
                className="w-4 h-4 text-[#5B7A9D]"
              />
              <span className="text-sm">Ja</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={kaufinteresseAktiv === false}
                onChange={() => setValue('kaufinteresse_aktiv', false)}
                className="w-4 h-4 text-[#5B7A9D]"
              />
              <span className="text-sm">Nein</span>
            </label>
          </div>
        </div>

        {/* Assetklassen */}
        <MultiSelectChips
          label="Bevorzugte Assetklassen"
          options={OPTIONS.assetklassen}
          selected={selectedAssetklassen}
          onChange={(selected) => setValue('assetklassen', selected)}
        />
      </Section>

      {/* 2.2 Standortprofil */}
      <Section title="2.2 Standortprofil" defaultOpen={!compact}>
        {/* Regionen */}
        <div>
          <label className="block text-sm font-medium text-[#1E2A3A] mb-1">
            Bevorzugte Städte/Regionen
          </label>
          <textarea
            {...register('regionen')}
            rows={2}
            className="glass-input w-full px-4 py-2.5 rounded-lg text-[#1E2A3A] placeholder-[#9EAFC0] focus:outline-none focus:ring-2 focus:ring-[#5B7A9D]"
            placeholder="z.B. München, Berlin, Hamburg, Rhein-Main-Gebiet..."
          />
        </div>

        {/* Lagepräferenz */}
        <MultiSelectChips
          label="Lagepräferenz"
          options={OPTIONS.lagepraeferenz}
          selected={selectedLagepraeferenz}
          onChange={(selected) => setValue('lagepraeferenz', selected)}
        />
      </Section>

      {/* 2.3 Finanzielle Ankaufsparameter */}
      <Section title="2.3 Finanzielle Ankaufsparameter" defaultOpen={!compact}>
        {/* Volumen */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Mindestinvestitionsvolumen (EUR)"
            type="number"
            placeholder="z.B. 1000000"
            {...register('min_volumen')}
            error={errors.min_volumen?.message}
          />
          <Input
            label="Maximalvolumen (EUR)"
            type="number"
            placeholder="z.B. 10000000"
            {...register('max_volumen')}
            error={errors.max_volumen?.message}
          />
        </div>

        {/* Kaufpreisfaktor */}
        <Input
          label="Bevorzugter Kaufpreisfaktor (Multiplikator)"
          type="number"
          step="0.1"
          placeholder="z.B. 20"
          {...register('kaufpreisfaktor')}
          error={errors.kaufpreisfaktor?.message}
          hint="Kaufpreis / Jahresmiete"
        />

        {/* Renditen */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Zielrendite IST (%)"
            type="number"
            step="0.1"
            placeholder="z.B. 4.5"
            {...register('rendite_min')}
            error={errors.rendite_min?.message}
            hint="Aktuelle Anfangsrendite"
          />
          <Input
            label="Zielrendite SOLL (%)"
            type="number"
            step="0.1"
            placeholder="z.B. 5.5"
            {...register('rendite_soll')}
            error={errors.rendite_soll?.message}
            hint="Nach Optimierung"
          />
        </div>

        {/* Finanzierungsform */}
        <Select
          label="Finanzierungsform"
          placeholder="Bitte wählen..."
          options={OPTIONS.finanzierungsform.map((f) => ({ value: f, label: f }))}
          {...register('finanzierungsform')}
          error={errors.finanzierungsform?.message}
        />
      </Section>

      {/* 2.4 Objektspezifische Kriterien */}
      <Section title="2.4 Objektspezifische Kriterien" defaultOpen={!compact}>
        {/* Zustand */}
        <MultiSelectChips
          label="Zustand"
          options={OPTIONS.zustand}
          selected={selectedZustand}
          onChange={(selected) => setValue('zustand', selected)}
        />

        {/* Baujahr */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Baujahr von"
            type="number"
            placeholder="z.B. 1950"
            {...register('baujahr_von')}
            error={errors.baujahr_von?.message}
          />
          <Input
            label="Baujahr bis"
            type="number"
            placeholder="z.B. 2020"
            {...register('baujahr_bis')}
            error={errors.baujahr_bis?.message}
          />
        </div>

        {/* Flächen */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Minimale Wohnfläche (m²)"
            type="number"
            placeholder="z.B. 500"
            {...register('min_wohnflaeche')}
            error={errors.min_wohnflaeche?.message}
          />
          <Input
            label="Minimale Gewerbefläche (m²)"
            type="number"
            placeholder="z.B. 200"
            {...register('min_gewerbeflaeche')}
            error={errors.min_gewerbeflaeche?.message}
          />
        </div>

        {/* Einheiten */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Mindestanzahl Wohneinheiten"
            type="number"
            placeholder="z.B. 6"
            {...register('min_wohneinheiten')}
            error={errors.min_wohneinheiten?.message}
          />
          <Input
            label="Mindestanzahl Gewerbeeinheiten"
            type="number"
            placeholder="z.B. 1"
            {...register('min_gewerbeeinheiten')}
            error={errors.min_gewerbeeinheiten?.message}
          />
        </div>

        {/* Grundstück */}
        <Input
          label="Mindestgrundstücksgröße (m²)"
          type="number"
          placeholder="z.B. 1000"
          {...register('min_grundstueck')}
          error={errors.min_grundstueck?.message}
        />
      </Section>

      {/* 2.5 Zusätzliche Angaben */}
      <Section title="2.5 Zusätzliche Angaben" defaultOpen={!compact}>
        {/* Ausgeschlossene Partner */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-[#1E2A3A]">
              Ausgeschlossene Partner / Makler?
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={ausgeschlossenePartner === true}
                  onChange={() => setValue('ausgeschlossene_partner', true)}
                  className="w-4 h-4 text-[#5B7A9D]"
                />
                <span className="text-sm">Ja</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={ausgeschlossenePartner === false}
                  onChange={() => setValue('ausgeschlossene_partner', false)}
                  className="w-4 h-4 text-[#5B7A9D]"
                />
                <span className="text-sm">Nein</span>
              </label>
            </div>
          </div>

          {ausgeschlossenePartner && (
            <div>
              <label className="block text-sm font-medium text-[#1E2A3A] mb-1">
                Liste ausgeschlossener Partner
              </label>
              <textarea
                {...register('ausgeschlossene_partner_liste')}
                rows={2}
                className="glass-input w-full px-4 py-2.5 rounded-lg text-[#1E2A3A] placeholder-[#9EAFC0] focus:outline-none focus:ring-2 focus:ring-[#5B7A9D]"
                placeholder="Namen der ausgeschlossenen Partner/Makler..."
              />
            </div>
          )}
        </div>

        {/* Besondere Bedingungen */}
        <div>
          <label className="block text-sm font-medium text-[#1E2A3A] mb-1">
            Besondere Bedingungen / Präferenzen
          </label>
          <textarea
            {...register('sonstiges')}
            rows={3}
            className="glass-input w-full px-4 py-2.5 rounded-lg text-[#1E2A3A] placeholder-[#9EAFC0] focus:outline-none focus:ring-2 focus:ring-[#5B7A9D]"
            placeholder="Weitere Kriterien oder Anmerkungen..."
          />
        </div>

        {/* Weitere Projektarten */}
        <Input
          label="Weitere Projektarten"
          placeholder="z.B. ESG, CO₂-Reduzierung, Redevelopment..."
          {...register('weitere_projektarten')}
          error={errors.weitere_projektarten?.message}
          hint="ESG, CO₂, Redevelopment etc."
        />
      </Section>

      {/* Actions */}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-[#D5DEE6]">
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
