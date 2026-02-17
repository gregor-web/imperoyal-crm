'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  totalItems: number;
  pageSize?: number;
}

export function Pagination({ totalItems, pageSize = 20 }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPage = Number(searchParams.get('page') || '1');
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  if (totalPages <= 1) return null;

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete('page');
    } else {
      params.set('page', String(page));
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  // Generate page numbers to show
  const pages: (number | 'ellipsis')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('ellipsis');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('ellipsis');
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 sm:px-0">
      <div className="text-sm text-[#7A9BBD]">
        {totalItems} Einträge · Seite {currentPage} von {totalPages}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-2 rounded-lg text-[#7A9BBD] hover:bg-[#253546] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Vorherige Seite"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {pages.map((p, i) =>
          p === 'ellipsis' ? (
            <span key={`e${i}`} className="px-2 text-[#6B8AAD]">…</span>
          ) : (
            <button
              key={p}
              onClick={() => goToPage(p)}
              className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors ${
                p === currentPage
                  ? 'bg-[#5B7A9D] text-white'
                  : 'text-[#7A9BBD] hover:bg-[#253546]'
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-2 rounded-lg text-[#7A9BBD] hover:bg-[#253546] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Nächste Seite"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
