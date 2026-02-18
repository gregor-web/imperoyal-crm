/**
 * Generates a static map image from OpenStreetMap tiles.
 * No API key required. No external dependencies (no sharp needed).
 * Geocoding via Nominatim. Returns a single centered tile as PNG base64.
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

/** Convert lat/lon to tile coordinates */
function latLonToTile(lat: number, lon: number, zoom: number): { x: number; y: number } {
  const n = Math.pow(2, zoom);
  const x = Math.floor((lon + 180) / 360 * n);
  const latRad = lat * Math.PI / 180;
  const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n);
  return { x, y };
}

/** Fetch a single OSM tile as PNG buffer */
async function fetchTile(x: number, y: number, zoom: number): Promise<Buffer | null> {
  const url = `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Imperoyal-System/1.0' },
    });
    if (res.ok) {
      return Buffer.from(await res.arrayBuffer());
    }
    console.warn(`[MAP] Tile ${zoom}/${x}/${y} returned ${res.status}`);
  } catch (err) {
    console.warn(`[MAP] Tile fetch failed:`, err);
  }
  return null;
}

/**
 * Fetch a static map image from OSM tiles.
 * Tries sharp for multi-tile composition. Falls back to single tile.
 * Returns a base64 data URL or null on failure.
 */
export async function fetchTopographicMap(
  strasse: string,
  plz: string,
  ort: string,
  width = 600,
  height = 300,
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

  const zoom = 17;
  const center = latLonToTile(lat, lon, zoom);

  // Try compositing multiple tiles with sharp (works locally + some hosts)
  try {
    const sharp = (await import('sharp')).default;

    // Calculate pixel offset within center tile
    const n = Math.pow(2, zoom);
    const latRad = lat * Math.PI / 180;
    const px = Math.floor(((lon + 180) / 360 * n - center.x) * 256);
    const py = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n - center.y) * 256);

    const tilesX = Math.ceil(width / 256) + 1;
    const tilesY = Math.ceil(height / 256) + 1;
    const halfTilesX = Math.floor(tilesX / 2);
    const halfTilesY = Math.floor(tilesY / 2);

    // Fetch tiles in parallel
    const tilePromises: Promise<{ buf: Buffer | null; col: number; row: number }>[] = [];
    for (let dy = -halfTilesY; dy <= halfTilesY; dy++) {
      for (let dx = -halfTilesX; dx <= halfTilesX; dx++) {
        tilePromises.push(
          fetchTile(center.x + dx, center.y + dy, zoom).then(buf => ({
            buf, col: dx + halfTilesX, row: dy + halfTilesY,
          }))
        );
      }
    }

    const tiles = await Promise.all(tilePromises);
    const validTiles = tiles.filter(t => t.buf !== null);

    if (validTiles.length > 0) {
      const gridW = (halfTilesX * 2 + 1) * 256;
      const gridH = (halfTilesY * 2 + 1) * 256;

      const composites = validTiles.map(t => ({
        input: t.buf as Buffer,
        left: t.col * 256,
        top: t.row * 256,
      }));

      const canvas = sharp({
        create: { width: gridW, height: gridH, channels: 3 as const, background: { r: 242, g: 239, b: 233 } },
      }).composite(composites).png();

      const offsetX = Math.max(0, Math.min(halfTilesX * 256 + px - Math.floor(width / 2), gridW - width));
      const offsetY = Math.max(0, Math.min(halfTilesY * 256 + py - Math.floor(height / 2), gridH - height));

      const cropped = await sharp(await canvas.toBuffer())
        .extract({ left: offsetX, top: offsetY, width: Math.min(width, gridW), height: Math.min(height, gridH) })
        .png()
        .toBuffer();

      console.log(`[MAP] Composed map with sharp: ${cropped.length} bytes`);
      return `data:image/png;base64,${cropped.toString('base64')}`;
    }
  } catch (sharpErr) {
    console.warn('[MAP] Sharp not available, falling back to single tile:', (sharpErr as Error).message);
  }

  // Fallback: Just use the center tile (256x256)
  console.log('[MAP] Fetching single center tile as fallback...');
  const tileBuf = await fetchTile(center.x, center.y, zoom);
  if (tileBuf) {
    console.log(`[MAP] Single tile: ${tileBuf.length} bytes`);
    return `data:image/png;base64,${tileBuf.toString('base64')}`;
  }

  return null;
}
