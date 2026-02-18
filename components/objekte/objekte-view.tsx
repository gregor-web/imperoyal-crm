'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Building2, User, LayoutGrid, List, ArrowRight, Layers, MapPin, Hash, CheckCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import { formatDate, formatCurrency } from '@/lib/formatters';
import { DynamicObjektMapThumbnail as ObjektMapThumbnail } from '@/components/maps/objekt-map-thumbnail-dynamic';

interface Objekt {
  id: string;
  strasse: string;
  plz: string;
  ort: string;
  gebaeudetyp: string | null;
  kaufpreis: number;
  wohneinheiten: number | null;
  gewerbeeinheiten: number | null;
  created_at: string;
  mandant_id: string;
  mandanten: { id: string; name: string } | null;
}

interface GroupedObjekte {
  [mandantId: string]: { mandantName: string; objekte: Objekt[] };
}

interface ObjekteViewProps {
  objekte: Objekt[];
  groupedObjekte: GroupedObjekte;
  mandantIds: string[];
  isAdmin: boolean;
  totalItems: number;
  searchQuery: string;
  filterTyp: string;
  auswertungObjektIds?: string[];
  anfrageObjektIds?: string[];
}

// ─── Gradient presets for card backgrounds (no image) ────────────────────────
const CARD_GRADIENTS = [
  'from-[#1E3A5F] to-[#0F2444]',
  'from-[#1E3650] to-[#0D2035]',
  'from-[#2A2440] to-[#150F2B]',
  'from-[#1A3040] to-[#0C1E2E]',
  'from-[#263042] to-[#122030]',
];

function gradientFor(id: string) {
  const n = id.charCodeAt(0) % CARD_GRADIENTS.length;
  return CARD_GRADIENTS[n];
}

// ─── Single Property Card (Grid) ─────────────────────────────────────────────
function ObjektCard({ objekt, hasAuswertung, hasAnfrage }: { objekt: Objekt; hasAuswertung?: boolean; hasAnfrage?: boolean }) {
  const totalEinheiten = (objekt.wohneinheiten || 0) + (objekt.gewerbeeinheiten || 0);

  return (
    <Link href={`/objekte/${objekt.id}`} className="group block">
      <div className="bg-[#1E2A3A] rounded-2xl overflow-hidden border border-white/[0.07] hover:border-[#5B7A9D]/50 hover:shadow-[0_8px_32px_rgba(0,0,0,0.45)] transition-all duration-200">
        {/* Card Map Area */}
        <div className="relative h-44 overflow-hidden">
          <ObjektMapThumbnail
            address={`${objekt.strasse}, ${objekt.plz} ${objekt.ort}`}
            className="absolute inset-0 w-full h-full"
          />

          {/* Darkening overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none z-[500]" />

          {/* Price overlay bottom-left */}
          <div className="absolute bottom-0 left-0 right-0 px-4 py-3 z-[501]">
            <p className="text-white font-bold text-lg tracking-[-0.02em] leading-tight drop-shadow-lg">
              {formatCurrency(objekt.kaufpreis)}
            </p>
          </div>

          {/* Type badge top-left */}
          {objekt.gebaeudetyp && (
            <div className="absolute top-3 left-3 z-[501]">
              <span className="bg-black/40 backdrop-blur-sm text-white/90 text-[11px] font-medium px-2.5 py-1 rounded-lg border border-white/10">
                {objekt.gebaeudetyp}
              </span>
            </div>
          )}

          {/* Status badge top-right */}
          {hasAuswertung && (
            <div className="absolute top-3 right-3 z-[501]">
              <span className="bg-[#16a34a]/80 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-1 rounded-lg border border-[#22c55e]/30 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Ausgewertet
              </span>
            </div>
          )}
          {!hasAuswertung && hasAnfrage && (
            <div className="absolute top-3 right-3 z-[501]">
              <span className="bg-[#eab308]/80 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-1 rounded-lg border border-[#eab308]/30 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                In Bearbeitung
              </span>
            </div>
          )}

          {/* Arrow top-right on hover (only when no status badge) */}
          {!hasAuswertung && !hasAnfrage && (
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-[501]">
              <div className="w-7 h-7 bg-[#5B7A9D] rounded-lg flex items-center justify-center">
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-4">
          <div className="flex items-start gap-2 mb-3">
            <MapPin className="w-3.5 h-3.5 text-[#6B8AAD] mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[#EDF1F5] font-semibold text-[14px] leading-tight truncate">
                {objekt.strasse}
              </p>
              <p className="text-[#7A9BBD] text-[12px] mt-0.5">
                {objekt.plz} {objekt.ort}
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 pt-3 border-t border-white/[0.07]">
            <div className="flex items-center gap-1.5 text-[12px] text-[#9EAFC0]">
              <Layers className="w-3.5 h-3.5 text-[#6B8AAD]" />
              <span>{totalEinheiten} Einh.</span>
            </div>
            {objekt.mandanten && (
              <div className="flex items-center gap-1.5 text-[12px] text-[#9EAFC0] min-w-0 flex-1">
                <User className="w-3.5 h-3.5 text-[#6B8AAD] flex-shrink-0" />
                <span className="truncate">{(objekt.mandanten as { name: string }).name}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-[11px] text-[#4A6A8D] ml-auto">
              <Hash className="w-3 h-3" />
              <span>{formatDate(objekt.created_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Admin Grouped Card Grid ──────────────────────────────────────────────────
function AdminGroupedGrid({ groupedObjekte, mandantIds, auswertungObjektIds, anfrageObjektIds }: { groupedObjekte: GroupedObjekte; mandantIds: string[]; auswertungObjektIds: string[]; anfrageObjektIds: string[] }) {
  return (
    <div className="space-y-8">
      {mandantIds.map((mandantId) => {
        const group = groupedObjekte[mandantId];
        return (
          <div key={mandantId}>
            {/* Mandant Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#7A9BBD]/15 rounded-xl flex items-center justify-center">
                  <User className="w-4 h-4 text-[#7A9BBD]" />
                </div>
                <div>
                  <Link
                    href={`/mandanten/${mandantId}`}
                    className="text-[15px] font-semibold text-[#EDF1F5] hover:text-[#7A9BBD] transition-colors"
                  >
                    {group.mandantName}
                  </Link>
                  <p className="text-[#7A9BBD] text-[11px]">
                    {group.objekte.length} {group.objekte.length === 1 ? 'Objekt' : 'Objekte'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[#EDF1F5] font-semibold text-sm">
                  {formatCurrency(group.objekte.reduce((s, o) => s + (o.kaufpreis || 0), 0))}
                </span>
                <span className="text-[#6B8AAD] text-[12px]">gesamt</span>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {group.objekte.map((o) => <ObjektCard key={o.id} objekt={o} hasAuswertung={auswertungObjektIds.includes(o.id)} hasAnfrage={anfrageObjektIds.includes(o.id)} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Admin Grouped Table (List View) ─────────────────────────────────────────
function AdminGroupedTable({ groupedObjekte, mandantIds, auswertungObjektIds, anfrageObjektIds }: { groupedObjekte: GroupedObjekte; mandantIds: string[]; auswertungObjektIds: string[]; anfrageObjektIds: string[] }) {
  return (
    <div className="space-y-6">
      {mandantIds.map((mandantId) => {
        const group = groupedObjekte[mandantId];
        return (
          <div key={mandantId} className="bg-[#1E2A3A] rounded-2xl overflow-hidden border border-white/[0.07]">
            {/* Mandant Header */}
            <div className="px-4 sm:px-5 py-3.5 border-b border-white/[0.07] bg-[#162636]/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#7A9BBD]/15 rounded-xl flex items-center justify-center">
                    <User className="w-4 h-4 text-[#7A9BBD]" />
                  </div>
                  <div>
                    <Link href={`/mandanten/${mandantId}`} className="text-[15px] font-semibold text-[#EDF1F5] hover:text-[#7A9BBD] transition-colors">
                      {group.mandantName}
                    </Link>
                    <p className="text-[#7A9BBD] text-[12px]">{group.objekte.length} {group.objekte.length === 1 ? 'Objekt' : 'Objekte'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 ml-11 sm:ml-0">
                  <Building2 className="w-4 h-4 text-[#6B8AAD] hidden sm:block" />
                  <span className="text-[#EDF1F5] font-semibold text-sm">
                    {formatCurrency(group.objekte.reduce((s, o) => s + (o.kaufpreis || 0), 0))}
                  </span>
                  <span className="text-[#7A9BBD] text-[12px]">Gesamtwert</span>
                </div>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Adresse</TableHead>
                  <TableHead>Typ</TableHead>
                  <TableHead>Kaufpreis</TableHead>
                  <TableHead>Einheiten</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Erstellt</TableHead>
                  <TableHead className="w-24">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {group.objekte.map((objekt) => (
                  <TableRow key={objekt.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-[#EDF1F5]">{objekt.strasse}</p>
                        <p className="text-sm text-[#7A9BBD]">{objekt.plz} {objekt.ort}</p>
                      </div>
                    </TableCell>
                    <TableCell>{objekt.gebaeudetyp && <Badge>{objekt.gebaeudetyp}</Badge>}</TableCell>
                    <TableCell className="font-medium text-[#EDF1F5]">{formatCurrency(objekt.kaufpreis)}</TableCell>
                    <TableCell className="text-[#9EAFC0]">{(objekt.wohneinheiten || 0) + (objekt.gewerbeeinheiten || 0)} Einheiten</TableCell>
                    <TableCell>
                      {auswertungObjektIds.includes(objekt.id) ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#22c55e] bg-[#22c55e]/10 px-2 py-1 rounded-md">
                          <CheckCircle className="w-3 h-3" />
                          Ausgewertet
                        </span>
                      ) : anfrageObjektIds.includes(objekt.id) ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#eab308] bg-[#eab308]/10 px-2 py-1 rounded-md">
                          <Clock className="w-3 h-3" />
                          In Bearbeitung
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#6B8AAD]">Offen</span>
                      )}
                    </TableCell>
                    <TableCell className="text-[#9EAFC0]">{formatDate(objekt.created_at)}</TableCell>
                    <TableCell>
                      <Link href={`/objekte/${objekt.id}`} className="text-[#7A9BBD] hover:text-[#9EAFC0] text-sm font-medium">
                        Details
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main View with Toggle ────────────────────────────────────────────────────
export function ObjekteView({
  objekte,
  groupedObjekte,
  mandantIds,
  isAdmin,
  totalItems,
  searchQuery,
  filterTyp,
  auswertungObjektIds = [],
  anfrageObjektIds = [],
}: ObjekteViewProps) {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const PAGE_SIZE = 20;

  const isEmpty = isAdmin ? mandantIds.length === 0 : objekte.length === 0;
  const emptyMsg = searchQuery || filterTyp ? 'Keine Objekte mit diesen Filtern gefunden' : 'Keine Objekte vorhanden';

  return (
    <div className="space-y-5">
      {/* Toolbar: count + toggle */}
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-[#6B8AAD]">
          {totalItems} {totalItems === 1 ? 'Objekt' : 'Objekte'}
          {isAdmin && mandantIds.length > 0 && ` · ${mandantIds.length} Mandanten`}
        </p>
        {/* View Toggle */}
        <div className="flex items-center bg-[#162636] rounded-xl p-1 gap-0.5 border border-white/[0.07]">
          <button
            onClick={() => setView('grid')}
            className={`p-2 rounded-lg transition-all duration-150 ${
              view === 'grid'
                ? 'bg-[#5B7A9D] text-white shadow-[0_1px_4px_rgba(0,0,0,0.30)]'
                : 'text-[#6B8AAD] hover:bg-white/[0.05] hover:text-[#9EAFC0]'
            }`}
            title="Kachelansicht"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-2 rounded-lg transition-all duration-150 ${
              view === 'list'
                ? 'bg-[#5B7A9D] text-white shadow-[0_1px_4px_rgba(0,0,0,0.30)]'
                : 'text-[#6B8AAD] hover:bg-white/[0.05] hover:text-[#9EAFC0]'
            }`}
            title="Listenansicht"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {isEmpty ? (
        <div className="bg-[#1E2A3A] rounded-2xl p-12 text-center border border-white/[0.07]">
          <Building2 className="w-12 h-12 text-[#3D5167] mx-auto mb-4" />
          <p className="text-[#6B8AAD] text-sm">{emptyMsg}</p>
        </div>
      ) : (
        <>
          {/* ADMIN VIEW */}
          {isAdmin && (
            view === 'grid'
              ? <AdminGroupedGrid groupedObjekte={groupedObjekte} mandantIds={mandantIds} auswertungObjektIds={auswertungObjektIds} anfrageObjektIds={anfrageObjektIds} />
              : <AdminGroupedTable groupedObjekte={groupedObjekte} mandantIds={mandantIds} auswertungObjektIds={auswertungObjektIds} anfrageObjektIds={anfrageObjektIds} />
          )}

          {/* MANDANT VIEW */}
          {!isAdmin && (
            view === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {objekte.map((o) => <ObjektCard key={o.id} objekt={o} hasAuswertung={auswertungObjektIds.includes(o.id)} hasAnfrage={anfrageObjektIds.includes(o.id)} />)}
              </div>
            ) : (
              <div className="bg-[#1E2A3A] rounded-2xl overflow-hidden border border-white/[0.07]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Adresse</TableHead>
                      <TableHead>Typ</TableHead>
                      <TableHead>Kaufpreis</TableHead>
                      <TableHead>Einheiten</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Erstellt</TableHead>
                      <TableHead className="w-24">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {objekte.map((objekt) => (
                      <TableRow key={objekt.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-[#EDF1F5]">{objekt.strasse}</p>
                            <p className="text-sm text-[#7A9BBD]">{objekt.plz} {objekt.ort}</p>
                          </div>
                        </TableCell>
                        <TableCell>{objekt.gebaeudetyp && <Badge>{objekt.gebaeudetyp}</Badge>}</TableCell>
                        <TableCell className="font-medium text-[#EDF1F5]">{formatCurrency(objekt.kaufpreis)}</TableCell>
                        <TableCell className="text-[#9EAFC0]">
                          {(objekt.wohneinheiten || 0) + (objekt.gewerbeeinheiten || 0)} Einheiten
                        </TableCell>
                        <TableCell>
                          {auswertungObjektIds.includes(objekt.id) ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#22c55e] bg-[#22c55e]/10 px-2 py-1 rounded-md">
                              <CheckCircle className="w-3 h-3" />
                              Ausgewertet
                            </span>
                          ) : anfrageObjektIds.includes(objekt.id) ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#eab308] bg-[#eab308]/10 px-2 py-1 rounded-md">
                              <Clock className="w-3 h-3" />
                              In Bearbeitung
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#6B8AAD]">Offen</span>
                          )}
                        </TableCell>
                        <TableCell className="text-[#9EAFC0]">{formatDate(objekt.created_at)}</TableCell>
                        <TableCell>
                          <Link href={`/objekte/${objekt.id}`} className="text-[#7A9BBD] hover:text-[#9EAFC0] text-sm font-medium">
                            Details
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )
          )}

          <Pagination totalItems={totalItems} pageSize={PAGE_SIZE} />
        </>
      )}
    </div>
  );
}
