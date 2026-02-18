'use client';

import dynamic from 'next/dynamic';
import { Building2 } from 'lucide-react';

const ObjektMapThumbnail = dynamic(
  () => import('@/components/maps/objekt-map-thumbnail').then(mod => mod.ObjektMapThumbnail),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 bg-[#162636] flex items-center justify-center">
        <Building2 className="w-12 h-12 text-white/10 animate-pulse" />
      </div>
    ),
  }
);

export { ObjektMapThumbnail as DynamicObjektMapThumbnail };
