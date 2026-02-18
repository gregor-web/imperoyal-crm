'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  GripVertical, Eye, EyeOff, RotateCcw, Loader2, Check,
  ChevronUp, ChevronDown, ArrowLeft, RefreshCw, Download,
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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const isFirstRender = useRef(true);

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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // ─── Auto-save & auto-refresh on section changes (debounced 1.5s) ───
  useEffect(() => {
    // Skip auto-refresh on initial render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Clear previous debounce
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      saveAndRefresh();
    }, 1500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections]);

  // Load PDF preview on mount
  useEffect(() => {
    if (!initialLoadDone) {
      setInitialLoadDone(true);
      loadPreview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (pdfUrl) window.URL.revokeObjectURL(pdfUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Section manipulation ───

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

  // ─── Drag and Drop ───

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      setSections(prev => {
        const next = [...prev];
        const [dragged] = next.splice(draggedIndex, 1);
        next.splice(targetIndex, 0, dragged);
        return next.map((s, i) => ({ ...s, order: i }));
      });
      setSaved(false);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [draggedIndex]);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  // ─── Save + Load Preview ───

  const saveConfig = async (signal?: AbortSignal): Promise<boolean> => {
    const config: PdfConfig = {
      sections: sections.map((s, i) => ({ ...s, order: i })),
    };
    const res = await fetch(`/api/auswertung/${auswertungId}/pdf-config`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pdf_config: config }),
      signal,
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Fehler beim Speichern');
    }
    return true;
  };

  const loadPreview = async (signal?: AbortSignal) => {
    setPdfLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auswertung_id: auswertungId }),
        signal,
      });
      if (!res.ok) throw new Error(`PDF-Fehler: ${res.status}`);
      const blob = await res.blob();
      if (blob.size === 0) throw new Error('PDF ist leer');
      setPdfUrl(prev => {
        if (prev) window.URL.revokeObjectURL(prev);
        return window.URL.createObjectURL(blob);
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Fehler beim Laden');
    } finally {
      setPdfLoading(false);
    }
  };

  // Save config → regenerate PDF → show preview (auto-triggered)
  const saveAndRefresh = async () => {
    // Abort any in-flight request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setPdfLoading(true);
    setSaving(true);
    setError(null);
    try {
      await saveConfig(controller.signal);

      const res = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auswertung_id: auswertungId }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`PDF-Fehler: ${res.status}`);
      const blob = await res.blob();
      if (blob.size === 0) throw new Error('PDF ist leer');
      setPdfUrl(prev => {
        if (prev) window.URL.revokeObjectURL(prev);
        return window.URL.createObjectURL(blob);
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setPdfLoading(false);
      setSaving(false);
    }
  };

  // Download current PDF
  const downloadPdf = () => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `Auswertung-${auswertungId.slice(0, 8)}.pdf`;
    a.click();
  };

  const visibleCount = sections.filter(s => s.visible).length;
  const hiddenCount = sections.length - visibleCount;

  return (
    <div className="fixed inset-0 z-50 bg-[#0B1320] flex flex-col">
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
          {error && (
            <span className="text-xs text-red-400 bg-red-400/10 px-2.5 py-1 rounded-md">
              {error}
            </span>
          )}

          {/* Auto-save status */}
          {saving && (
            <span className="text-xs text-blue-400 bg-blue-400/10 px-2.5 py-1 rounded-md flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" /> Speichert & aktualisiert...
            </span>
          )}
          {saved && !saving && (
            <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-md flex items-center gap-1">
              <Check className="w-3 h-3" /> Gespeichert
            </span>
          )}

          <Button
            onClick={() => saveAndRefresh()}
            disabled={pdfLoading}
            size="sm"
            variant="ghost"
            className="gap-1.5 text-[#6B8AAD] hover:text-[#EDF1F5]"
            title="Vorschau manuell aktualisieren"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${pdfLoading ? 'animate-spin' : ''}`} />
          </Button>

          <Button
            onClick={downloadPdf}
            disabled={!pdfUrl || pdfLoading}
            size="sm"
            className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Download className="w-3.5 h-3.5" />
            PDF herunterladen
          </Button>
        </div>
      </div>

      {/* ===== SPLIT VIEW ===== */}
      <div className="flex flex-1 overflow-hidden">

        {/* ─── LEFT: Section List ─── */}
        <div className="w-72 flex-shrink-0 bg-[#1A2535] border-r border-white/[0.08] flex flex-col overflow-hidden">
          <div className="px-3 py-2.5 border-b border-white/[0.08] bg-[#162636]/60">
            <h2 className="text-xs font-bold text-[#EDF1F5]">Sektionen verschieben</h2>
            <p className="text-[10px] text-[#6B8AAD] mt-0.5">
              {visibleCount} sichtbar{hiddenCount > 0 ? ` · ${hiddenCount} ausgeblendet` : ''} — PDF aktualisiert automatisch
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
            {sections.map((section, index) => (
              <div
                key={section.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`
                  group flex items-center gap-1 px-2 py-1.5 rounded-lg transition-all cursor-grab active:cursor-grabbing select-none
                  ${section.visible
                    ? 'bg-[#253546]/70 border border-white/[0.06] hover:border-white/[0.12]'
                    : 'bg-[#1A2535]/40 border border-white/[0.03] opacity-50 hover:opacity-70'
                  }
                  ${dragOverIndex === index ? 'ring-2 ring-blue-500/50 bg-blue-500/10' : ''}
                  ${draggedIndex === index ? 'opacity-20 scale-95' : ''}
                `}
              >
                <GripVertical className="w-3 h-3 text-[#3D5167] flex-shrink-0" />

                <span className="text-[10px] text-[#4A6580] font-mono w-4 flex-shrink-0">{index + 1}</span>

                <span className={`flex-1 text-[11px] leading-tight truncate ${section.visible ? 'text-[#EDF1F5]' : 'text-[#6B8AAD] line-through'}`}>
                  {section.label}
                </span>

                <div className="flex items-center gap-px flex-shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); moveUp(index); }}
                    disabled={index === 0}
                    className="p-0.5 hover:bg-white/[0.06] rounded disabled:opacity-20"
                  >
                    <ChevronUp className="w-3 h-3 text-[#6B8AAD]" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); moveDown(index); }}
                    disabled={index === sections.length - 1}
                    className="p-0.5 hover:bg-white/[0.06] rounded disabled:opacity-20"
                  >
                    <ChevronDown className="w-3 h-3 text-[#6B8AAD]" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleVisibility(index); }}
                    className="p-0.5 hover:bg-white/[0.06] rounded ml-0.5"
                    title={section.visible ? 'Ausblenden' : 'Einblenden'}
                  >
                    {section.visible ? (
                      <Eye className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <EyeOff className="w-3 h-3 text-[#6B8AAD]" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="px-3 py-2 border-t border-white/[0.08] bg-[#162636]/60">
            <button
              onClick={resetToDefault}
              className="flex items-center gap-1.5 text-[11px] text-[#6B8AAD] hover:text-[#EDF1F5] transition-colors w-full justify-center py-1"
            >
              <RotateCcw className="w-3 h-3" />
              Standard wiederherstellen
            </button>
          </div>
        </div>

        {/* ─── RIGHT: PDF Preview ─── */}
        <div className="flex-1 bg-[#0B1320] flex flex-col overflow-hidden">
          {pdfLoading && !pdfUrl ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-sm text-[#6B8AAD]">PDF wird geladen...</p>
            </div>
          ) : pdfUrl ? (
            <div className="flex-1 relative">
              {pdfLoading && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-[#162636]/90 backdrop-blur-sm border border-white/[0.08] rounded-full px-4 py-1.5 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                  <span className="text-xs text-[#6B8AAD]">Aktualisiere PDF...</span>
                </div>
              )}
              <iframe
                ref={iframeRef}
                src={pdfUrl}
                className="w-full h-full border-none"
                title="PDF-Vorschau"
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
              <p className="text-sm text-[#6B8AAD]">Vorschau konnte nicht geladen werden</p>
              <Button onClick={() => loadPreview()} size="sm" variant="secondary" className="gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" />
                Erneut versuchen
              </Button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
