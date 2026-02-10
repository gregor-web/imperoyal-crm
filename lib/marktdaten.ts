// =====================================================
// Imperoyal Immobilien - Marktdaten via Perplexity API
// =====================================================

import { MarktDaten } from './types';

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface PerplexityResponse {
  id: string;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
}

/**
 * Recherchiert aktuelle Marktdaten für einen Standort via Perplexity API
 */
export async function fetchMarktDaten(
  strasse: string,
  plz: string,
  ort: string,
  gebaeudetyp: string | null,
  wohnflaeche: number | null,
  baujahr: number | null
): Promise<MarktDaten> {
  const apiKey = process.env.PERPLEXITY_API_KEY;

  if (!apiKey) {
    console.warn('PERPLEXITY_API_KEY nicht gesetzt - verwende Fallback-Werte');
    return getDefaultMarktDaten(plz, ort);
  }

  const standort = `${strasse}, ${plz} ${ort}`;
  const objektInfo = [
    gebaeudetyp && `Gebäudetyp: ${gebaeudetyp}`,
    wohnflaeche && `Wohnfläche: ${wohnflaeche} m²`,
    baujahr && `Baujahr: ${baujahr}`,
  ]
    .filter(Boolean)
    .join(', ');

  const systemPrompt = `Du bist ein Immobilien-Marktanalyst für den deutschen Immobilienmarkt.
Recherchiere aktuelle Marktdaten und liefere präzise Zahlen.
Antworte IMMER im JSON-Format ohne zusätzlichen Text oder Markdown.
Wenn du keine genauen Daten findest, schätze basierend auf vergleichbaren Standorten.
Gib bei allen Quellen nur den Namen an (z.B. "Mietspiegel München 2024", "ImmoScout24").`;

  const userPrompt = `Recherchiere aktuelle Immobilien-Marktdaten für:

Standort: ${standort}
${objektInfo ? `Objekt: ${objektInfo}` : ''}

Finde folgende Informationen:
1. Ortsübliche Vergleichsmiete Wohnen (€/m² kalt)
2. Ortsübliche Vergleichsmiete Gewerbe (€/m² kalt)
3. Gilt eine Kappungsgrenze von 15% (angespannter Markt) oder 20% (normal)?
4. Liegt der Standort in einem Milieuschutzgebiet / Erhaltungsgebiet?
5. Durchschnittlicher Kaufpreisfaktor der Region (Faktor auf Jahresnettokaltmiete)
6. Aktuelle Bauzinsen für 10 Jahre Zinsbindung
7. Preisprognose: Erwartete jährliche Wertsteigerung für 0-3 Jahre, 3-7 Jahre, 7+ Jahre

Antworte NUR mit diesem JSON (keine Erklärungen, kein Markdown):
{
  "vergleichsmiete_wohnen": {"wert": <number>, "quelle": "<string>"},
  "vergleichsmiete_gewerbe": {"wert": <number>, "quelle": "<string>"},
  "kappungsgrenze": {"vorhanden": <boolean>, "prozent": <15 oder 20>},
  "milieuschutzgebiet": {"vorhanden": <boolean>, "gebiet_name": "<string oder null>"},
  "kaufpreisfaktor_region": {"wert": <number>, "quelle": "<string>"},
  "aktuelle_bauzinsen": {"wert": <number>, "zinsbindung": "10 Jahre"},
  "preisprognose": {
    "kurz_0_3_jahre": <number>,
    "mittel_3_7_jahre": <number>,
    "lang_7_plus_jahre": <number>
  }
}`;

  const messages: PerplexityMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  try {
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar', // Perplexity's online model with web search
        messages,
        max_tokens: 1000,
        temperature: 0.1, // Low temperature for factual responses
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API Error:', response.status, errorText);
      return getDefaultMarktDaten(plz, ort);
    }

    const data: PerplexityResponse = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      console.error('Perplexity: Leere Antwort');
      return getDefaultMarktDaten(plz, ort);
    }

    // Parse JSON from response (remove potential markdown code blocks)
    const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(jsonStr);

    // Validate and return
    return {
      vergleichsmiete_wohnen: {
        wert: Number(parsed.vergleichsmiete_wohnen?.wert) || 12,
        quelle: String(parsed.vergleichsmiete_wohnen?.quelle || 'Marktrecherche'),
      },
      vergleichsmiete_gewerbe: {
        wert: Number(parsed.vergleichsmiete_gewerbe?.wert) || 15,
        quelle: String(parsed.vergleichsmiete_gewerbe?.quelle || 'Marktrecherche'),
      },
      kappungsgrenze: {
        vorhanden: Boolean(parsed.kappungsgrenze?.vorhanden),
        prozent: parsed.kappungsgrenze?.prozent === 15 ? 15 : 20,
      },
      milieuschutzgebiet: {
        vorhanden: Boolean(parsed.milieuschutzgebiet?.vorhanden),
        gebiet_name: parsed.milieuschutzgebiet?.gebiet_name || null,
      },
      kaufpreisfaktor_region: {
        wert: Number(parsed.kaufpreisfaktor_region?.wert) || 20,
        quelle: String(parsed.kaufpreisfaktor_region?.quelle || 'Marktrecherche'),
      },
      aktuelle_bauzinsen: {
        wert: Number(parsed.aktuelle_bauzinsen?.wert) || 3.5,
        zinsbindung: String(parsed.aktuelle_bauzinsen?.zinsbindung || '10 Jahre'),
      },
      preisprognose: {
        kurz_0_3_jahre: Number(parsed.preisprognose?.kurz_0_3_jahre) || 2.0,
        mittel_3_7_jahre: Number(parsed.preisprognose?.mittel_3_7_jahre) || 2.5,
        lang_7_plus_jahre: Number(parsed.preisprognose?.lang_7_plus_jahre) || 2.5,
      },
      abfrage_datum: new Date().toISOString(),
      standort,
    };
  } catch (error) {
    console.error('Perplexity API Fehler:', error);
    return getDefaultMarktDaten(plz, ort);
  }
}

/**
 * Fallback-Werte wenn Perplexity nicht verfügbar
 * Basierend auf groben regionalen Schätzungen
 */
function getDefaultMarktDaten(plz: string, ort: string): MarktDaten {
  // Grobe Einschätzung basierend auf PLZ-Bereich
  const plzPrefix = plz.substring(0, 2);

  // A-Städte (höhere Mieten, Kappungsgrenze)
  const aStaedte = ['10', '12', '13', '14', '20', '22', '60', '80', '81', '70', '50', '40'];
  const isAStadt = aStaedte.includes(plzPrefix);

  // München besonders teuer
  const isMuenchen = plzPrefix === '80' || plzPrefix === '81';

  return {
    vergleichsmiete_wohnen: {
      wert: isMuenchen ? 18 : isAStadt ? 14 : 10,
      quelle: 'Regionale Schätzung',
    },
    vergleichsmiete_gewerbe: {
      wert: isMuenchen ? 25 : isAStadt ? 18 : 12,
      quelle: 'Regionale Schätzung',
    },
    kappungsgrenze: {
      vorhanden: isAStadt,
      prozent: isAStadt ? 15 : 20,
    },
    milieuschutzgebiet: {
      vorhanden: false,
      gebiet_name: null,
    },
    kaufpreisfaktor_region: {
      wert: isMuenchen ? 30 : isAStadt ? 25 : 18,
      quelle: 'Regionale Schätzung',
    },
    aktuelle_bauzinsen: {
      wert: 3.5,
      zinsbindung: '10 Jahre',
    },
    preisprognose: {
      kurz_0_3_jahre: 2.0,
      mittel_3_7_jahre: 2.5,
      lang_7_plus_jahre: 2.5,
    },
    abfrage_datum: new Date().toISOString(),
    standort: `${plz} ${ort}`,
  };
}

/**
 * Prüft ob die Marktdaten noch aktuell sind (max 7 Tage alt)
 */
export function isMarktDatenAktuell(marktdaten: MarktDaten): boolean {
  const abfrageDatum = new Date(marktdaten.abfrage_datum);
  const now = new Date();
  const diffDays = (now.getTime() - abfrageDatum.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= 7;
}
