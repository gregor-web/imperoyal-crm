'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  GripVertical, Eye, EyeOff, Save, RotateCcw, Settings2,
  ChevronUp, ChevronDown, Loader2, Check, X,
} from 'lucide-react';
import type { PdfSectionItem, PdfConfig } from '@/lib/types';
import { DEFAULT_PDF_SECTIONS } from '@/lib/types';

interface PdfSectionConfiguratorProps {
  auswertungId: string;
  initialConfig: PdfConfig | null;
  onSaved?: () => void;
}

export function PdfSectionConfigurator({
  auswertungId,
  initialConfig,
  onSaved,
}: PdfSectionConfiguratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sections, setSections] = useState<PdfSectionItem[]>(
    () => initialConfig?.sections
      ? [...initialConfig.sections].sort((a, b) => a.order - b.order)
      : DEFAULT_PDF_SECTIONS.map(s => ({ ...s }))
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const toggleVisibility = useCallback((index: number) => {
    setSections(prev => {
      const next = [...prev];
      next[index] = { ...next[index], visible: !next[index].visible };
      return next;
    });
    setSaved(false);
  }, []);

  const moveUp = useCallback((index: number) => {
    if (index === 0) return;
    setSections(prev => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next.map((s, i) => ({ ...s, order: i }));
    });
    setSaved(false);
  }, []);

  const moveDown = useCallback((index: number) => {
    setSections(prev => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next.map((s, i) => ({ ...s, order: i }));
    });
    setSaved(false);
  }, []);

  const resetToDefault = useCallback(() => {
    setSections(DEFAULT_PDF_SECTIONS.map(s => ({ ...s })));
    setSaved(false);
  }, []);

  // Drag and Drop handlers
  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  }, []);

  const handleDragEnd = useCallback(() => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      setSections(prev => {
        const next = [...prev];
        const [dragged] = next.splice(draggedIndex, 1);
        next.splice(dragOverIndex, 0, dragged);
        return next.map((s, i) => ({ ...s, order: i }));
      });
      setSaved(false);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [draggedIndex, dragOverIndex]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const config: PdfConfig = {
        sections: sections.map((s, i) => ({ ...s, order: i })),
      };

      const response = await fetch(`/api/auswertung/${auswertungId}/pdf-config`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdf_config: config }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Fehler beim Speichern');
      }

      setSaved(true);
      onSaved?.();
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="secondary"
        size="sm"
        className="gap-2 bg-[#1E2A3A] border-white/[0.08] text-[#7A9BBD] hover:bg-[#253546] hover:text-[#EDF1F5]"
      >
        <Settings2 className="w-4 h-4" />
        PDF anpassen
      </Button>
    );
  }

  return (
    <div className="bg-[#1E2A3A] rounded-xl border border-white/[0.08] overflow-hidden shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#162636]/80 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-[#3D5167]" />
          <h3 className="text-sm font-bold text-[#EDF1F5]">PDF-Sektionen anpassen</h3>
        </div>
        <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/[0.05] rounded">
          <X className="w-4 h-4 text-[#6B8AAD]" />
        </button>
      </div>
      <div className="p-3">
        <p className="text-xs text-[#6B8AAD] mb-3">
          Sektionen per Drag & Drop verschieben oder mit den Pfeilen umsortieren.
          Sektionen ein-/ausblenden mit dem Auge-Symbol.
        </p>

        {/* Section List */}
        <div className="space-y-1">
          {sections.map((section, index) => (
            <div
              key={section.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg transition-all cursor-grab active:cursor-grabbing
                ${section.visible
                  ? 'bg-[#253546] border border-white/[0.08]'
                  : 'bg-[#1A2535] border border-white/[0.04] opacity-50'
                }
                ${dragOverIndex === index ? 'ring-2 ring-blue-500/50 bg-blue-500/10' : ''}
                ${draggedIndex === index ? 'opacity-30' : ''}
              `}
            >
              {/* Drag Handle */}
              <GripVertical className="w-4 h-4 text-[#3D5167] flex-shrink-0" />

              {/* Label */}
              <span className={`flex-1 text-sm ${section.visible ? 'text-[#EDF1F5]' : 'text-[#6B8AAD] line-through'}`}>
                {section.label}
              </span>

              {/* Move buttons */}
              <button
                onClick={() => moveUp(index)}
                disabled={index === 0}
                className="p-1 hover:bg-white/[0.05] rounded disabled:opacity-20"
              >
                <ChevronUp className="w-3.5 h-3.5 text-[#6B8AAD]" />
              </button>
              <button
                onClick={() => moveDown(index)}
                disabled={index === sections.length - 1}
                className="p-1 hover:bg-white/[0.05] rounded disabled:opacity-20"
              >
                <ChevronDown className="w-3.5 h-3.5 text-[#6B8AAD]" />
              </button>

              {/* Visibility Toggle */}
              <button
                onClick={() => toggleVisibility(index)}
                className="p-1 hover:bg-white/[0.05] rounded"
                title={section.visible ? 'Ausblenden' : 'Einblenden'}
              >
                {section.visible ? (
                  <Eye className="w-4 h-4 text-[#34C759]" />
                ) : (
                  <EyeOff className="w-4 h-4 text-[#6B8AAD]" />
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Actions */}
        {error && (
          <p className="text-xs text-red-400 mt-2">{error}</p>
        )}
        <div className="flex items-center gap-2 mt-4">
          <Button
            onClick={handleSave}
            disabled={saving}
            size="sm"
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Speichern...' : saved ? 'Gespeichert!' : 'Speichern & PDF aktualisieren'}
          </Button>
          <Button
            onClick={resetToDefault}
            variant="secondary"
            size="sm"
            className="gap-2 bg-transparent border-white/[0.08] text-[#7A9BBD] hover:bg-[#253546] hover:text-[#EDF1F5]"
          >
            <RotateCcw className="w-4 h-4" />
            Standard
          </Button>
        </div>
      </div>
    </div>
  );
}
