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

        // BasemapDE WMS (Bundesamt für Kartographie und Geodäsie)
        L.tileLayer.wms('https://sgx.geodatenzentrum.de/wms_basemapde', {
          layers: 'de_basemapde_web_raster_farbe',
          format: 'image/png',
          transparent: false,
          styles: '',
          attribution: '&copy; <a href="https://www.bkg.bund.de">GeoBasis-DE / BKG</a> ' + new Date().getFullYear(),
          maxZoom: 19,
        } as any).addTo(map);

        // Crosshair marker (⊕) - Sprengnetter-style
        const crosshairIcon = L.divIcon({
          className: 'crosshair-marker',
          html: `
            <div style="
              position: relative;
              width: 32px;
              height: 32px;
            ">
              <!-- Outer circle -->
              <div style="
                position: absolute;
                top: 4px; left: 4px;
                width: 24px; height: 24px;
                border: 2.5px solid #cc0000;
                border-radius: 50%;
                background: transparent;
              "></div>
              <!-- Horizontal line -->
              <div style="
                position: absolute;
                top: 15px; left: -2px;
                width: 36px; height: 2.5px;
                background: #cc0000;
              "></div>
              <!-- Vertical line -->
              <div style="
                position: absolute;
                top: -2px; left: 15px;
                width: 2.5px; height: 36px;
                background: #cc0000;
              "></div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
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
        className="bg-slate-100 rounded-lg flex items-center justify-center gap-2 text-slate-500"
        style={{ height }}
      >
        <MapPin className="w-5 h-5" />
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  return (
    <div className="relative rounded-lg overflow-hidden border border-slate-200" style={{ height }}>
      {loading && (
        <div className="absolute inset-0 bg-slate-100 flex items-center justify-center z-10">
          <div className="flex items-center gap-2 text-slate-500">
            <div className="w-4 h-4 border-2 border-slate-300 border-t-[#1E2A3A] rounded-full animate-spin" />
            <span className="text-sm">Karte wird geladen…</span>
          </div>
        </div>
      )}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
