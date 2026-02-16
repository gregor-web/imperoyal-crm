import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { stripe, getTierForMandant } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Authenticate user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    // Get profile with mandant_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, mandant_id')
      .eq('id', user.id)
      .single();

    if (!profile?.mandant_id) {
      return NextResponse.json({ error: 'Kein Mandant zugeordnet' }, { status: 403 });
    }

    const { anfrage_id } = await request.json();

    if (!anfrage_id) {
      return NextResponse.json({ error: 'anfrage_id erforderlich' }, { status: 400 });
    }

    // Validate UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(anfrage_id)) {
      return NextResponse.json({ error: 'Ungültige Anfrage-ID' }, { status: 400 });
    }

    // Verify the anfrage belongs to this mandant and is pending payment
    const { data: anfrage, error: anfrageError } = await supabase
      .from('anfragen')
      .select('*, objekte(strasse, plz, ort, kaufpreis)')
      .eq('id', anfrage_id)
      .eq('mandant_id', profile.mandant_id)
      .single();

    if (anfrageError || !anfrage) {
      return NextResponse.json({ error: 'Anfrage nicht gefunden' }, { status: 404 });
    }

    if (anfrage.payment_status === 'paid') {
      return NextResponse.json({ error: 'Diese Anfrage wurde bereits bezahlt' }, { status: 400 });
    }

    // Use admin client for cross-mandant count
    const adminSupabase = createAdminClient();

    // Count completed auswertungen for this mandant to determine pricing tier
    const { count: completedCount } = await adminSupabase
      .from('auswertungen')
      .select('*', { count: 'exact', head: true })
      .eq('mandant_id', profile.mandant_id);

    const tier = getTierForMandant(completedCount || 0);

    // Get or create Stripe customer
    const { data: mandant } = await adminSupabase
      .from('mandanten')
      .select('id, name, email, stripe_customer_id')
      .eq('id', profile.mandant_id)
      .single();

    if (!mandant) {
      return NextResponse.json({ error: 'Mandant nicht gefunden' }, { status: 404 });
    }

    let stripeCustomerId = mandant.stripe_customer_id;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: mandant.email,
        name: mandant.name,
        metadata: {
          mandant_id: mandant.id,
        },
      });

      stripeCustomerId = customer.id;

      // Save Stripe customer ID
      await adminSupabase
        .from('mandanten')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', mandant.id);
    }

    const objekt = anfrage.objekte as { strasse: string; plz: string; ort: string; kaufpreis: number } | null;
    const objektBeschreibung = objekt
      ? `${objekt.strasse}, ${objekt.plz} ${objekt.ort}`
      : 'Immobilienanalyse';

    // Create Stripe Checkout Session
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'payment',
      // Automatische Zahlungsmethoden: Card, Apple Pay, Google Pay, SEPA, etc.
      payment_method_types: ['card', 'sepa_debit', 'link'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: tier.preisProAnalyseCents,
            product_data: {
              name: `Imperoyal Immobilienanalyse`,
              description: `${objektBeschreibung} — Tier: ${tier.label} (Analyse #${(completedCount || 0) + 1})`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        anfrage_id: anfrage_id,
        mandant_id: profile.mandant_id,
        tier: tier.name,
        auswertung_nr: String((completedCount || 0) + 1),
      },
      success_url: `${origin}/meine-anfragen?payment=success&anfrage=${anfrage_id}`,
      cancel_url: `${origin}/meine-anfragen?payment=cancelled&anfrage=${anfrage_id}`,
      locale: 'de',
      customer_update: {
        name: 'auto',
        address: 'auto',
      },
      tax_id_collection: { enabled: true },
      invoice_creation: {
        enabled: true,
        invoice_data: {
          footer: 'Imperoyal Immobilienanalyse – Vielen Dank für Ihr Vertrauen.',
        },
      },
    });

    // Store session ID on the anfrage
    await adminSupabase
      .from('anfragen')
      .update({
        stripe_session_id: session.id,
        amount_cents: tier.preisProAnalyseCents,
      })
      .eq('id', anfrage_id);

    return NextResponse.json({
      checkout_url: session.url,
      session_id: session.id,
      tier: tier.name,
      amount_cents: tier.preisProAnalyseCents,
    });
  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    const message = error instanceof Error ? error.message : 'Unbekannter Fehler';
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Checkout-Session', details: message },
      { status: 500 }
    );
  }
}
