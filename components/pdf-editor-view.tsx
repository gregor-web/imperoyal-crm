'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  GripVertical, Eye, EyeOff, Save, RotateCcw, Loader2, Check,
  ArrowLeft, Download, FileText,
  Building2, Banknote, TrendingUp, PieChart, BarChart3,
  Table2, LineChart, Wrench, Home, Calculator, Target,
  DoorOpen, Award, BookOpen,
} from 'lucide-react';
import type { PdfSectionItem, PdfConfig, PdfSectionId } from '@/lib/types';
import { DEFAULT_PDF_SECTIONS } from '@/lib/types';

// ─── Section visual metadata ───

interface SectionMeta {
  icon: React.ElementType;
  color: string;
  description: string;
  pageHint: string;
}

const SECTION_META: Record<PdfSectionId, SectionMeta> = {
  steckbrief:      { icon: Building2,   color: '#3B82F6', description: 'Objektdaten, Potenzial, Kennzahlen, Beleihung & Marktdaten', pageHint: 'Tabellen & Kennzahlen' },
  finanzierung:    { icon: Banknote,    color: '#22C55E', description: 'Eigenkapital, Fremdkapital, Zinssatz, Tilgung, Kapitaldienst', pageHint: 'Tabelle' },
  ertrag:          { icon: TrendingUp,  color: '#3B82F6', description: 'Mieteinnahmen IST vs. SOLL pro Nutzungsart', pageHint: 'Tabelle & Balkendiagramm' },
  cashflow:        { icon: BarChart3,   color: '#8B5CF6', description: 'Cashflow IST & Optimiert, Einnahmen vs. Ausgaben', pageHint: 'Tabelle' },
  kosten:          { icon: PieChart,    color: '#F59E0B', description: 'Betriebskosten, Instandhaltung, Verwaltung, Rücklagen', pageHint: 'Tabelle & Tortendiagramm' },
  mieterhohung:    { icon: Table2,      color: '#EF4444', description: 'Mieterhöhungspotenzial pro Einheit nach §558 BGB', pageHint: 'Detailtabelle' },
  cashflow_chart:  { icon: BarChart3,   color: '#22C55E', description: 'Visueller Vergleich: Cashflow IST vs. Optimiert', pageHint: 'Balkendiagramm' },
  wertentwicklung: { icon: LineChart,   color: '#06B6D4', description: 'Wertprognose 3, 5, 7, 10 Jahre bei 2,5% p.a.', pageHint: 'Liniendiagramm' },
  capex:           { icon: Wrench,      color: '#F97316', description: 'Investitionen & Modernisierungsumlage nach §559 BGB', pageHint: 'Tabelle' },
  weg:             { icon: Home,        color: '#A855F7', description: 'WEG-Aufteilungspotenzial & Genehmigungslage', pageHint: 'Tabelle & Vergleich' },
  afa:             { icon: Calculator,  color: '#64748B', description: 'Restnutzungsdauer, AfA-Höhe, Steuerersparnis', pageHint: 'Tabelle' },
  roi:             { icon: Target,      color: '#10B981', description: 'ROI heute, optimiert, nach WEG-Aufteilung', pageHint: 'Balkendiagramm' },
  exit:            { icon: DoorOpen,    color: '#EC4899', description: 'Verkaufserlös-Szenarien nach 3, 7, 10 Jahren', pageHint: 'Balkendiagramm' },
  empfehlung:      { icon: Award,       color: '#F59E0B', description: 'KI-Empfehlung, Handlungsschritte, Chancen & Risiken', pageHint: 'Text & Analyse' },
  erlaeuterungen:  { icon: BookOpen,    color: '#6B7280', description: 'Glossar und Erklärungen für alle Analyse-Punkte', pageHint: 'Text' },
};

// ─── Skeleton lines for visual hints ───

function SkeletonContent({ type }: { type: string }) {
  if (type.includes('Tabelle') && type.includes('Diagramm')) {
    return (
      <div className="flex gap-3 mt-2">
        <div className="flex-1 space-y-1.5">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-1">
              <div className="h-2 bg-white/[0.06] rounded flex-[2]" />
              <div className="h-2 bg-white/[0.04] rounded flex-1" />
            </div>
          ))}
        </div>
        <div className="w-16 h-12 bg-white/[0.04] rounded flex items-end justify-around px-1 pb-1">
          <div className="w-2 bg-white/[0.08] rounded-t" style={{ height: '60%' }} />
          <div className="w-2 bg-white/[0.08] rounded-t" style={{ height: '85%' }} />
          <div className="w-2 bg-white/[0.08] rounded-t" style={{ height: '45%' }} />
        </div>
      </div>
    );
  }
  if (type.includes('Tortendiagramm')) {
    return (
      <div className="flex gap-3 mt-2">
        <div className="flex-1 space-y-1.5">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-1">
              <div className="h-2 bg-white/[0.06] rounded flex-[2]" />
              <div className="h-2 bg-white/[0.04] rounded flex-1" />
            </div>
          ))}
        </div>
        <div className="w-12 h-12 rounded-full border-4 border-white/[0.08] border-t-white/[0.15]" />
      </div>
    );
  }
  if (type.includes('Balkendiagramm') || type.includes('Liniendiagramm')) {
    return (
      <div className="mt-2 h-14 bg-white/[0.03] rounded flex items-end justify-around px-2 pb-1.5">
        {type.includes('Linie') ? (
          <svg className="w-full h-10 text-white/[0.12]" viewBox="0 0 100 40">
            <polyline
              points="5,35 20,25 40,28 60,15 80,10 95,18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        ) : (
          <>
            <div className="w-4 bg-white/[0.08] rounded-t" style={{ height: '55%' }} />
            <div className="w-4 bg-white/[0.10] rounded-t" style={{ height: '80%' }} />
            <div className="w-4 bg-white/[0.08] rounded-t" style={{ height: '40%' }} />
            <div className="w-4 bg-white/[0.06] rounded-t" style={{ height: '65%' }} />
          </>
        )}
      </div>
    );
  }
  if (type.includes('Detailtabelle')) {
    return (
      <div className="mt-2 space-y-1">
        <div className="flex gap-1">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-2 bg-white/[0.08] rounded flex-1" />
          ))}
        </div>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex gap-1">
            {[1, 2, 3, 4].map(j => (
              <div key={j} className="h-1.5 bg-white/[0.04] rounded flex-1" />
            ))}
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="mt-2 space-y-1.5">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex gap-1">
          <div className="h-2 bg-white/[0.06] rounded" style={{ width: `${50 + i * 15}%` }} />
          <div className="h-2 bg-white/[0.04] rounded flex-1" />
        </div>
      ))}
    </div>
  );
}


// ─── Main Component ───

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
  const containerRef = useRef<HTMLDivElement>(null);

  const [sections, setSections] = useState<PdfSectionItem[]>(
    () => initialConfig?.sections
      ? [...initialConfig.sections].sort((a, b) => a.order - b.order)
      : DEFAULT_PDF_SECTIONS.map(s => ({ ...s }))
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfDownloading, setPdfDownloading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  // ─── Section manipulation ───

  const markChanged = useCallback(() => {
    setHasChanges(true);
    setSaved(false);
  }, []);

  const toggleVisibility = useCallback((e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setSections(prev => {
      const next = [...prev];
      next[index] = { ...next[index], visible: !next[index].visible };
      return next;
    });
    markChanged();
  }, [markChanged]);

  const resetToDefault = useCallback(() => {
    setSections(DEFAULT_PDF_SECTIONS.map(s => ({ ...s })));
    markChanged();
  }, [markChanged]);

  // ─── Drag and Drop ───

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    const el = e.currentTarget as HTMLElement;
    const ghost = el.cloneNode(true) as HTMLElement;
    ghost.style.opacity = '0.6';
    ghost.style.position = 'absolute';
    ghost.style.top = '-1000px';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);
    setTimeout(() => document.body.removeChild(ghost), 0);
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
      markChanged();
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [draggedIndex, markChanged]);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  // ─── Save config to DB ───

  const saveConfig = async () => {
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

      setHasChanges(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setSaving(false);
    }
  };

  // ─── Download PDF ───

  const downloadPdf = async () => {
    setPdfDownloading(true);
    setError(null);
    try {
      if (hasChanges) {
        const config: PdfConfig = {
          sections: sections.map((s, i) => ({ ...s, order: i })),
        };
        const saveRes = await fetch(`/api/auswertung/${auswertungId}/pdf-config`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pdf_config: config }),
        });
        if (!saveRes.ok) throw new Error('Fehler beim Speichern');
        setHasChanges(false);
      }

      const response = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auswertung_id: auswertungId }),
      });

      if (!response.ok) throw new Error('Fehler bei PDF-Generierung');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Auswertung-${auswertungId.slice(0, 8)}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setPdfDownloading(false);
    }
  };

  const visibleSections = sections.filter(s => s.visible);
  const hiddenSections = sections.filter(s => !s.visible);

  return (
    <div className="fixed inset-0 z-50 bg-[#0B1320] flex flex-col">
      {/* ===== TOP BAR ===== */}
      <div className="flex items-center justify-between px-5 py-3 bg-[#162636] border-b border-white/[0.08] flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/auswertungen/${auswertungId}`)}
            className="p-1.5 hover:bg-white/[0.06] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#6B8AAD]" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-[#EDF1F5]">PDF-Layout bearbeiten</h1>
            <p className="text-xs text-[#6B8AAD]">{objektLabel} · {mandantName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {error && (
            <span className="text-xs text-red-400 bg-red-400/10 px-2.5 py-1 rounded-md">
              {error}
            </span>
          )}
          {saved && (
            <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-md flex items-center gap-1">
              <Check className="w-3 h-3" /> Gespeichert
            </span>
          )}
          {hasChanges && !saved && (
            <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2.5 py-1 rounded-md">
              Ungespeichert
            </span>
          )}
          <Button
            onClick={resetToDefault}
            variant="ghost"
            size="sm"
            className="gap-1.5 text-[#6B8AAD] hover:text-[#EDF1F5]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Zurücksetzen
          </Button>
          <Button
            onClick={saveConfig}
            disabled={saving || !hasChanges}
            size="sm"
            variant="secondary"
            className="gap-1.5"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Speichern
          </Button>
          <Button
            onClick={downloadPdf}
            disabled={pdfDownloading}
            size="sm"
            className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {pdfDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            {pdfDownloading ? 'Generiere...' : 'PDF herunterladen'}
          </Button>
        </div>
      </div>

      {/* ===== VISUAL EDITOR ===== */}
      <div ref={containerRef} className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto py-8 px-6">
          {/* Cover page hint */}
          <div className="mb-4 flex items-center gap-2 text-xs text-[#3D5167]">
            <FileText className="w-3.5 h-3.5" />
            <span>Deckblatt wird automatisch generiert</span>
          </div>

          {/* Instructions */}
          <div className="mb-6 bg-[#1A2535]/60 border border-white/[0.06] rounded-xl px-4 py-3 flex items-center gap-3">
            <GripVertical className="w-4 h-4 text-[#3D5167]" />
            <p className="text-xs text-[#6B8AAD]">
              <span className="text-[#EDF1F5] font-medium">Sektionen per Drag & Drop verschieben</span>{' '}
              — Klicke auf das Auge-Symbol um eine Sektion ein-/auszublenden
            </p>
          </div>

          {/* ─── Sections (draggable cards) ─── */}
          <div className="space-y-3">
            {sections.map((section, index) => {
              const meta = SECTION_META[section.id];
              const Icon = meta.icon;
              const isDragged = draggedIndex === index;
              const isDragOver = dragOverIndex === index;

              return (
                <div
                  key={section.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`
                    group relative rounded-xl border transition-all duration-200 cursor-grab active:cursor-grabbing select-none
                    ${section.visible
                      ? 'bg-[#1E2A3A]/90 border-white/[0.08] hover:border-white/[0.15]'
                      : 'bg-[#141E2A]/60 border-white/[0.04] border-dashed'
                    }
                    ${isDragged ? 'opacity-20 scale-[0.98]' : ''}
                    ${isDragOver ? 'ring-2 ring-blue-500/40 border-blue-500/40 scale-[1.01]' : ''}
                  `}
                >
                  {isDragOver && draggedIndex !== null && draggedIndex !== index && (
                    <div className="absolute -top-1.5 left-4 right-4 h-0.5 bg-blue-500 rounded-full" />
                  )}

                  <div className={`flex items-start gap-4 p-4 ${!section.visible ? 'opacity-40' : ''}`}>
                    <div className="flex flex-col items-center gap-1 pt-0.5">
                      <GripVertical className="w-5 h-5 text-[#3D5167] group-hover:text-[#6B8AAD] transition-colors" />
                    </div>

                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${meta.color}15` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: meta.color }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`text-sm font-bold ${section.visible ? 'text-[#EDF1F5]' : 'text-[#6B8AAD] line-through'}`}>
                          {section.label}
                        </h3>
                        <span
                          className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: `${meta.color}15`,
                            color: meta.color,
                          }}
                        >
                          {meta.pageHint}
                        </span>
                      </div>
                      <p className="text-xs text-[#5A7A99] mt-0.5 leading-relaxed">
                        {meta.description}
                      </p>

                      {section.visible && (
                        <SkeletonContent type={meta.pageHint} />
                      )}
                    </div>

                    <button
                      onClick={(e) => toggleVisibility(e, index)}
                      className={`
                        p-2 rounded-lg transition-all flex-shrink-0
                        ${hoveredIndex === index || !section.visible
                          ? 'opacity-100'
                          : 'opacity-0 group-hover:opacity-100'
                        }
                        ${section.visible
                          ? 'hover:bg-white/[0.06] text-emerald-400'
                          : 'hover:bg-white/[0.06] text-[#5A7A99]'
                        }
                      `}
                      title={section.visible ? 'Sektion ausblenden' : 'Sektion einblenden'}
                    >
                      {section.visible ? (
                        <Eye className="w-5 h-5" />
                      ) : (
                        <EyeOff className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {!section.visible && (
                    <div className="absolute inset-0 rounded-xl flex items-center justify-center pointer-events-none">
                      <span className="text-xs text-[#5A7A99] bg-[#141E2A]/80 px-3 py-1 rounded-full">
                        Ausgeblendet
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ─── Summary ─── */}
          <div className="mt-8 mb-12 flex items-center justify-between text-xs text-[#3D5167] px-2">
            <span>
              {visibleSections.length} Sektionen sichtbar
              {hiddenSections.length > 0 && ` · ${hiddenSections.length} ausgeblendet`}
            </span>
            <span>Deckblatt + {visibleSections.length} Sektionen = ca. {visibleSections.length + 1} Seiten</span>
          </div>
        </div>
      </div>
    </div>
  );
}
