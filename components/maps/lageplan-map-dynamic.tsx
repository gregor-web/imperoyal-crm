'use client';

import dynamic from 'next/dynamic';

const LageplanMap = dynamic(
  () => import('@/components/maps/lageplan-map').then(mod => mod.LageplanMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] bg-[#162636] rounded-lg flex items-center justify-center">
        <div className="flex items-center gap-2 text-[#6B8AAD]">
          <div className="w-4 h-4 border-2 border-[#253546] border-t-[#7A9BBD] rounded-full animate-spin" />
          <span className="text-sm">Karte wird geladen…</span>
        </div>
      </div>
    ),
  }
);

export { LageplanMap as DynamicLageplanMap };
