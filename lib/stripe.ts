import Stripe from 'stripe';

// Lazy initialization to avoid build-time errors when env var is not set
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY ist nicht gesetzt');
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-01-28.clover',
      typescript: true,
    });
  }
  return _stripe;
}

// Keep backward-compatible export (getter)
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

// ============================================
// PRICING TIERS (netto, exkl. MwSt.)
// ============================================
// Einstieg:     1–10 Analysen   → 350 € pro Analyse
// Portfolio:    11–49 Analysen  → 250 € pro Analyse
// Großbestand:  ab 50 Analysen  → 180 € pro Analyse
// ============================================

export interface PricingTier {
  name: 'einstieg' | 'portfolio' | 'grossbestand';
  label: string;
  minAnalysen: number;
  maxAnalysen: number | null;
  preisProAnalyse: number; // in Euro, netto
  preisProAnalyseCents: number; // in Cent, netto
  beschreibung: string;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    name: 'einstieg',
    label: 'Einstieg',
    minAnalysen: 1,
    maxAnalysen: 10,
    preisProAnalyse: 350,
    preisProAnalyseCents: 35000,
    beschreibung: 'Für erste Portfolio-Einblicke sowie zum Testen und Kennenlernen der Analysen.',
  },
  {
    name: 'portfolio',
    label: 'Portfolio',
    minAnalysen: 11,
    maxAnalysen: 49,
    preisProAnalyse: 250,
    preisProAnalyseCents: 25000,
    beschreibung: 'Für professionelle Immobilienportfolios, Vermögensverwalter und Holdings.',
  },
  {
    name: 'grossbestand',
    label: 'Großbestand',
    minAnalysen: 50,
    maxAnalysen: null,
    preisProAnalyse: 180,
    preisProAnalyseCents: 18000,
    beschreibung: 'Für große Immobilienbestände mit Fokus auf strategische Gesamtoptimierung.',
  },
];

/**
 * Ermittelt den Preis-Tier basierend auf der Anzahl bereits abgeschlossener
 * Auswertungen eines Mandanten. Die nächste Auswertung zählt als completedCount + 1.
 */
export function getTierForMandant(completedAuswertungenCount: number): PricingTier {
  const nextNumber = completedAuswertungenCount + 1;

  for (const tier of PRICING_TIERS) {
    if (tier.maxAnalysen === null) {
      return tier; // Letzter Tier (Großbestand) für alles ab 50
    }
    if (nextNumber >= tier.minAnalysen && nextNumber <= tier.maxAnalysen) {
      return tier;
    }
  }

  // Fallback: Einstieg
  return PRICING_TIERS[0];
}

/**
 * Alle Features die in jeder Tier enthalten sind
 */
export const TIER_FEATURES = [
  'Vollständige Analyse inkl. Handlungsempfehlung',
  'Steuerlich, ertragsseitig, strukturell & markttechnisch',
  'Klare Entscheidungsgrundlage auf Objekt- und Portfolioebene',
];
