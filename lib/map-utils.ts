/**
 * Generates a static map image using Mapbox Static Images API.
 * Clean style with buildings, streets, house numbers – no transit clutter.
 * Free tier: 50,000 requests/month.
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
 * Fetch a static map image via Mapbox Static Images API.
 * Uses 'streets-v12' style – clean buildings, streets, house numbers.
 * Returns a base64 data URL or null on failure.
 */
export async function fetchTopographicMap(
  strasse: string,
  plz: string,
  ort: string,
  width = 1280,
  height = 900,
): Promise<string | null> {
  const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN;
  if (!mapboxToken) {
    console.warn('[MAP] MAPBOX_ACCESS_TOKEN not set');
    return null;
  }

  const address = `${strasse}, ${plz} ${ort}, Deutschland`;

  // Step 1: Geocode
  const coords = await geocodeAddress(address);
  if (!coords) {
    console.warn('[MAP] Could not geocode:', address);
    return null;
  }

  const { lat, lon } = coords;
  console.log(`[MAP] 📍 Geocoded: ${lat}, ${lon}`);

  // Step 2: Mapbox Static Images API
  // Zoom 18 = sehr nah (Gebäude + Hausnummern sichtbar)
  // Style: streets-v12 (sauber, Gebäude, Straßen, keine prominenten Transitlinien)
  // @2x für hohe Auflösung
  const zoom = 18;
  const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${lon},${lat},${zoom},0,0/${width}x${height}@2x?access_token=${mapboxToken}&attribution=false&logo=false`;

  try {
    console.log('[MAP] 🌐 Fetching Mapbox static map...');
    const res = await fetch(mapUrl);

    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('image')) {
        const buf = Buffer.from(await res.arrayBuffer());
        const format = contentType.includes('jpeg') ? 'jpeg' : 'png';
        console.log(`[MAP] ✅ Mapbox map loaded: ${buf.length} bytes`);
        return `data:image/${format};base64,${buf.toString('base64')}`;
      } else {
        const text = await res.text();
        console.warn('[MAP] Mapbox returned non-image:', contentType, text.slice(0, 300));
      }
    } else {
      const errText = await res.text();
      console.warn(`[MAP] Mapbox returned status ${res.status}:`, errText.slice(0, 300));
    }
  } catch (err) {
    console.warn('[MAP] Mapbox request failed:', err);
  }

  return null;
}
