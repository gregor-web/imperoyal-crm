// =====================================================
// Öffentliche API Route: Marktdaten für Onboarding
// Kein Auth nötig, aber rate-limited
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { fetchMarktDaten } from '@/lib/marktdaten';

// Simple in-memory rate limiting (per IP, max 10 requests per minute)
const rateLimit = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Content-Type check
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 415 }
      );
    }

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { strasse, plz, ort, gebaeudetyp, wohnflaeche, baujahr } = body;

    // Validate required fields
    if (!plz || !ort) {
      return NextResponse.json(
        { error: 'Fehlende Pflichtfelder: plz, ort' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const cleanStrasse = (strasse || '').trim().slice(0, 200);
    const cleanPlz = plz.trim().slice(0, 10);
    const cleanOrt = ort.trim().slice(0, 100);

    // Fetch real market data from Perplexity
    const marktdaten = await fetchMarktDaten(
      cleanStrasse,
      cleanPlz,
      cleanOrt,
      gebaeudetyp || null,
      wohnflaeche ? Number(wohnflaeche) : null,
      baujahr ? Number(baujahr) : null
    );

    return NextResponse.json({
      success: true,
      vergleichsmiete_wohnen: marktdaten.vergleichsmiete_wohnen.wert,
      vergleichsmiete_gewerbe: marktdaten.vergleichsmiete_gewerbe.wert,
      quelle_wohnen: marktdaten.vergleichsmiete_wohnen.quelle,
      quelle_gewerbe: marktdaten.vergleichsmiete_gewerbe.quelle,
    });
  } catch (error) {
    console.error('Public Marktdaten API Error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Marktdaten' },
      { status: 500 }
    );
  }
}
