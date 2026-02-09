import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { berechneAlles } from '@/lib/berechnungen';
import { ERLAEUTERUNGEN } from '@/lib/erlaeuterungen';
import type { Objekt, Einheit, ClaudeEmpfehlung } from '@/lib/types';
import { formatCurrency, formatPercent } from '@/lib/formatters';

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

    // Run calculations
    const einheiten = (objekt.einheiten || []) as Einheit[];
    const berechnungen = berechneAlles(objekt as Objekt, einheiten);

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

Antworte NUR mit einem validen JSON-Objekt (keine Erklärung davor oder danach):
{
  "empfehlung": "HALTEN" | "OPTIMIEREN" | "RESTRUKTURIEREN" | "VERKAUFEN",
  "prioritaet": "niedrig" | "mittel" | "hoch",
  "begruendung": "3-4 Sätze zur Begründung",
  "handlungsschritte": ["Schritt 1", "Schritt 2", "Schritt 3"],
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

    // Save auswertung to database
    const { data: auswertung, error: insertError } = await supabase
      .from('auswertungen')
      .insert({
        objekt_id,
        mandant_id: objekt.mandant_id,
        berechnungen,
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

    return NextResponse.json({
      auswertung_id: auswertung.id,
      message: 'Auswertung erfolgreich erstellt',
    });
  } catch (error) {
    console.error('Auswertung error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Fehler bei der Auswertung' },
      { status: 500 }
    );
  }
}
