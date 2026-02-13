import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { berechneAlles } from '@/lib/berechnungen';
import { ERLAEUTERUNGEN } from '@/lib/erlaeuterungen';
import { fetchMarktDaten } from '@/lib/marktdaten';
import { findePassendeKaeufer } from '@/lib/matching';
import type { Objekt, Einheit, ClaudeEmpfehlung, MarktDaten, Ankaufsprofil, Mandant, Berechnungen } from '@/lib/types';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import { renderToBuffer } from '@react-pdf/renderer';
import { AuswertungPDF } from '@/components/pdf/auswertung-pdf';
import fs from 'fs';
import path from 'path';

const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL || '';

/** Escape HTML special characters to prevent XSS in email templates */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function generateBuyerMatchEmailHtml(
  buyerName: string,
  objektAdresse: string,
  objektTyp: string,
  kaufpreis: string,
  rendite: string,
  wohnflaeche: string,
  matchDetails: string[],
  kontaktUrl: string
): string {
  const safeBuyerName = escapeHtml(buyerName);
  const safeAdresse = escapeHtml(objektAdresse);
  const safeTyp = escapeHtml(objektTyp);
  const safeKaufpreis = escapeHtml(kaufpreis);
  const safeRendite = escapeHtml(rendite);
  const safeWohnflaeche = escapeHtml(wohnflaeche);
  const safeKontaktUrl = encodeURI(kontaktUrl);
  const matchBadges = matchDetails
    .map(detail => `<span style="display: inline-block; background: rgba(212, 175, 55, 0.2); color: #d4af37; padding: 4px 12px; border-radius: 4px; font-size: 13px; margin-right: 8px; margin-bottom: 8px;">${escapeHtml(detail)}</span>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Georgia', 'Times New Roman', serif; background-color: #0a0f1a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px; background-color: #0a0f1a;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px;">

          <tr>
            <td style="padding: 40px; text-align: center; background: linear-gradient(180deg, #0d1421 0%, #1a2744 100%);">
              <h1 style="margin: 0 0 10px; color: #d4af37; font-size: 28px; font-weight: 400; letter-spacing: 2px;">
                Neues Investment-Objekt
              </h1>
              <p style="margin: 0; color: #c9b896; font-size: 16px; font-style: italic;">
                passend zu Ihrem Ankaufsprofil
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 35px 40px; background-color: #0d1421;">
              <p style="margin: 0 0 25px; color: #e8e0d0; font-size: 16px; line-height: 1.8;">
                Sehr geehrte(r) <span style="color: #d4af37;">${safeBuyerName}</span>,
              </p>

              <p style="margin: 0 0 25px; color: #a89f8f; font-size: 15px; line-height: 1.8;">
                Wir haben ein neues Objekt in unserem Portfolio, das zu Ihren Suchkriterien passt:
              </p>

              <!-- Objekt-Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 25px 0; background: linear-gradient(135deg, #1a2744 0%, #0d1421 100%); border: 1px solid rgba(212, 175, 55, 0.4); border-radius: 8px;">
                <tr>
                  <td style="padding: 25px;">
                    <p style="margin: 0 0 15px; color: #d4af37; font-size: 13px; text-transform: uppercase; letter-spacing: 3px; font-weight: 600;">
                      Objekt-Details
                    </p>

                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 10px 0; color: #8a8275; font-size: 14px; border-bottom: 1px solid rgba(212, 175, 55, 0.2);">Adresse:</td>
                        <td style="padding: 10px 0; color: #e8e0d0; font-size: 15px; font-weight: 500; text-align: right; border-bottom: 1px solid rgba(212, 175, 55, 0.2);">${safeAdresse}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; color: #8a8275; font-size: 14px; border-bottom: 1px solid rgba(212, 175, 55, 0.2);">Objekttyp:</td>
                        <td style="padding: 10px 0; color: #e8e0d0; font-size: 15px; font-weight: 500; text-align: right; border-bottom: 1px solid rgba(212, 175, 55, 0.2);">${safeTyp}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; color: #8a8275; font-size: 14px; border-bottom: 1px solid rgba(212, 175, 55, 0.2);">Kaufpreis:</td>
                        <td style="padding: 10px 0; color: #d4af37; font-size: 18px; font-weight: 700; text-align: right; border-bottom: 1px solid rgba(212, 175, 55, 0.2);">${safeKaufpreis}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; color: #8a8275; font-size: 14px; border-bottom: 1px solid rgba(212, 175, 55, 0.2);">Rendite IST:</td>
                        <td style="padding: 10px 0; color: #22c55e; font-size: 16px; font-weight: 600; text-align: right; border-bottom: 1px solid rgba(212, 175, 55, 0.2);">${safeRendite}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; color: #8a8275; font-size: 14px;">Wohnfläche:</td>
                        <td style="padding: 10px 0; color: #e8e0d0; font-size: 15px; font-weight: 500; text-align: right;">${safeWohnflaeche}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Match-Kriterien -->
              <p style="margin: 0 0 10px; color: #d4af37; font-size: 13px; text-transform: uppercase; letter-spacing: 2px;">
                Passend zu Ihrem Profil:
              </p>
              <div style="margin-bottom: 25px;">
                ${matchBadges}
              </div>

              <p style="margin: 0 0 30px; color: #a89f8f; font-size: 14px; line-height: 1.7;">
                Bei Interesse kontaktieren Sie uns gerne für weitere Informationen und ein ausführliches Exposé.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${safeKontaktUrl}" style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #b8942e 100%); color: #0a0f1a; text-decoration: none; padding: 14px 35px; border-radius: 4px; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;">
                      Interesse bekunden
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 25px 40px; text-align: center; border-top: 1px solid rgba(212, 175, 55, 0.3);">
              <p style="margin: 0 0 8px; color: #5a5549; font-size: 12px;">
                © 2025 Imperoyal Immobilien. Alle Rechte vorbehalten.
              </p>
              <p style="margin: 0; color: #4a453f; font-size: 11px;">
                Für Family Offices, UHNWIs & Institutionelle Vermögensverwalter
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 });
    }

    const { objekt_id } = await request.json();

    if (!objekt_id) {
      return NextResponse.json({ error: 'objekt_id erforderlich' }, { status: 400 });
    }

    // SECURITY: Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(objekt_id)) {
      return NextResponse.json({ error: 'Ungültige Objekt-ID' }, { status: 400 });
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
AKTUELLE MARKTDATEN:
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
    // PDF GENERIEREN UND SPEICHERN
    // =====================================================
    let pdfUrl: string | null = null;

    try {
      console.log('[AUSWERTUNG] Generiere PDF für Auswertung:', auswertung.id);

      const adminSupabase = createAdminClient();

      // Fetch mandant data for PDF
      const { data: mandant } = await adminSupabase
        .from('mandanten')
        .select('name, ansprechpartner, anrede')
        .eq('id', objekt.mandant_id)
        .single();

      // Read logo file
      let logoUrl: string | undefined;
      try {
        const logoPath = path.join(process.cwd(), 'public', 'logo_imperoyal.png');
        const logoBuffer = fs.readFileSync(logoPath);
        logoUrl = `data:image/png;base64,${logoBuffer.toString('base64')}`;
      } catch {
        console.warn('[AUSWERTUNG] Logo nicht gefunden');
      }

      // Generate PDF
      const pdfBuffer = await renderToBuffer(
        AuswertungPDF({
          objekt: {
            strasse: objekt.strasse,
            plz: objekt.plz,
            ort: objekt.ort,
            baujahr: objekt.baujahr,
            milieuschutz: objekt.milieuschutz,
            weg_aufgeteilt: objekt.weg_aufgeteilt,
            kaufpreis: objekt.kaufpreis,
          },
          mandant: mandant ? {
            name: mandant.name,
            ansprechpartner: mandant.ansprechpartner,
            anrede: mandant.anrede as 'Herr' | 'Frau' | null | undefined,
          } : { name: 'Unbekannt', ansprechpartner: 'Unbekannt' },
          einheiten: einheiten.map(e => ({
            position: e.position,
            nutzung: e.nutzung,
            flaeche: e.flaeche,
            kaltmiete: e.kaltmiete,
            vergleichsmiete: e.vergleichsmiete,
            mietvertragsart: e.mietvertragsart,
          })),
          berechnungen: berechnungenMitMarktdaten as Berechnungen,
          empfehlung: empfehlung?.empfehlung || undefined,
          empfehlung_begruendung: empfehlung?.begruendung || undefined,
          empfehlung_prioritaet: empfehlung?.prioritaet || undefined,
          empfehlung_handlungsschritte: empfehlung?.handlungsschritte?.map(h =>
            typeof h === 'string' ? h : `${h.schritt} (${h.zeitrahmen})`
          ),
          empfehlung_chancen: empfehlung?.chancen || undefined,
          empfehlung_risiken: empfehlung?.risiken || undefined,
          empfehlung_fazit: empfehlung?.fazit || undefined,
          created_at: auswertung.created_at,
          logoUrl,
        })
      );

      console.log('[AUSWERTUNG] PDF generiert, Größe:', pdfBuffer.length, 'bytes');

      // Create filename for storage - format: Imperoyal_Auswertung_Strasse_Ort_Datum.pdf
      const cleanText = (text: string) => text
        .replace(/[äÄ]/g, 'ae')
        .replace(/[öÖ]/g, 'oe')
        .replace(/[üÜ]/g, 'ue')
        .replace(/ß/g, 'ss')
        .replace(/[^a-zA-Z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
      const cleanStrasse = cleanText(objekt.strasse);
      const cleanOrt = cleanText(objekt.ort);
      const dateStr = new Date(auswertung.created_at).toISOString().split('T')[0];
      const storagePath = `Imperoyal_Auswertung_${cleanStrasse}_${cleanOrt}_${dateStr}.pdf`;

      // Upload to Supabase Storage
      const { error: uploadError } = await adminSupabase.storage
        .from('auswertungen-pdfs')
        .upload(storagePath, Buffer.from(pdfBuffer), {
          contentType: 'application/pdf',
          upsert: true,
        });

      if (uploadError) {
        console.error('[AUSWERTUNG] Upload Fehler:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = adminSupabase.storage
        .from('auswertungen-pdfs')
        .getPublicUrl(storagePath);

      pdfUrl = urlData.publicUrl;
      console.log('[AUSWERTUNG] PDF hochgeladen:', pdfUrl);

      // Update auswertung with pdf_url
      await adminSupabase
        .from('auswertungen')
        .update({ pdf_url: pdfUrl })
        .eq('id', auswertung.id);

    } catch (pdfError) {
      console.error('[AUSWERTUNG] PDF Generierung fehlgeschlagen:', pdfError);
      // Don't fail the whole request if PDF generation fails
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
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://imperoyal-app.vercel.app';

          for (const match of matches) {
            if (match.score >= 40 && match.mandant?.email) { // Minimum score threshold
              try {
                // Build match details for display
                const matchDetails: string[] = [];
                if (match.matches.volumen) matchDetails.push('Budget passt');
                if (match.matches.assetklasse) matchDetails.push('Assetklasse passt');
                if (match.matches.region) matchDetails.push('Region passt');

                // Generate interesse URL with mandant and ankaufsprofil IDs
                const interesseUrl = `${appUrl}/interesse?objekt=${objekt_id}&m=${match.mandant.id}&ap=${match.ankaufsprofil.id}`;

                // Generate complete HTML email
                const htmlContent = generateBuyerMatchEmailHtml(
                  match.mandant.ansprechpartner || match.mandant.name,
                  `${objekt.strasse}, ${objekt.plz} ${objekt.ort}`,
                  objekt.gebaeudetyp || 'Immobilie',
                  formatCurrency(objekt.kaufpreis),
                  formatPercent(berechnungen.rendite.rendite_ist),
                  objekt.wohnflaeche ? `${objekt.wohnflaeche} m²` : 'k.A.',
                  matchDetails,
                  interesseUrl
                );

                const webhookResponse = await fetch(MAKE_WEBHOOK_URL, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    type: 'buyer_match',
                    to: match.mandant.email,
                    subject: 'Neues Investment-Objekt passend zu Ihrem Ankaufsprofil',
                    html: htmlContent,
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
      pdf_url: pdfUrl,
      matching: matchingResults,
    });
  } catch (error) {
    console.error('Auswertung error:', error);
    return NextResponse.json(
      { error: 'Fehler bei der Auswertung' },
      { status: 500 }
    );
  }
}
