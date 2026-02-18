'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  GripVertical, Eye, EyeOff, Save, RotateCcw, Loader2, Check,
  ChevronUp, ChevronDown, ArrowLeft, RefreshCw, FileText, ZoomIn, ZoomOut,
} from 'lucide-react';
import type { PdfSectionItem, PdfConfig } from '@/lib/types';
import { DEFAULT_PDF_SECTIONS } from '@/lib/types';

interface PdfEditorViewProps {
  auswertungId: string;
  initialConfig: PdfConfig | null;
  objektLabel: string;
  mandantName: string;
}

export function PdfEditorView({
  auswertungId,
  initialConfig,
  objektLabel,
  mandantName,
}: PdfEditorViewProps) {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [sections, setSections] = useState<PdfSectionItem[]>(
    () => initialConfig?.sections
      ? [...initialConfig.sections].sort((a, b) => a.order - b.order)
      : DEFAULT_PDF_SECTIONS.map(s => ({ ...s }))
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(100);

  // ─── Section manipulation ───

  const toggleVisibility = useCallback((index: number) => {
    setSections(prev => {
      const next = [...prev];
      next[index] = { ...next[index], visible: !next[index].visible };
      return next;
    });
    setHasChanges(true);
    setSaved(false);
  }, []);

  const moveUp = useCallback((index: number) => {
    if (index === 0) return;
    setSections(prev => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next.map((s, i) => ({ ...s, order: i }));
    });
    setHasChanges(true);
    setSaved(false);
  }, []);

  const moveDown = useCallback((index: number) => {
    setSections(prev => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next.map((s, i) => ({ ...s, order: i }));
    });
    setHasChanges(true);
    setSaved(false);
  }, []);

  const resetToDefault = useCallback(() => {
    setSections(DEFAULT_PDF_SECTIONS.map(s => ({ ...s })));
    setHasChanges(true);
    setSaved(false);
  }, []);

  // ─── Drag and Drop ───

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
      setHasChanges(true);
      setSaved(false);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [draggedIndex, dragOverIndex]);

  // ─── Save config to DB ───

  const saveConfig = async (): Promise<boolean> => {
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

    return true;
  };

  // ─── Generate PDF preview ───

  const generatePreview = async () => {
    setPdfLoading(true);
    setError(null);

    try {
      // First save config
      await saveConfig();
      setHasChanges(false);

      // Then fetch PDF
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);

      const response = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auswertung_id: auswertungId }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = 'Fehler bei PDF-Generierung';
        try {
          const data = await response.json();
          errorMessage = data.error || errorMessage;
        } catch {
          errorMessage = `HTTP ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      if (blob.size === 0) throw new Error('PDF ist leer');

      // Revoke old URL
      if (pdfUrl) window.URL.revokeObjectURL(pdfUrl);

      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setPdfLoading(false);
    }
  };

  // ─── Save only (without preview) ───

  const handleSaveOnly = async () => {
    setSaving(true);
    setError(null);
    try {
      await saveConfig();
      setHasChanges(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setSaving(false);
    }
  };

  const visibleCount = sections.filter(s => s.visible).length;
  const hiddenCount = sections.length - visibleCount;

  return (
    <div className="fixed inset-0 z-50 bg-[#0F1A25] flex flex-col">
      {/* ===== TOP BAR ===== */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#162636] border-b border-white/[0.08] flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/auswertungen/${auswertungId}`)}
            className="p-1.5 hover:bg-white/[0.06] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#6B8AAD]" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-[#EDF1F5]">PDF-Editor</h1>
            <p className="text-xs text-[#6B8AAD]">{objektLabel} · {mandantName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasChanges && (
            <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">
              Ungespeicherte Änderungen
            </span>
          )}
          <Button
            onClick={handleSaveOnly}
            disabled={saving || !hasChanges}
            size="sm"
            variant="secondary"
            className="gap-1.5"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Speichern
          </Button>
          <Button
            onClick={generatePreview}
            disabled={pdfLoading}
            size="sm"
            className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {pdfLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            {pdfLoading ? 'Generiere...' : 'Vorschau aktualisieren'}
          </Button>
        </div>
      </div>

      {/* ===== SPLIT VIEW ===== */}
      <div className="flex flex-1 overflow-hidden">
        {/* ─── LEFT PANEL: Section Configurator ─── */}
        <div className="w-80 flex-shrink-0 bg-[#1E2A3A] border-r border-white/[0.08] flex flex-col overflow-hidden">
          {/* Panel Header */}
          <div className="px-4 py-3 border-b border-white/[0.08] bg-[#162636]/60">
            <h2 className="text-sm font-bold text-[#EDF1F5] mb-1">Sektionen</h2>
            <p className="text-xs text-[#6B8AAD]">
              {visibleCount} sichtbar{hiddenCount > 0 ? `, ${hiddenCount} ausgeblendet` : ''}
            </p>
          </div>

          {/* Section List (scrollable) */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {sections.map((section, index) => (
              <div
                key={section.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`
                  flex items-center gap-1.5 px-2 py-2 rounded-lg transition-all cursor-grab active:cursor-grabbing select-none
                  ${section.visible
                    ? 'bg-[#253546]/80 border border-white/[0.08]'
                    : 'bg-[#1A2535]/60 border border-white/[0.04] opacity-50'
                  }
                  ${dragOverIndex === index ? 'ring-2 ring-blue-500/50 bg-blue-500/10' : ''}
                  ${draggedIndex === index ? 'opacity-20 scale-95' : ''}
                  hover:bg-[#253546]
                `}
              >
                <GripVertical className="w-3.5 h-3.5 text-[#3D5167] flex-shrink-0" />

                <span className={`flex-1 text-xs leading-tight ${section.visible ? 'text-[#EDF1F5]' : 'text-[#6B8AAD] line-through'}`}>
                  {section.label}
                </span>

                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="p-0.5 hover:bg-white/[0.06] rounded disabled:opacity-20"
                  >
                    <ChevronUp className="w-3 h-3 text-[#6B8AAD]" />
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === sections.length - 1}
                    className="p-0.5 hover:bg-white/[0.06] rounded disabled:opacity-20"
                  >
                    <ChevronDown className="w-3 h-3 text-[#6B8AAD]" />
                  </button>
                  <button
                    onClick={() => toggleVisibility(index)}
                    className="p-0.5 hover:bg-white/[0.06] rounded ml-1"
                    title={section.visible ? 'Ausblenden' : 'Einblenden'}
                  >
                    {section.visible ? (
                      <Eye className="w-3.5 h-3.5 text-[#34C759]" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-[#6B8AAD]" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Panel Footer */}
          <div className="px-3 py-3 border-t border-white/[0.08] bg-[#162636]/60 space-y-2">
            {error && (
              <p className="text-xs text-red-400 bg-red-400/10 rounded px-2 py-1">{error}</p>
            )}
            {saved && (
              <p className="text-xs text-[#34C759] bg-[#34C759]/10 rounded px-2 py-1 flex items-center gap-1">
                <Check className="w-3 h-3" /> Gespeichert
              </p>
            )}
            <Button
              onClick={resetToDefault}
              variant="ghost"
              size="sm"
              className="w-full gap-1.5 text-[#6B8AAD] hover:text-[#EDF1F5]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Standard wiederherstellen
            </Button>
          </div>
        </div>

        {/* ─── RIGHT PANEL: PDF Preview ─── */}
        <div className="flex-1 bg-[#0B1320] flex flex-col overflow-hidden">
          {/* Preview Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#162636]/40 border-b border-white/[0.08] flex-shrink-0">
            <div className="flex items-center gap-2 text-xs text-[#6B8AAD]">
              <FileText className="w-3.5 h-3.5" />
              <span>PDF-Vorschau</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoom(z => Math.max(50, z - 25))}
                className="p-1 hover:bg-white/[0.06] rounded"
                title="Verkleinern"
              >
                <ZoomOut className="w-3.5 h-3.5 text-[#6B8AAD]" />
              </button>
              <span className="text-xs text-[#6B8AAD] w-10 text-center">{zoom}%</span>
              <button
                onClick={() => setZoom(z => Math.min(200, z + 25))}
                className="p-1 hover:bg-white/[0.06] rounded"
                title="Vergrößern"
              >
                <ZoomIn className="w-3.5 h-3.5 text-[#6B8AAD]" />
              </button>
              <button
                onClick={() => setZoom(100)}
                className="p-1 hover:bg-white/[0.06] rounded ml-1 text-xs text-[#6B8AAD]"
              >
                100%
              </button>
            </div>
          </div>

          {/* PDF Viewer */}
          <div className="flex-1 overflow-auto flex items-start justify-center p-4">
            {pdfLoading ? (
              <div className="flex flex-col items-center justify-center gap-4 mt-32">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                <p className="text-sm text-[#6B8AAD]">PDF wird generiert...</p>
                <p className="text-xs text-[#3D5167]">Das kann einige Sekunden dauern</p>
              </div>
            ) : pdfUrl ? (
              <iframe
                ref={iframeRef}
                src={pdfUrl}
                className="bg-white rounded shadow-2xl"
                style={{
                  width: `${595 * (zoom / 100)}px`,
                  height: `${842 * (zoom / 100) * 2}px`,
                  minHeight: '80vh',
                  border: 'none',
                  transform: `scale(1)`,
                  transformOrigin: 'top center',
                }}
                title="PDF-Vorschau"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 mt-32 text-center max-w-sm">
                <div className="w-16 h-16 rounded-2xl bg-[#1E2A3A] border border-white/[0.08] flex items-center justify-center">
                  <FileText className="w-8 h-8 text-[#3D5167]" />
                </div>
                <h3 className="text-lg font-bold text-[#EDF1F5]">PDF-Vorschau</h3>
                <p className="text-sm text-[#6B8AAD]">
                  Passe die Sektionen links an und klicke dann auf
                  <span className="text-blue-400 font-medium"> &quot;Vorschau aktualisieren&quot;</span>,
                  um das PDF mit deinen Änderungen zu sehen.
                </p>
                <Button
                  onClick={generatePreview}
                  disabled={pdfLoading}
                  className="gap-2 bg-blue-600 hover:bg-blue-700 text-white mt-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Vorschau laden
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
