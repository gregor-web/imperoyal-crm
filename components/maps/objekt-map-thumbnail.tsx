'use client';

import { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';

interface ObjektMapThumbnailProps {
  address: string;
  className?: string;
}

/**
 * Lightweight static map thumbnail for object cards.
 * Geocodes address via Nominatim, then shows an OSM tile as background.
 */
export function ObjektMapThumbnail({ address, className = '' }: ObjektMapThumbnailProps) {
  const [tileUrl, setTileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const geocode = async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
          { headers: { 'User-Agent': 'Imperoyal-System/1.0' } }
        );
        const results = await res.json();

        if (cancelled || !results || results.length === 0) {
          setLoading(false);
          return;
        }

        const lat = parseFloat(results[0].lat);
        const lon = parseFloat(results[0].lon);

        // Generate static map URL using OSM tile server at zoom 16
        // We use multiple tiles centered on the location for a wider view
        const zoom = 16;
        const n = Math.pow(2, zoom);
        const xtile = Math.floor(((lon + 180) / 360) * n);
        const ytile = Math.floor(
          ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) * n
        );

        // Use the tile URL directly as background image
        const url = `https://tile.openstreetmap.org/${zoom}/${xtile}/${ytile}.png`;

        if (!cancelled) {
          setTileUrl(url);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    };

    geocode();
    return () => { cancelled = true; };
  }, [address]);

  if (loading) {
    return (
      <div className={`bg-[#162636] flex items-center justify-center ${className}`}>
        <div className="w-6 h-6 border-2 border-[#3D5167] border-t-[#5B7A9D] rounded-full animate-spin" />
      </div>
    );
  }

  if (!tileUrl) {
    return (
      <div className={`bg-gradient-to-br from-[#1E3A5F] to-[#0F2444] flex items-center justify-center ${className}`}>
        <Building2 className="w-16 h-16 text-white/10" />
      </div>
    );
  }

  return (
    <div
      className={`bg-[#162636] bg-cover bg-center ${className}`}
      style={{ backgroundImage: `url(${tileUrl})` }}
    />
  );
}
