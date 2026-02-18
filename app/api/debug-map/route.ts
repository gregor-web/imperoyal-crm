import { NextResponse } from 'next/server';

export const maxDuration = 30;

export async function GET() {
  const results: Record<string, unknown> = {};

  // Step 1: Geocode
  try {
    const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent('Eppendorfer Baum 28, 20249 Hamburg')}&limit=1`;
    const geoRes = await fetch(geoUrl, {
      headers: { 'User-Agent': 'Imperoyal-System/1.0' },
    });
    const geoData = await geoRes.json();
    results.geocode = {
      status: geoRes.status,
      lat: geoData[0]?.lat,
      lon: geoData[0]?.lon,
    };
  } catch (err) {
    results.geocode = { error: String(err) };
  }

  // Step 2: BKG WMS
  try {
    const wmsUrl = 'https://sgx.geodatenzentrum.de/wms_basemapde?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image/png&STYLES=&LAYERS=de_basemapde_web_raster_farbe&CRS=EPSG:4326&BBOX=53.5824,9.9784,53.5857,9.9891&WIDTH=1600&HEIGHT=600';
    const start = Date.now();
    const mapRes = await fetch(wmsUrl, {
      headers: { 'User-Agent': 'Imperoyal-System/1.0' },
    });
    const elapsed = Date.now() - start;
    const contentType = mapRes.headers.get('content-type');

    if (mapRes.ok && contentType?.includes('image')) {
      const buf = Buffer.from(await mapRes.arrayBuffer());
      results.bkg_wms = {
        status: mapRes.status,
        contentType,
        sizeBytes: buf.length,
        elapsedMs: elapsed,
        base64Preview: buf.toString('base64').substring(0, 50),
      };
    } else {
      const text = await mapRes.text();
      results.bkg_wms = {
        status: mapRes.status,
        contentType,
        elapsedMs: elapsed,
        body: text.substring(0, 500),
      };
    }
  } catch (err) {
    results.bkg_wms = { error: String(err) };
  }

  // Step 3: Full fetchTopographicMap
  try {
    const { fetchTopographicMap } = await import('@/lib/map-utils');
    const start = Date.now();
    const result = await fetchTopographicMap('Eppendorfer Baum 28', '20249', 'Hamburg');
    const elapsed = Date.now() - start;
    results.fetchTopographicMap = {
      success: !!result,
      elapsedMs: elapsed,
      base64Length: result?.length || 0,
    };
  } catch (err) {
    results.fetchTopographicMap = { error: String(err) };
  }

  return NextResponse.json(results, { status: 200 });
}
