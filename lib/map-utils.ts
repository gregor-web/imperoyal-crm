/**
 * Generates a static map image using BasemapDE WMS from the
 * Bundesamt für Kartographie und Geodäsie (BKG).
 * Produces a Sprengnetter-style topographic Lageplan.
 * No API key required – free for all uses.
 *
 * The crosshair marker (⊕) is rendered in React-PDF on top of this image.
 */

/**
 * Geocode an address using Nominatim (OpenStreetMap – free, no API key)
 */
async function geocodeAddress(address: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Imperoyal-System/1.0' },
    });
    const results = await res.json();
    if (results && results.length > 0) {
      return { lat: parseFloat(results[0].lat), lon: parseFloat(results[0].lon) };
    }
  } catch (err) {
    console.warn('[MAP] Geocoding failed:', err);
  }
  return null;
}

/**
 * Calculate bounding box around a point for WMS requests.
 * Returns [south, west, north, east] in EPSG:4326.
 */
function calculateBbox(
  lat: number,
  lon: number,
  widthMeters = 150,
  heightMeters = 80,
): [number, number, number, number] {
  const latOffset = heightMeters / 111320;
  const lonOffset = widthMeters / (111320 * Math.cos((lat * Math.PI) / 180));
  return [lat - latOffset, lon - lonOffset, lat + latOffset, lon + lonOffset];
}

/**
 * Fetch a static BKG topographic map image.
 * Returns a base64 data URL or null on failure.
 */
export async function fetchTopographicMap(
  strasse: string,
  plz: string,
  ort: string,
  width = 800,
  height = 350,
): Promise<string | null> {
  const address = `${strasse}, ${plz} ${ort}`;

  // Step 1: Geocode
  const coords = await geocodeAddress(address);
  if (!coords) {
    console.warn('[MAP] Could not geocode:', address);
    return null;
  }

  const { lat, lon } = coords;
  console.log(`[MAP] Geocoded: ${lat}, ${lon}`);
  const [south, west, north, east] = calculateBbox(lat, lon);

  // Step 2: BasemapDE WMS (BKG) – free, no API key, returns PNG directly
  const wmsUrl = [
    'https://sgx.geodatenzentrum.de/wms_basemapde',
    '?SERVICE=WMS',
    '&VERSION=1.3.0',
    '&REQUEST=GetMap',
    '&FORMAT=image/png',
    '&STYLES=',
    '&LAYERS=de_basemapde_web_raster_farbe',
    '&CRS=EPSG:4326',
    `&BBOX=${south},${west},${north},${east}`,
    `&WIDTH=${width}`,
    `&HEIGHT=${height}`,
  ].join('');

  try {
    console.log('[MAP] Fetching BasemapDE (BKG) map...');
    const res = await fetch(wmsUrl, {
      headers: { 'User-Agent': 'Imperoyal-System/1.0' },
    });

    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('image')) {
        const buf = Buffer.from(await res.arrayBuffer());
        console.log(`[MAP] BKG map loaded: ${buf.length} bytes`);
        return `data:image/png;base64,${buf.toString('base64')}`;
      } else {
        const text = await res.text();
        console.warn('[MAP] BKG returned non-image:', contentType, text.slice(0, 300));
      }
    } else {
      console.warn(`[MAP] BKG WMS returned status ${res.status}`);
    }
  } catch (err) {
    console.warn('[MAP] BKG WMS request failed:', err);
  }

  return null;
}
