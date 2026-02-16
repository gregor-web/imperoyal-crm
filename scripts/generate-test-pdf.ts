import { renderToBuffer } from '@react-pdf/renderer';
import { AuswertungPDF } from '../components/pdf/auswertung-pdf';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log('📡 Fetching auswertung...');
  const { data: auswertung, error } = await supabase
    .from('auswertungen')
    .select('*, objekte (id, strasse, plz, ort, baujahr, milieuschutz, weg_aufgeteilt, kaufpreis), mandanten (name, ansprechpartner, anrede)')
    .eq('id', '82416fbd-3110-4609-a847-f790b5024040')
    .single();

  if (error || !auswertung) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
  console.log('✅ Auswertung loaded:', auswertung.empfehlung);

  const objekt = auswertung.objekte as any;
  const mandant = auswertung.mandanten as any;

  const { data: einheiten } = await supabase
    .from('einheiten')
    .select('position, nutzung, flaeche, kaltmiete, vergleichsmiete, mietvertragsart')
    .eq('objekt_id', objekt.id)
    .order('position');
  console.log('✅ Einheiten:', einheiten?.length || 0);

  // Logo
  let logoUrl: string | undefined;
  try {
    const logoBuffer = fs.readFileSync(path.join(__dirname, '..', 'public', 'logo_imperoyal.png'));
    logoUrl = `data:image/png;base64,${logoBuffer.toString('base64')}`;
    console.log('✅ Logo loaded');
  } catch {
    console.warn('⚠️ Logo not found');
  }

  // Mapbox Static Map (sauber, ohne Transit-Linien)
  let mapUrl: string | undefined;
  console.log('🗺️ Fetching Mapbox static map...');
  try {
    const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN;
    if (!mapboxToken) {
      console.warn('⚠️ MAPBOX_ACCESS_TOKEN not set in .env.local');
    } else {
      const address = `${objekt.strasse}, ${objekt.plz} ${objekt.ort}, Deutschland`;
      const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
      const geoRes = await fetch(geocodeUrl, { headers: { 'User-Agent': 'Imperoyal-System/1.0' } });
      const geoResults = await geoRes.json();

      if (geoResults && geoResults.length > 0) {
        const lat = parseFloat(geoResults[0].lat);
        const lon = parseFloat(geoResults[0].lon);
        console.log(`📍 Geocoded: ${lat}, ${lon}`);

        // Zoom 18 = sehr nah (Gebäude + Hausnummern)
        const staticUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${lon},${lat},18,0,0/1280x900@2x?access_token=${mapboxToken}&attribution=false&logo=false`;
        console.log('🌐 Fetching Mapbox...');
        const mapRes = await fetch(staticUrl);

        if (mapRes.ok) {
          const contentType = mapRes.headers.get('content-type') || '';
          if (contentType.includes('image')) {
            const buf = Buffer.from(await mapRes.arrayBuffer());
            const format = contentType.includes('jpeg') ? 'jpeg' : 'png';
            mapUrl = `data:image/${format};base64,${buf.toString('base64')}`;
            console.log('✅ Mapbox map loaded:', buf.length, 'bytes');
          } else {
            const text = await mapRes.text();
            console.warn('⚠️ Mapbox returned non-image:', contentType, text.slice(0, 200));
          }
        } else {
          const errText = await mapRes.text();
          console.warn('⚠️ Mapbox failed:', mapRes.status, errText.slice(0, 200));
        }
      } else {
        console.warn('⚠️ Geocoding returned no results');
      }
    }
  } catch (err) {
    console.warn('⚠️ Map error:', err);
  }

  console.log('📄 Generating PDF...');
  const pdfBuffer = await renderToBuffer(
    AuswertungPDF({
      objekt,
      mandant: mandant || { name: 'Test' },
      einheiten: einheiten || [],
      berechnungen: auswertung.berechnungen,
      empfehlung: auswertung.empfehlung,
      empfehlung_begruendung: auswertung.empfehlung_begruendung,
      empfehlung_prioritaet: auswertung.empfehlung_prioritaet,
      empfehlung_handlungsschritte: auswertung.empfehlung_handlungsschritte,
      empfehlung_chancen: auswertung.empfehlung_chancen,
      empfehlung_risiken: auswertung.empfehlung_risiken,
      empfehlung_fazit: auswertung.empfehlung_fazit,
      created_at: auswertung.created_at,
      logoUrl,
      mapUrl,
    })
  );

  const outPath = path.join(__dirname, '..', 'imperoyal_auswertung_test.pdf');
  fs.writeFileSync(outPath, pdfBuffer);
  console.log(`✅ PDF saved: ${outPath} (${pdfBuffer.length} bytes)`);
  console.log('🎉 Done! Open the PDF to check the map.');
}

main().catch(console.error);
