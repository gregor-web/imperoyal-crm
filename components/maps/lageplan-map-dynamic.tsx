'use client';

import dynamic from 'next/dynamic';

const LageplanMap = dynamic(
  () => import('@/components/maps/lageplan-map').then(mod => mod.LageplanMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] bg-slate-100 rounded-lg flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-500">
          <div className="w-4 h-4 border-2 border-slate-300 border-t-[#1E2A3A] rounded-full animate-spin" />
          <span className="text-sm">Karte wird geladen…</span>
        </div>
      </div>
    ),
  }
);

export { LageplanMap as DynamicLageplanMap };
