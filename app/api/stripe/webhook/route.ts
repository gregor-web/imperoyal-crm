import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import type Stripe from 'stripe';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  if (!WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET ist nicht gesetzt');
    return NextResponse.json({ error: 'Webhook nicht konfiguriert' }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Keine Signatur' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook Signatur-Fehler:', err);
    return NextResponse.json({ error: 'Ungültige Signatur' }, { status: 400 });
  }

  const adminSupabase = createAdminClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        const anfrageId = session.metadata?.anfrage_id;
        const mandantId = session.metadata?.mandant_id;
        const tier = session.metadata?.tier;
        const auswertungNr = session.metadata?.auswertung_nr;

        if (!anfrageId || !mandantId) {
          console.error('Fehlende Metadata in Checkout Session:', session.id);
          break;
        }

        // Idempotency: Check if already processed
        const { data: existing } = await adminSupabase
          .from('payments')
          .select('id')
          .eq('stripe_session_id', session.id)
          .single();

        if (existing) {
          console.log('Payment bereits verarbeitet:', session.id);
          break;
        }

        // Create payment record
        await adminSupabase.from('payments').insert({
          anfrage_id: anfrageId,
          mandant_id: mandantId,
          stripe_session_id: session.id,
          stripe_payment_intent_id: typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id || null,
          amount_cents: session.amount_total || 0,
          currency: session.currency || 'eur',
          status: 'succeeded',
          tier: tier || 'einstieg',
          auswertung_nr: parseInt(auswertungNr || '1', 10),
          metadata: {
            customer_email: session.customer_details?.email,
            customer_name: session.customer_details?.name,
          },
        });

        // Update anfrage status to 'bezahlt'
        await adminSupabase
          .from('anfragen')
          .update({
            status: 'bezahlt',
            payment_status: 'paid',
            paid_at: new Date().toISOString(),
          })
          .eq('id', anfrageId);

        // Increment completed_analysen counter on mandant
        try {
          await adminSupabase.rpc('increment_completed_analysen', { p_mandant_id: mandantId });
        } catch (countErr) {
          console.warn('Konnte completed_analysen nicht inkrementieren:', countErr);
        }

        console.log(`✅ Zahlung erfolgreich: Anfrage ${anfrageId}, ${session.amount_total} Cent`);
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        const anfrageId = session.metadata?.anfrage_id;

        if (anfrageId) {
          await adminSupabase
            .from('anfragen')
            .update({ payment_status: 'failed' })
            .eq('id', anfrageId)
            .eq('payment_status', 'pending');

          console.log(`⏰ Checkout abgelaufen: Anfrage ${anfrageId}`);
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = typeof charge.payment_intent === 'string'
          ? charge.payment_intent
          : charge.payment_intent?.id;

        if (paymentIntentId) {
          // Update payment status
          const { data: payment } = await adminSupabase
            .from('payments')
            .update({ status: 'refunded' })
            .eq('stripe_payment_intent_id', paymentIntentId)
            .select('anfrage_id')
            .single();

          if (payment) {
            await adminSupabase
              .from('anfragen')
              .update({ payment_status: 'refunded' })
              .eq('id', payment.anfrage_id);
          }

          console.log(`💸 Erstattung verarbeitet: PI ${paymentIntentId}`);
        }
        break;
      }

      default:
        // Unhandled event type – ignorieren
        break;
    }
  } catch (err) {
    console.error('Webhook-Verarbeitungsfehler:', err);
    return NextResponse.json({ error: 'Verarbeitungsfehler' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
