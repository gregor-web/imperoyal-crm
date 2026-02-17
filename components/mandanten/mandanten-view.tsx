'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LayoutGrid, List, Mail, MapPin, User, Building2, Phone, Calendar, BarChart3 } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import { formatDate } from '@/lib/formatters';

interface Mandant {
  id: string;
  name: string;
  ansprechpartner: string | null;
  email: string;
  telefon: string | null;
  ort: string | null;
  plz: string | null;
  land: string | null;
  created_at: string;
  completed_analysen?: number;
}

interface MandantenViewProps {
  mandanten: Mandant[];
  totalItems: number;
  searchQuery: string;
  actions?: React.ReactNode;
}

// ─── Avatar colors based on first letter ─────────────────────────────────────
const AVATAR_COLORS = [
  'from-[#1E3A6E] to-[#2A5298]',
  'from-[#1E4D2B] to-[#2D7A42]',
  'from-[#4D2B1E] to-[#8B4513]',
  'from-[#2B1E4D] to-[#5B2D8B]',
  'from-[#1E3A4D] to-[#2D6A8B]',
  'from-[#4D1E2B] to-[#8B2D42]',
  'from-[#1E4D4D] to-[#2D8B8B]',
];

function avatarColorFor(name: string) {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function MandantInitial({ name }: { name: string }) {
  const gradient = avatarColorFor(name);
  return (
    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]`}>
      <span className="text-white font-bold text-lg select-none">{name.charAt(0).toUpperCase()}</span>
    </div>
  );
}

// ─── Mandant Card ─────────────────────────────────────────────────────────────
function MandantCard({ mandant }: { mandant: Mandant }) {
  return (
    <Link href={`/mandanten/${mandant.id}`} className="group block">
      <div className="bg-[#1E2A3A] rounded-2xl p-5 border border-white/[0.07] hover:border-[#5B7A9D]/50 hover:shadow-[0_8px_32px_rgba(0,0,0,0.40)] transition-all duration-200 h-full flex flex-col gap-4">
        {/* Header row */}
        <div className="flex items-start gap-3">
          <MandantInitial name={mandant.name} />
          <div className="min-w-0 flex-1">
            <p className="text-[#EDF1F5] font-semibold text-[14px] leading-tight truncate group-hover:text-[#9EAFC0] transition-colors">
              {mandant.name}
            </p>
            {mandant.ansprechpartner && (
              <p className="text-[#7A9BBD] text-[12px] mt-0.5 truncate flex items-center gap-1">
                <User className="w-3 h-3 flex-shrink-0" />
                {mandant.ansprechpartner}
              </p>
            )}
          </div>
        </div>

        {/* Info rows */}
        <div className="flex flex-col gap-1.5 flex-1">
          <div className="flex items-center gap-2 text-[12px]">
            <Mail className="w-3.5 h-3.5 text-[#6B8AAD] flex-shrink-0" />
            <span className="text-[#9EAFC0] truncate">{mandant.email}</span>
          </div>
          {mandant.ort && (
            <div className="flex items-center gap-2 text-[12px]">
              <MapPin className="w-3.5 h-3.5 text-[#6B8AAD] flex-shrink-0" />
              <span className="text-[#9EAFC0]">{mandant.plz ? `${mandant.plz} ` : ''}{mandant.ort}</span>
            </div>
          )}
          {mandant.telefon && (
            <div className="flex items-center gap-2 text-[12px]">
              <Phone className="w-3.5 h-3.5 text-[#6B8AAD] flex-shrink-0" />
              <span className="text-[#9EAFC0] truncate">{mandant.telefon}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/[0.07] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-[#4A6A8D]">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(mandant.created_at)}</span>
          </div>
          <div className="flex items-center gap-2">
            {typeof mandant.completed_analysen === 'number' && mandant.completed_analysen > 0 && (
              <div className="flex items-center gap-1 text-[11px] text-[#5B7A9D]">
                <BarChart3 className="w-3 h-3" />
                <span>{mandant.completed_analysen}</span>
              </div>
            )}
            <span className="text-[11px] font-medium text-[#5B7A9D] opacity-0 group-hover:opacity-100 transition-opacity">
              Details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Main View with Toggle ────────────────────────────────────────────────────
export function MandantenView({ mandanten, totalItems, searchQuery }: MandantenViewProps) {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const PAGE_SIZE = 20;

  const isEmpty = mandanten.length === 0;
  const emptyMsg = searchQuery ? `Keine Mandanten für "${searchQuery}" gefunden` : 'Keine Mandanten vorhanden';

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-[#6B8AAD]">
          {totalItems} {totalItems === 1 ? 'Mandant' : 'Mandanten'}
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
      ) : view === 'grid' ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {mandanten.map((m) => <MandantCard key={m.id} mandant={m} />)}
          </div>
          <Pagination totalItems={totalItems} pageSize={PAGE_SIZE} />
        </>
      ) : (
        <div className="bg-[#1E2A3A] rounded-2xl overflow-hidden border border-white/[0.07]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Firma</TableHead>
                <TableHead>Ansprechpartner</TableHead>
                <TableHead>E-Mail</TableHead>
                <TableHead>Ort</TableHead>
                <TableHead>Erstellt</TableHead>
                <TableHead className="w-20">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mandanten.map((mandant) => (
                <TableRow key={mandant.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${avatarColorFor(mandant.name)} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white text-[11px] font-bold">{mandant.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <span className="font-medium text-[#EDF1F5]">{mandant.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[#9EAFC0]">{mandant.ansprechpartner || '-'}</TableCell>
                  <TableCell className="text-[#9EAFC0] break-all">{mandant.email}</TableCell>
                  <TableCell className="text-[#9EAFC0]">{mandant.ort || '-'}</TableCell>
                  <TableCell className="text-[#9EAFC0]">{formatDate(mandant.created_at)}</TableCell>
                  <TableCell>
                    <Link href={`/mandanten/${mandant.id}`} className="text-[#7A9BBD] hover:text-[#9EAFC0] text-sm font-medium">
                      Details
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination totalItems={totalItems} pageSize={PAGE_SIZE} />
        </div>
      )}
    </div>
  );
}
