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
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9EAFC0]" />
        <input
          type="text"
          placeholder={placeholder}
          defaultValue={currentSearch}
          onChange={(e) => updateParams('q', e.target.value)}
          className="glass-input w-full pl-10 pr-4 py-2.5 rounded-lg text-[#1E2A3A] placeholder-[#9EAFC0] text-sm"
        />
      </div>

      {/* Filter Selects */}
      {filters.map((filter) => (
        <select
          key={filter.key}
          value={searchParams.get(filter.key) || ''}
          onChange={(e) => updateParams(filter.key, e.target.value)}
          className="glass-input px-4 py-2.5 rounded-lg text-[#1E2A3A] text-sm min-w-[160px]"
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
