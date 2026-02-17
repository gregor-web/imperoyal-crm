'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LayoutGrid, List, BarChart3, Building2, User, TrendingUp, TrendingDown, Minus, AlertTriangle, Calendar } from 'lucide-react';
import { EmpfehlungBadge, StatusBadge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import { formatDate, formatCurrency } from '@/lib/formatters';

interface Auswertung {
  id: string;
  empfehlung: string | null;
  empfehlung_prioritaet: string | null;
  status: string | null;
  created_at: string;
  objekte: { strasse: string; plz: string; ort: string; kaufpreis: number } | null;
  mandanten: { name: string } | null;
}

interface AuswertungenViewProps {
  auswertungen: Auswertung[];
  totalItems: number;
  searchQuery: string;
  filterEmpfehlung: string;
  filterStatus: string;
  isAdmin: boolean;
}

// ─── Empfehlung icon + color map ─────────────────────────────────────────────
function EmpfehlungIcon({ empfehlung }: { empfehlung: string | null }) {
  if (!empfehlung) return <BarChart3 className="w-6 h-6 text-[#6B8AAD]" />;
  switch (empfehlung.toUpperCase()) {
    case 'HALTEN':       return <Minus className="w-6 h-6 text-[#34C759]" />;
    case 'OPTIMIEREN':   return <TrendingUp className="w-6 h-6 text-[#FF9500]" />;
    case 'RESTRUKTURIEREN': return <AlertTriangle className="w-6 h-6 text-[#FF9500]" />;
    case 'VERKAUFEN':    return <TrendingDown className="w-6 h-6 text-[#FF3B30]" />;
    default:             return <BarChart3 className="w-6 h-6 text-[#7A9BBD]" />;
  }
}

function empfehlungBg(empfehlung: string | null): string {
  if (!empfehlung) return 'from-[#1E2A3A] to-[#253546]';
  switch (empfehlung.toUpperCase()) {
    case 'HALTEN':          return 'from-[#0D3020] to-[#1A4A30]';
    case 'OPTIMIEREN':      return 'from-[#2D1E00] to-[#4A3300]';
    case 'RESTRUKTURIEREN': return 'from-[#2D1800] to-[#4A2E00]';
    case 'VERKAUFEN':       return 'from-[#2D0A0A] to-[#4A1515]';
    default:                return 'from-[#1E2A3A] to-[#253546]';
  }
}

// ─── Auswertung Card ──────────────────────────────────────────────────────────
function AuswertungCard({ auswertung, isAdmin }: { auswertung: Auswertung; isAdmin: boolean }) {
  const objekt = auswertung.objekte;
  const mandant = auswertung.mandanten;
  const bg = empfehlungBg(auswertung.empfehlung);

  return (
    <Link href={`/auswertungen/${auswertung.id}`} className="group block">
      <div className="bg-[#1E2A3A] rounded-2xl overflow-hidden border border-white/[0.07] hover:border-[#5B7A9D]/50 hover:shadow-[0_8px_32px_rgba(0,0,0,0.40)] transition-all duration-200 flex flex-col">
        {/* Colored top area based on empfehlung */}
        <div className={`relative h-28 bg-gradient-to-br ${bg} overflow-hidden`}>
          {/* Background grid pattern */}
          <div className="absolute inset-0 opacity-[0.07]"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.1) 0px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, rgba(255,255,255,0.1) 0px, transparent 1px, transparent 40px)' }}
          />
          {/* Empfehlung icon center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-black/20 backdrop-blur-sm flex items-center justify-center border border-white/[0.08]">
              <EmpfehlungIcon empfehlung={auswertung.empfehlung} />
            </div>
          </div>
          {/* Status top-right */}
          <div className="absolute top-3 right-3">
            <StatusBadge status={(auswertung.status ?? 'erstellt') as 'erstellt' | 'abgeschlossen' | 'offen'} />
          </div>
        </div>

        {/* Card body */}
        <div className="p-4 flex flex-col gap-3 flex-1">
          {/* Address */}
          {objekt ? (
            <div>
              <p className="text-[#EDF1F5] font-semibold text-[14px] leading-tight truncate">
                {objekt.strasse}
              </p>
              <p className="text-[#7A9BBD] text-[12px] mt-0.5">
                {objekt.plz} {objekt.ort}
              </p>
            </div>
          ) : (
            <p className="text-[#6B8AAD] text-[12px]">Objekt nicht verfügbar</p>
          )}

          {/* Empfehlung badge */}
          {auswertung.empfehlung && (
            <div>
              <EmpfehlungBadge empfehlung={auswertung.empfehlung} />
            </div>
          )}

          {/* Footer */}
          <div className="mt-auto pt-3 border-t border-white/[0.07] flex items-center justify-between gap-2">
            <div className="flex flex-col gap-0.5">
              {objekt && (
                <span className="text-[#EDF1F5] font-semibold text-[12px]">
                  {formatCurrency(objekt.kaufpreis)}
                </span>
              )}
              {isAdmin && mandant && (
                <div className="flex items-center gap-1 text-[11px] text-[#6B8AAD]">
                  <User className="w-3 h-3" />
                  <span className="truncate max-w-[100px]">{mandant.name}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-[#4A6A8D]">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(auswertung.created_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Main View with Toggle ────────────────────────────────────────────────────
export function AuswertungenView({
  auswertungen,
  totalItems,
  searchQuery,
  filterEmpfehlung,
  filterStatus,
  isAdmin,
}: AuswertungenViewProps) {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const PAGE_SIZE = 20;

  const isEmpty = auswertungen.length === 0;
  const emptyMsg = searchQuery || filterEmpfehlung || filterStatus
    ? 'Keine Auswertungen mit diesen Filtern gefunden'
    : 'Keine Auswertungen vorhanden';

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-[#6B8AAD]">
          {totalItems} {totalItems === 1 ? 'Auswertung' : 'Auswertungen'}
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
          <BarChart3 className="w-12 h-12 text-[#3D5167] mx-auto mb-4" />
          <p className="text-[#6B8AAD] text-sm">{emptyMsg}</p>
        </div>
      ) : view === 'grid' ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {auswertungen.map((a) => <AuswertungCard key={a.id} auswertung={a} isAdmin={isAdmin} />)}
          </div>
          <Pagination totalItems={totalItems} pageSize={PAGE_SIZE} />
        </>
      ) : (
        <div className="bg-[#1E2A3A] rounded-2xl overflow-hidden border border-white/[0.07]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Objekt</TableHead>
                {isAdmin && <TableHead>Mandant</TableHead>}
                <TableHead>Kaufpreis</TableHead>
                <TableHead>Empfehlung</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Erstellt</TableHead>
                <TableHead className="w-24">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auswertungen.map((auswertung) => {
                const objekt = auswertung.objekte;
                const mandant = auswertung.mandanten;
                return (
                  <TableRow key={auswertung.id}>
                    <TableCell>
                      {objekt ? (
                        <div>
                          <p className="font-medium text-[#EDF1F5]">{objekt.strasse}</p>
                          <p className="text-sm text-[#7A9BBD]">{objekt.plz} {objekt.ort}</p>
                        </div>
                      ) : '-'}
                    </TableCell>
                    {isAdmin && <TableCell className="text-[#9EAFC0]">{mandant?.name || '-'}</TableCell>}
                    <TableCell className="text-[#EDF1F5] font-medium">{objekt ? formatCurrency(objekt.kaufpreis) : '-'}</TableCell>
                    <TableCell>
                      {auswertung.empfehlung ? <EmpfehlungBadge empfehlung={auswertung.empfehlung} /> : '-'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={(auswertung.status ?? 'erstellt') as 'erstellt' | 'abgeschlossen' | 'offen'} />
                    </TableCell>
                    <TableCell className="text-[#9EAFC0]">{formatDate(auswertung.created_at)}</TableCell>
                    <TableCell>
                      <Link href={`/auswertungen/${auswertung.id}`} className="text-[#7A9BBD] hover:text-[#9EAFC0] text-sm font-medium">
                        Ansehen
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <Pagination totalItems={totalItems} pageSize={PAGE_SIZE} />
        </div>
      )}
    </div>
  );
}
