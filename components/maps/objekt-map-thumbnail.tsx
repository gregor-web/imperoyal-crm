'use client';

import { useEffect, useRef, useState } from 'react';
import { Building2 } from 'lucide-react';

interface ObjektMapThumbnailProps {
  address: string;
  className?: string;
}

/**
 * Mini Leaflet map thumbnail for object cards.
 * Geocodes address via Nominatim, shows centered map with crosshair marker.
 * Non-interactive (static preview).
 */
export function ObjektMapThumbnail({ address, className = '' }: ObjektMapThumbnailProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    let cancelled = false;

    const initMap = async () => {
      try {
        const L = (await import('leaflet')).default;

        // Load Leaflet CSS once and wait for it
        if (!document.querySelector('link[href*="leaflet"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
          await new Promise<void>((resolve) => {
            link.onload = () => resolve();
            link.onerror = () => resolve();
            // Fallback timeout
            setTimeout(resolve, 2000);
          });
        }

        // Geocode address
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
          { headers: { 'User-Agent': 'Imperoyal-System/1.0' } }
        );
        const results = await res.json();

        if (cancelled) return;

        if (!results || results.length === 0) {
          setError(true);
          setLoading(false);
          return;
        }

        const lat = parseFloat(results[0].lat);
        const lon = parseFloat(results[0].lon);

        if (!mapRef.current || cancelled) return;

        // Create static map (no interaction)
        const map = L.map(mapRef.current, {
          center: [lat, lon],
          zoom: 18,
          scrollWheelZoom: false,
          dragging: false,
          touchZoom: false,
          doubleClickZoom: false,
          boxZoom: false,
          keyboard: false,
          zoomControl: false,
          attributionControl: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
        }).addTo(map);

        // Crosshair marker
        const crosshairIcon = L.divIcon({
          className: 'crosshair-marker',
          html: `
            <div style="position:relative;width:24px;height:24px;">
              <div style="position:absolute;top:4px;left:4px;width:16px;height:16px;border:1.5px solid #cc0000;border-radius:50%;background:transparent;"></div>
              <div style="position:absolute;top:11.5px;left:0;width:24px;height:1.5px;background:#cc0000;"></div>
              <div style="position:absolute;top:0;left:11.5px;width:1.5px;height:24px;background:#cc0000;"></div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        L.marker([lat, lon], { icon: crosshairIcon, interactive: false }).addTo(map);

        mapInstanceRef.current = map;

        if (!cancelled) {
          setLoading(false);
          // Multiple invalidateSize calls to handle layout shifts
          setTimeout(() => map.invalidateSize(), 50);
          setTimeout(() => map.invalidateSize(), 300);
          setTimeout(() => map.invalidateSize(), 800);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    };

    initMap();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [address]);

  if (error) {
    return (
      <div className={`bg-gradient-to-br from-[#1E3A5F] to-[#0F2444] flex items-center justify-center ${className}`}>
        <Building2 className="w-16 h-16 text-white/10" />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-[#162636] flex items-center justify-center z-10">
          <div className="w-5 h-5 border-2 border-[#3D5167] border-t-[#5B7A9D] rounded-full animate-spin" />
        </div>
      )}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
