/**
 * Generates a static map image from OpenStreetMap tiles.
 * Fetches multiple tiles, composes them into a single image using Canvas (sharp).
 * No API key required. Geocoding via Nominatim.
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
function latLonToTile(lat: number, lon: number, zoom: number): { x: number; y: number; px: number; py: number } {
  const n = Math.pow(2, zoom);
  const x = Math.floor((lon + 180) / 360 * n);
  const latRad = lat * Math.PI / 180;
  const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n);
  // Pixel offset within tile (256x256)
  const px = Math.floor(((lon + 180) / 360 * n - x) * 256);
  const py = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n - y) * 256);
  return { x, y, px, py };
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
  } catch {
    // ignore
  }
  return null;
}

/**
 * Fetch a static map image by compositing OSM tiles.
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

  // Step 2: Determine which tiles to fetch
  const zoom = 17;
  const center = latLonToTile(lat, lon, zoom);

  // We need enough tiles to cover width x height
  // Each tile is 256x256
  const tilesX = Math.ceil(width / 256) + 1; // +1 for offset
  const tilesY = Math.ceil(height / 256) + 1;
  const halfTilesX = Math.floor(tilesX / 2);
  const halfTilesY = Math.floor(tilesY / 2);

  // Step 3: Fetch all tiles in parallel
  const tilePromises: Promise<{ buf: Buffer | null; col: number; row: number }>[] = [];
  for (let dy = -halfTilesY; dy <= halfTilesY; dy++) {
    for (let dx = -halfTilesX; dx <= halfTilesX; dx++) {
      const tx = center.x + dx;
      const ty = center.y + dy;
      tilePromises.push(
        fetchTile(tx, ty, zoom).then(buf => ({ buf, col: dx + halfTilesX, row: dy + halfTilesY }))
      );
    }
  }

  const tiles = await Promise.all(tilePromises);
  const validTiles = tiles.filter(t => t.buf !== null);

  if (validTiles.length === 0) {
    console.warn('[MAP] No tiles fetched');
    return null;
  }

  console.log(`[MAP] Fetched ${validTiles.length} OSM tiles`);

  // Step 4: Compose tiles into a single image using sharp
  try {
    const sharp = (await import('sharp')).default;

    const gridW = (halfTilesX * 2 + 1) * 256;
    const gridH = (halfTilesY * 2 + 1) * 256;

    // Compose all tiles onto a canvas
    const composites = validTiles.map(t => ({
      input: t.buf as Buffer,
      left: t.col * 256,
      top: t.row * 256,
    }));

    // Create blank canvas and composite tiles
    const canvas = sharp({
      create: {
        width: gridW,
        height: gridH,
        channels: 3,
        background: { r: 242, g: 239, b: 233 }, // OSM background color
      },
    })
      .composite(composites)
      .png();

    // Crop to center on the exact location
    const offsetX = Math.max(0, Math.floor(halfTilesX * 256 + center.px - width / 2));
    const offsetY = Math.max(0, Math.floor(halfTilesY * 256 + center.py - height / 2));

    const cropped = await sharp(await canvas.toBuffer())
      .extract({
        left: Math.min(offsetX, gridW - width),
        top: Math.min(offsetY, gridH - height),
        width: Math.min(width, gridW),
        height: Math.min(height, gridH),
      })
      .png()
      .toBuffer();

    console.log(`[MAP] Composed map: ${cropped.length} bytes (${width}x${height})`);
    return `data:image/png;base64,${cropped.toString('base64')}`;
  } catch (err) {
    console.warn('[MAP] Sharp compositing failed:', err);

    // Fallback: return just the center tile
    const centerTile = tiles.find(t => t.col === halfTilesX && t.row === halfTilesY && t.buf);
    if (centerTile?.buf) {
      console.log('[MAP] Fallback: using single center tile');
      return `data:image/png;base64,${centerTile.buf.toString('base64')}`;
    }
  }

  return null;
}
