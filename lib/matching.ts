// =====================================================
// Imperoyal Immobilien - Käufer-Matching
// Migriert aus reference/original.html Zeilen 538-556
// =====================================================

import type { Objekt, Ankaufsprofil, Mandant, MatchingResult } from './types';

/**
 * Findet passende Käufer (Ankaufsprofile) für ein Objekt.
 *
 * Matching-Score:
 * - Kaufpreis im Volumenbereich: +40 Punkte
 * - Assetklasse passt: +30 Punkte
 * - Region passt: +30 Punkte
 *
 * Max Score: 100 Punkte
 *
 * Ausgeschlossene Partner: Profile mit aktiver Ausschlussliste werden
 * gefiltert, wenn der Verkäufer-Mandant auf der Liste steht.
 */
export function findePassendeKaeufer(
  objekt: Objekt,
  ankaufsprofile: Ankaufsprofil[],
  mandanten: Mandant[],
  verkaeuferMandantName?: string
): MatchingResult[] {
  const kaufpreis = objekt.kaufpreis || 0;
  const gebaeudetyp = objekt.gebaeudetyp || '';
  const ort = objekt.ort || '';

  // Vorfilter 1: Ausgeschlossene Partner prüfen
  const afterExclusion = ankaufsprofile.filter((profil) => {
    if (!profil.ausgeschlossene_partner || !profil.ausgeschlossene_partner_liste) return true;
    if (!verkaeuferMandantName) return true;
    const ausgeschlossen = profil.ausgeschlossene_partner_liste
      .split(/[,;\n]+/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    const verkaeufer = verkaeuferMandantName.toLowerCase();
    return !ausgeschlossen.some((name) => verkaeufer.includes(name) || name.includes(verkaeufer));
  });

  // Vorfilter 2: Nur Profile, deren Volumenbereich grob passt (50% - 150%)
  const relevantProfiles = afterExclusion.filter((profil) => {
    const minVol = profil.min_volumen || 0;
    const maxVol = profil.max_volumen || Infinity;
    return kaufpreis >= minVol * 0.5 && kaufpreis <= maxVol * 1.5;
  });

  // Scoring für jedes relevante Profil
  const results: MatchingResult[] = relevantProfiles
    .map((profil) => {
      let score = 0;
      const matches = {
        volumen: false,
        assetklasse: false,
        region: false,
      };

      // Volumen-Match: Exakt im Bereich = 40 Punkte
      const minVol = profil.min_volumen || 0;
      const maxVol = profil.max_volumen || Infinity;
      if (kaufpreis >= minVol && kaufpreis <= maxVol) {
        score += 40;
        matches.volumen = true;
      }

      // Assetklassen-Match: +30 Punkte
      if (profil.assetklassen && profil.assetklassen.length > 0) {
        const assetMatch = profil.assetklassen.some(
          (a) =>
            gebaeudetyp.toLowerCase().includes(a.toLowerCase()) ||
            a.toLowerCase().includes(gebaeudetyp.toLowerCase())
        );
        if (assetMatch) {
          score += 30;
          matches.assetklasse = true;
        }
      }

      // Region-Match: +30 Punkte
      if (profil.regionen) {
        const regionMatch = profil.regionen
          .toLowerCase()
          .includes(ort.toLowerCase());
        if (regionMatch) {
          score += 30;
          matches.region = true;
        }
      }

      // Mandant finden
      const mandant = mandanten.find((m) => m.id === profil.mandant_id);

      return {
        ankaufsprofil: profil,
        mandant: mandant!,
        score,
        matches,
      };
    })
    .filter((result) => result.score > 0 && result.mandant)
    .sort((a, b) => b.score - a.score);

  return results;
}

/**
 * Berechnet einen Matching-Score als Prozent (0-100)
 */
export function getMatchingScorePercent(result: MatchingResult): number {
  return result.score;
}

/**
 * Gibt eine textuelle Beschreibung des Matchings zurück
 */
export function getMatchingDescription(result: MatchingResult): string {
  const parts: string[] = [];

  if (result.matches.volumen) {
    parts.push('Volumen passt');
  }
  if (result.matches.assetklasse) {
    parts.push('Assetklasse passt');
  }
  if (result.matches.region) {
    parts.push('Region passt');
  }

  return parts.length > 0 ? parts.join(', ') : 'Teilweise passend';
}

/**
 * Kategorisiert den Match-Score
 */
export function getMatchingCategory(
  score: number
): 'excellent' | 'good' | 'moderate' | 'low' {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'moderate';
  return 'low';
}
