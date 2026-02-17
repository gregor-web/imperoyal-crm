'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

interface LageplanMapProps {
  address: string;
  height?: number;
}

/**
 * Interactive Leaflet map with Sprengnetter-style BKG topographic tiles
 * and crosshair (⊕) marker. Germany only.
 */
export function LageplanMap({ address, height = 300 }: LageplanMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const initMap = async () => {
      try {
        const L = (await import('leaflet')).default;

        // Load Leaflet CSS
        if (!document.querySelector('link[href*="leaflet"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        // Geocode the address using Nominatim (free, no API key)
        const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
        const res = await fetch(geocodeUrl, {
          headers: { 'User-Agent': 'Imperoyal-System/1.0' },
        });
        const results = await res.json();

        if (!results || results.length === 0) {
          setError('Adresse konnte nicht gefunden werden');
          setLoading(false);
          return;
        }

        const lat = parseFloat(results[0].lat);
        const lon = parseFloat(results[0].lon);

        // Create map
        const map = L.map(mapRef.current!, {
          center: [lat, lon],
          zoom: 17,
          scrollWheelZoom: false,
          attributionControl: true,
        });

        // OpenStreetMap tiles (zuverlässig, kein API Key nötig)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        // Crosshair marker (⊕) – fein, wie bei Sprengnetter
        const crosshairIcon = L.divIcon({
          className: 'crosshair-marker',
          html: `
            <div style="
              position: relative;
              width: 24px;
              height: 24px;
            ">
              <!-- Outer circle -->
              <div style="
                position: absolute;
                top: 4px; left: 4px;
                width: 16px; height: 16px;
                border: 1.5px solid #cc0000;
                border-radius: 50%;
                background: transparent;
              "></div>
              <!-- Horizontal line -->
              <div style="
                position: absolute;
                top: 11.5px; left: 0;
                width: 24px; height: 1.5px;
                background: #cc0000;
              "></div>
              <!-- Vertical line -->
              <div style="
                position: absolute;
                top: 0; left: 11.5px;
                width: 1.5px; height: 24px;
                background: #cc0000;
              "></div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        // Add crosshair marker
        L.marker([lat, lon], { icon: crosshairIcon })
          .addTo(map)
          .bindPopup(`<strong style="font-size: 12px;">${address}</strong>`);

        // Add scale control (like Sprengnetter)
        L.control.scale({
          position: 'bottomright',
          metric: true,
          imperial: false,
          maxWidth: 150,
        }).addTo(map);

        mapInstanceRef.current = map;
        setLoading(false);

        setTimeout(() => map.invalidateSize(), 100);
      } catch (err) {
        console.error('Map error:', err);
        setError('Karte konnte nicht geladen werden');
        setLoading(false);
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [address]);

  if (error) {
    return (
      <div
        className="bg-[#162636] rounded-lg flex items-center justify-center gap-2 text-[#6B8AAD]"
        style={{ height }}
      >
        <MapPin className="w-5 h-5" />
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  return (
    <div className="relative rounded-lg overflow-hidden border border-white/[0.08]" style={{ height }}>
      {loading && (
        <div className="absolute inset-0 bg-[#162636] flex items-center justify-center z-10">
          <div className="flex items-center gap-2 text-[#6B8AAD]">
            <div className="w-4 h-4 border-2 border-[#253546] border-t-[#7A9BBD] rounded-full animate-spin" />
            <span className="text-sm">Karte wird geladen…</span>
          </div>
        </div>
      )}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
