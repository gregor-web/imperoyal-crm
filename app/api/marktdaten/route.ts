// =====================================================
// API Route: Marktdaten via Perplexity
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchMarktDaten } from '@/lib/marktdaten';

// Admin client for server-side operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { objekt_id, strasse, plz, ort, gebaeudetyp, wohnflaeche, baujahr } = body;

    // Validate required fields
    if (!strasse || !plz || !ort) {
      return NextResponse.json(
        { error: 'Fehlende Pflichtfelder: strasse, plz, ort' },
        { status: 400 }
      );
    }

    // Fetch market data from Perplexity
    const marktdaten = await fetchMarktDaten(
      strasse,
      plz,
      ort,
      gebaeudetyp || null,
      wohnflaeche || null,
      baujahr || null
    );

    // If objekt_id is provided, we could cache the result in the database
    // For now, we just return the data
    if (objekt_id) {
      // Optional: Store marktdaten in a cache table or as part of objekt
      console.log(`Marktdaten für Objekt ${objekt_id} abgerufen`);
    }

    return NextResponse.json({
      success: true,
      marktdaten,
    });
  } catch (error) {
    console.error('Marktdaten API Error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Marktdaten' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch cached market data or trigger new fetch
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const strasse = searchParams.get('strasse');
    const plz = searchParams.get('plz');
    const ort = searchParams.get('ort');

    if (!strasse || !plz || !ort) {
      return NextResponse.json(
        { error: 'Fehlende Parameter: strasse, plz, ort' },
        { status: 400 }
      );
    }

    const marktdaten = await fetchMarktDaten(
      strasse,
      plz,
      ort,
      null,
      null,
      null
    );

    return NextResponse.json({
      success: true,
      marktdaten,
    });
  } catch (error) {
    console.error('Marktdaten API Error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Marktdaten' },
      { status: 500 }
    );
  }
}
