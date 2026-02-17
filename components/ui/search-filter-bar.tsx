'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useTransition } from 'react';
import { Search } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface SearchFilterBarProps {
  placeholder?: string;
  filters?: {
    key: string;
    label: string;
    options: FilterOption[];
  }[];
}

export function SearchFilterBar({ placeholder = 'Suchen...', filters = [] }: SearchFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get('q') || '';

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // Reset to page 1 on search/filter change
      params.delete('page');
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [searchParams, pathname, router]
  );

  return (
    <div className={`flex flex-col sm:flex-row gap-3 ${isPending ? 'opacity-70' : ''}`}>
      {/* Search Input */}
      <div className="relative flex-1" style={{ position: 'relative' }}>
        <Search
          className="w-4 h-4 text-[#6B8AAD]"
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
        <input
          type="text"
          placeholder={placeholder}
          defaultValue={currentSearch}
          onChange={(e) => updateParams('q', e.target.value)}
          className="glass-input w-full rounded-lg text-[#EDF1F5] placeholder-[#9EAFC0] text-sm"
          style={{ paddingLeft: '36px', paddingRight: '16px', paddingTop: '10px', paddingBottom: '10px' }}
        />
      </div>

      {/* Filter Selects */}
      {filters.map((filter) => (
        <select
          key={filter.key}
          value={searchParams.get(filter.key) || ''}
          onChange={(e) => updateParams(filter.key, e.target.value)}
          className="glass-input px-4 py-2.5 rounded-lg text-[#EDF1F5] text-sm min-w-[160px]"
        >
          <option value="">{filter.label}</option>
          {filter.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
}
