import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { findePassendeKaeufer } from '@/lib/matching';
import type { Objekt, Ankaufsprofil, Mandant } from '@/lib/types';

/**
 * Cron-Job: Tägliches Käufer-Matching
 * 
 * Prüft alle zum Verkauf markierten Objekte gegen alle aktiven Ankaufsprofile.
 * Neue Treffer werden in matching_ergebnisse gespeichert.
 * Admin wird per E-Mail über neue Matches benachrichtigt.
 * 
 * Trigger: Vercel Cron (täglich 08:00 CET)
 * Auth: CRON_SECRET Header
 */
export async function GET(request: Request) {
  // Auth: Nur Vercel Cron darf diesen Endpoint aufrufen
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();

    // 1. Alle zum Verkauf markierten Objekte laden
    const { data: verkaufsObjekte, error: objError } = await supabase
      .from('objekte')
      .select('*, mandanten(id, name)')
      .eq('zum_verkauf', true);

    if (objError) {
      console.error('Fehler beim Laden der Verkaufsobjekte:', objError);
      return NextResponse.json({ error: 'DB-Fehler' }, { status: 500 });
    }

    if (!verkaufsObjekte || verkaufsObjekte.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Keine Verkaufsobjekte vorhanden',
        neue_matches: 0,
      });
    }

    // 2. Alle aktiven Ankaufsprofile laden
    const { data: ankaufsprofile, error: profileError } = await supabase
      .from('ankaufsprofile')
      .select('*')
      .eq('kaufinteresse_aktiv', true);

    if (profileError || !ankaufsprofile || ankaufsprofile.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Keine aktiven Ankaufsprofile vorhanden',
        neue_matches: 0,
      });
    }

    // 3. Alle Mandanten laden
    const mandantIds = [
      ...new Set([
        ...ankaufsprofile.map((p) => p.mandant_id),
        ...verkaufsObjekte.map((o) => o.mandant_id),
      ]),
    ];
    const { data: mandanten } = await supabase
      .from('mandanten')
      .select('*')
      .in('id', mandantIds);

    // 4. Bestehende Matches laden (um Duplikate zu vermeiden)
    const { data: bestehendeMatches } = await supabase
      .from('matching_ergebnisse')
      .select('objekt_id, ankaufsprofil_id');

    const bestehendeKeys = new Set(
      (bestehendeMatches || []).map((m) => `${m.objekt_id}__${m.ankaufsprofil_id}`)
    );

    // 5. Matching für jedes Verkaufsobjekt durchführen
    let neueMatchesGesamt = 0;
    const neueMatchDetails: Array<{
      objekt: string;
      kaeufer: string;
      score: number;
    }> = [];

    for (const objekt of verkaufsObjekte) {
      const verkaeuferMandant = objekt.mandanten as { id: string; name: string } | null;
      const verkaeuferName = verkaeuferMandant?.name;

      // Eigene Profile ausschließen (Verkäufer matched nicht mit sich selbst)
      const fremdeProfile = ankaufsprofile.filter(
        (p) => p.mandant_id !== objekt.mandant_id
      );

      if (fremdeProfile.length === 0) continue;

      const matches = findePassendeKaeufer(
        objekt as unknown as Objekt,
        fremdeProfile as Ankaufsprofil[],
        (mandanten || []) as Mandant[],
        verkaeuferName
      );

      // Nur neue Matches speichern
      for (const match of matches) {
        const key = `${objekt.id}__${match.ankaufsprofil.id}`;
        if (bestehendeKeys.has(key)) continue;

        const { error: insertError } = await supabase
          .from('matching_ergebnisse')
          .insert({
            objekt_id: objekt.id,
            ankaufsprofil_id: match.ankaufsprofil.id,
            kaeufer_mandant_id: match.mandant.id,
            verkaeufer_mandant_id: objekt.mandant_id,
            score: match.score,
            matches: match.matches,
            status: 'neu',
          });

        if (!insertError) {
          neueMatchesGesamt++;
          neueMatchDetails.push({
            objekt: `${objekt.strasse}, ${objekt.ort}`,
            kaeufer: match.mandant.name,
            score: match.score,
          });
          bestehendeKeys.add(key);
        }
      }
    }

    // 6. Admin per E-Mail benachrichtigen wenn neue Matches gefunden
    if (neueMatchesGesamt > 0 && process.env.MAKE_WEBHOOK_URL) {
      const matchSummary = neueMatchDetails
        .map((m) => `• ${m.objekt} → ${m.kaeufer} (Score: ${m.score}%)`)
        .join('\n');

      try {
        await fetch(process.env.MAKE_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            actionId: 4, // Matching-Benachrichtigung
            to: 'admin@imperoyal.de', // Admin-E-Mail
            subject: `${neueMatchesGesamt} neue Käufer-Matches gefunden`,
            html: `
              <h2>Täglicher Käufer-Abgleich</h2>
              <p>Es wurden <strong>${neueMatchesGesamt} neue Matches</strong> gefunden:</p>
              <pre>${matchSummary}</pre>
              <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://imperoyal.de'}/anfragen">
                Matches ansehen →
              </a></p>
            `,
          }),
        });
      } catch (emailError) {
        console.error('E-Mail-Benachrichtigung fehlgeschlagen:', emailError);
      }
    }

    console.log(
      `[Cron Matching] ${verkaufsObjekte.length} Objekte geprüft, ${neueMatchesGesamt} neue Matches`
    );

    return NextResponse.json({
      success: true,
      objekte_geprueft: verkaufsObjekte.length,
      profile_aktiv: ankaufsprofile.length,
      neue_matches: neueMatchesGesamt,
      details: neueMatchDetails,
    });
  } catch (error) {
    console.error('[Cron Matching] Fehler:', error);
    return NextResponse.json(
      { error: 'Interner Fehler beim Matching' },
      { status: 500 }
    );
  }
}
