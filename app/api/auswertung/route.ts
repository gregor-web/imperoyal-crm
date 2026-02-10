import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { berechneAlles } from '@/lib/berechnungen';
import { ERLAEUTERUNGEN } from '@/lib/erlaeuterungen';
import { fetchMarktDaten } from '@/lib/marktdaten';
import { findePassendeKaeufer } from '@/lib/matching';
import type { Objekt, Einheit, ClaudeEmpfehlung, MarktDaten, Ankaufsprofil, Mandant } from '@/lib/types';
import { formatCurrency, formatPercent } from '@/lib/formatters';

const MAKE_WEBHOOK_URL = 'https://hook.eu1.make.com/toy335e81vu4s5sxdlq5p6gf2ou1r3k5';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 });
    }

    const { objekt_id } = await request.json();

    if (!objekt_id) {
      return NextResponse.json({ error: 'objekt_id erforderlich' }, { status: 400 });
    }

    // Load objekt with einheiten
    const { data: objekt, error: objektError } = await supabase
      .from('objekte')
      .select('*, einheiten(*)')
      .eq('id', objekt_id)
      .single();

    if (objektError || !objekt) {
      return NextResponse.json({ error: 'Objekt nicht gefunden' }, { status: 404 });
    }

    // Fetch market data from Perplexity FIRST (needed for calculations)
    let marktdaten: MarktDaten | null = null;
    try {
      marktdaten = await fetchMarktDaten(
        objekt.strasse,
        objekt.plz,
        objekt.ort,
        objekt.gebaeudetyp,
        objekt.wohnflaeche,
        objekt.baujahr
      );
      console.log('Marktdaten abgerufen:', marktdaten.standort);
    } catch (marktError) {
      console.error('Marktdaten konnten nicht abgerufen werden:', marktError);
    }

    // Run calculations with market data
    const einheiten = (objekt.einheiten || []) as Einheit[];
    const berechnungen = berechneAlles(objekt as Objekt, einheiten, marktdaten);

    // Call Claude API for recommendation
    let empfehlung: ClaudeEmpfehlung | null = null;

    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (anthropicKey) {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1500,
            messages: [
              {
                role: 'user',
                content: `Du bist ein erfahrener Immobilien-Analyst. Analysiere dieses Objekt:

OBJEKT: ${objekt.strasse}, ${objekt.plz} ${objekt.ort}
Kaufpreis: ${formatCurrency(objekt.kaufpreis)}
Rendite IST: ${formatPercent(berechnungen.rendite.rendite_ist)}
Rendite Optimiert: ${formatPercent(berechnungen.rendite.rendite_opt)}
Cashflow IST: ${formatCurrency(berechnungen.cashflow.cashflow_ist_jahr)} p.a.
Cashflow Optimiert: ${formatCurrency(berechnungen.cashflow.cashflow_opt_jahr)} p.a.
Mietpotenzial: ${formatCurrency(berechnungen.mietanalyse.potenzial_jahr)} p.a.
WEG: ${objekt.weg_aufgeteilt ? 'bereits aufgeteilt' : 'nicht aufgeteilt'}
WEG-Potenzial: ${formatCurrency(berechnungen.weg_potenzial.weg_gewinn)}
Kostenquote: ${formatPercent(berechnungen.kostenstruktur.kostenquote)} (${berechnungen.kostenstruktur.bewertung})
Haltedauer: ${objekt.haltedauer || 'nicht definiert'}
Risikoprofil: ${objekt.risikoprofil || 'nicht definiert'}
Primäres Ziel: ${objekt.primaeres_ziel || 'nicht definiert'}
${marktdaten ? `
AKTUELLE MARKTDATEN (via Perplexity):
- Vergleichsmiete Wohnen: ${marktdaten.vergleichsmiete_wohnen.wert} €/m² (${marktdaten.vergleichsmiete_wohnen.quelle})
- Vergleichsmiete Gewerbe: ${marktdaten.vergleichsmiete_gewerbe.wert} €/m² (${marktdaten.vergleichsmiete_gewerbe.quelle})
- Kappungsgrenze: ${marktdaten.kappungsgrenze.vorhanden ? `${marktdaten.kappungsgrenze.prozent}% (angespannter Markt)` : '20% (normaler Markt)'}
- Milieuschutzgebiet: ${marktdaten.milieuschutzgebiet.vorhanden ? `Ja${marktdaten.milieuschutzgebiet.gebiet_name ? ` (${marktdaten.milieuschutzgebiet.gebiet_name})` : ''}` : 'Nein'}
- Kaufpreisfaktor Region: ${marktdaten.kaufpreisfaktor_region.wert}x (${marktdaten.kaufpreisfaktor_region.quelle})
- Aktuelle Bauzinsen: ${marktdaten.aktuelle_bauzinsen.wert}% (${marktdaten.aktuelle_bauzinsen.zinsbindung})
- Preisprognose: ${marktdaten.preisprognose.kurz_0_3_jahre}% p.a. (0-3J), ${marktdaten.preisprognose.mittel_3_7_jahre}% p.a. (3-7J), ${marktdaten.preisprognose.lang_7_plus_jahre}% p.a. (7+J)
` : ''}
WICHTIG: Bei negativem Cashflow IMMER einen Handlungsschritt zur Finanzierungsoptimierung (Refinanzierung, Tilgungsstruktur) ergänzen.

Antworte NUR mit einem validen JSON-Objekt (keine Erklärung davor oder danach):
{
  "empfehlung": "HALTEN" | "OPTIMIEREN" | "RESTRUKTURIEREN" | "VERKAUFEN",
  "prioritaet": "niedrig" | "mittel" | "hoch",
  "begruendung": "3-4 Sätze zur Begründung",
  "handlungsschritte": [
    { "schritt": "Handlungsschritt 1", "zeitrahmen": "Sofort" },
    { "schritt": "Handlungsschritt 2", "zeitrahmen": "2 Wochen" },
    { "schritt": "Handlungsschritt 3", "zeitrahmen": "4 Wochen" },
    { "schritt": "Handlungsschritt 4", "zeitrahmen": "8 Wochen" }
  ],
  "chancen": ["Chance 1", "Chance 2"],
  "risiken": ["Risiko 1", "Risiko 2"],
  "fazit": "Ein zusammenfassendes Fazit"
}`,
              },
            ],
          }),
        });

        const data = await response.json();
        const content = data.content?.[0]?.text || '';
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          empfehlung = JSON.parse(jsonMatch[0]);
        }
      } catch (claudeError) {
        console.error('Claude API error:', claudeError);
        // Continue without Claude recommendation
      }
    }

    // Merge marktdaten into berechnungen for storage
    const berechnungenMitMarktdaten = {
      ...berechnungen,
      marktdaten: marktdaten || null,
    };

    // Save auswertung to database
    const { data: auswertung, error: insertError } = await supabase
      .from('auswertungen')
      .insert({
        objekt_id,
        mandant_id: objekt.mandant_id,
        berechnungen: berechnungenMitMarktdaten,
        empfehlung: empfehlung?.empfehlung || null,
        empfehlung_prioritaet: empfehlung?.prioritaet || null,
        empfehlung_begruendung: empfehlung?.begruendung || null,
        empfehlung_fazit: empfehlung?.fazit || null,
        empfehlung_handlungsschritte: empfehlung?.handlungsschritte || null,
        empfehlung_chancen: empfehlung?.chancen || null,
        empfehlung_risiken: empfehlung?.risiken || null,
        erlaeuterungen: ERLAEUTERUNGEN,
        status: 'erstellt',
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // =====================================================
    // AUTOMATISCHES KÄUFER-MATCHING BEI VERKAUFSEMPFEHLUNG
    // =====================================================
    let matchingResults: { count: number; emailsSent: number } | null = null;

    if (empfehlung?.empfehlung === 'VERKAUFEN') {
      try {
        console.log('Verkaufsempfehlung erkannt - starte automatisches Käufer-Matching...');

        // Use admin client to bypass RLS for matching
        const adminSupabase = createAdminClient();

        // Fetch all active ankaufsprofile (excluding the object owner)
        const { data: ankaufsprofile } = await adminSupabase
          .from('ankaufsprofile')
          .select('*')
          .neq('mandant_id', objekt.mandant_id);

        if (ankaufsprofile && ankaufsprofile.length > 0) {
          // Fetch mandanten for the profiles
          const mandantIds = [...new Set(ankaufsprofile.map(p => p.mandant_id))];
          const { data: mandanten } = await adminSupabase
            .from('mandanten')
            .select('*')
            .in('id', mandantIds);

          // Run matching algorithm
          const matches = findePassendeKaeufer(
            objekt as Objekt,
            ankaufsprofile as Ankaufsprofil[],
            (mandanten || []) as Mandant[]
          );

          console.log(`${matches.length} passende Käufer gefunden`);

          // Send emails to matching buyers via Make.com webhook
          let emailsSent = 0;
          for (const match of matches) {
            if (match.score >= 40 && match.mandant?.email) { // Minimum score threshold
              try {
                const webhookResponse = await fetch(MAKE_WEBHOOK_URL, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    type: 'buyer_match',
                    to: match.mandant.email,
                    subject: 'Neues Objekt passt zu Ihrem Ankaufsprofil - Imperoyal Immobilien',
                    buyer_name: match.mandant.ansprechpartner || match.mandant.name,
                    objekt_adresse: `${objekt.strasse}, ${objekt.plz} ${objekt.ort}`,
                    objekt_typ: objekt.gebaeudetyp || 'Immobilie',
                    kaufpreis: formatCurrency(objekt.kaufpreis),
                    rendite: formatPercent(berechnungen.rendite.rendite_ist),
                    wohnflaeche: objekt.wohnflaeche ? `${objekt.wohnflaeche} m²` : 'k.A.',
                    match_score: match.score,
                    match_details: [
                      match.matches.volumen ? '✓ Budget passt' : '',
                      match.matches.assetklasse ? '✓ Assetklasse passt' : '',
                      match.matches.region ? '✓ Region passt' : '',
                    ].filter(Boolean).join(', '),
                    ankaufsprofil_name: match.ankaufsprofil.name || 'Ihr Ankaufsprofil',
                  }),
                });

                if (webhookResponse.ok) {
                  emailsSent++;
                  console.log(`E-Mail gesendet an: ${match.mandant.email} (Score: ${match.score})`);
                }
              } catch (emailError) {
                console.error(`Fehler beim E-Mail-Versand an ${match.mandant.email}:`, emailError);
              }
            }
          }

          matchingResults = {
            count: matches.length,
            emailsSent,
          };

          console.log(`Matching abgeschlossen: ${matches.length} Matches, ${emailsSent} E-Mails gesendet`);
        }
      } catch (matchingError) {
        console.error('Fehler beim automatischen Matching:', matchingError);
        // Don't fail the whole request if matching fails
      }
    }

    return NextResponse.json({
      auswertung_id: auswertung.id,
      message: 'Auswertung erfolgreich erstellt',
      matching: matchingResults,
    });
  } catch (error) {
    console.error('Auswertung error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Fehler bei der Auswertung' },
      { status: 500 }
    );
  }
}
