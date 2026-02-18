/**
 * Generates a static map image using OpenStreetMap.
 * Uses staticmap.openstreetmap.de – free, no API key required.
 * Geocoding via Nominatim (OpenStreetMap).
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
 * Fetch a static map image via OpenStreetMap Static Map API.
 * Uses staticmap.openstreetmap.de – free, no API key needed.
 * Returns a base64 data URL or null on failure.
 */
export async function fetchTopographicMap(
  strasse: string,
  plz: string,
  ort: string,
  width = 600,
  height = 400,
): Promise<string | null> {
  const address = `${strasse}, ${plz} ${ort}, Deutschland`;

  // Step 1: Geocode
  const coords = await geocodeAddress(address);
  if (!coords) {
    console.warn('[MAP] Could not geocode:', address);
    return null;
  }

  const { lat, lon } = coords;
  console.log(`[MAP] Geocoded: ${lat}, ${lon}`);

  // Step 2: OpenStreetMap Static Map API
  // Zoom 17 = nah genug für Gebäude + Straßennamen
  // Max size: 1024x1024 bei staticmap.openstreetmap.de
  const zoom = 17;
  const clampedW = Math.min(width, 1024);
  const clampedH = Math.min(height, 1024);

  // Red marker at the location
  const mapUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lon}&zoom=${zoom}&size=${clampedW}x${clampedH}&maptype=mapnik&markers=${lat},${lon},red-pushpin`;

  try {
    console.log('[MAP] Fetching OSM static map...');
    const res = await fetch(mapUrl, {
      headers: { 'User-Agent': 'Imperoyal-System/1.0' },
    });

    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('image')) {
        const buf = Buffer.from(await res.arrayBuffer());
        const format = contentType.includes('jpeg') ? 'jpeg' : 'png';
        console.log(`[MAP] OSM map loaded: ${buf.length} bytes`);
        return `data:image/${format};base64,${buf.toString('base64')}`;
      } else {
        const text = await res.text();
        console.warn('[MAP] OSM returned non-image:', contentType, text.slice(0, 300));
      }
    } else {
      const errText = await res.text();
      console.warn(`[MAP] OSM returned status ${res.status}:`, errText.slice(0, 300));
    }
  } catch (err) {
    console.warn('[MAP] OSM request failed:', err);
  }

  return null;
}
