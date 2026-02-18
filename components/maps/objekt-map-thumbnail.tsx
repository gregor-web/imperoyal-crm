'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Building2 } from 'lucide-react';

interface ObjektMapThumbnailProps {
  address: string;
  className?: string;
}

// ─── Shared singletons across all instances ──────────────────────────────────

// Geocode cache: avoid duplicate Nominatim requests
const geocodeCache = new Map<string, { lat: number; lon: number } | null>();

// Geocode queue: max 1 request per second (Nominatim policy)
let geocodeQueue: Array<{ address: string; resolve: (v: { lat: number; lon: number } | null) => void }> = [];
let geocodeRunning = false;

async function processGeocodeQueue() {
  if (geocodeRunning) return;
  geocodeRunning = true;
  while (geocodeQueue.length > 0) {
    const item = geocodeQueue.shift()!;
    // Check cache first (may have been cached while waiting)
    if (geocodeCache.has(item.address)) {
      item.resolve(geocodeCache.get(item.address)!);
      continue;
    }
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(item.address)}&limit=1`,
        { headers: { 'User-Agent': 'Imperoyal-System/1.0' } }
      );
      const results = await res.json();
      if (results && results.length > 0) {
        const coords = { lat: parseFloat(results[0].lat), lon: parseFloat(results[0].lon) };
        geocodeCache.set(item.address, coords);
        item.resolve(coords);
      } else {
        geocodeCache.set(item.address, null);
        item.resolve(null);
      }
    } catch {
      item.resolve(null);
    }
    // Wait 1.1s between requests to respect Nominatim rate limit
    if (geocodeQueue.length > 0) {
      await new Promise(r => setTimeout(r, 1100));
    }
  }
  geocodeRunning = false;
}

function geocodeAddress(address: string): Promise<{ lat: number; lon: number } | null> {
  if (geocodeCache.has(address)) {
    return Promise.resolve(geocodeCache.get(address)!);
  }
  return new Promise((resolve) => {
    geocodeQueue.push({ address, resolve });
    processGeocodeQueue();
  });
}

// Leaflet CSS: load once, shared promise
let leafletCssPromise: Promise<void> | null = null;

function ensureLeafletCss(): Promise<void> {
  if (leafletCssPromise) return leafletCssPromise;
  if (document.querySelector('link[href*="leaflet"]')) {
    leafletCssPromise = Promise.resolve();
    return leafletCssPromise;
  }
  leafletCssPromise = new Promise<void>((resolve) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.onload = () => resolve();
    link.onerror = () => resolve();
    document.head.appendChild(link);
    setTimeout(resolve, 3000); // fallback
  });
  return leafletCssPromise;
}

// Leaflet module: import once
let leafletPromise: Promise<typeof import('leaflet')> | null = null;

function getLeaflet() {
  if (!leafletPromise) {
    leafletPromise = import('leaflet');
  }
  return leafletPromise;
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Mini Leaflet map thumbnail for object cards.
 * - Lazy loads via IntersectionObserver (only when visible)
 * - Geocode results are cached across all instances
 * - Geocoding is rate-limited (1 req/sec queue)
 * - Leaflet CSS + JS loaded once globally
 */
export function ObjektMapThumbnail({ address, className = '' }: ObjektMapThumbnailProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const initStarted = useRef(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  // Observe visibility
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // start loading 200px before visible
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  // Init map only when visible
  const initMap = useCallback(async () => {
    if (initStarted.current || !mapDivRef.current) return;
    initStarted.current = true;

    try {
      // Load Leaflet CSS + JS in parallel, then geocode
      const [L] = await Promise.all([getLeaflet(), ensureLeafletCss()]);

      const coords = await geocodeAddress(address);

      if (!coords) {
        setError(true);
        setLoading(false);
        return;
      }

      if (!mapDivRef.current) return;

      // Create static map (no interaction)
      const map = L.map(mapDivRef.current, {
        center: [coords.lat, coords.lon],
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

      L.marker([coords.lat, coords.lon], { icon: crosshairIcon, interactive: false }).addTo(map);

      mapInstanceRef.current = map;
      setLoading(false);

      // Invalidate size after layout settles
      requestAnimationFrame(() => map.invalidateSize());
      setTimeout(() => map.invalidateSize(), 200);
      setTimeout(() => map.invalidateSize(), 600);

      // Also invalidate when tiles load
      map.on('load', () => map.invalidateSize());
    } catch {
      setError(true);
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (isVisible) {
      initMap();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isVisible, initMap]);

  if (error) {
    return (
      <div className={`bg-gradient-to-br from-[#1E3A5F] to-[#0F2444] flex items-center justify-center ${className}`}>
        <Building2 className="w-16 h-16 text-white/10" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-[#162636] flex items-center justify-center z-10">
          <div className="w-5 h-5 border-2 border-[#3D5167] border-t-[#5B7A9D] rounded-full animate-spin" />
        </div>
      )}
      <div ref={mapDivRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
