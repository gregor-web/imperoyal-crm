'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { Loader2, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

interface AnfrageButtonProps {
  objektId: string;
  mandantId: string;
}

export function AnfrageButton({ objektId, mandantId }: AnfrageButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectToCheckout = async (anfrageId: string) => {
    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anfrage_id: anfrageId }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Fehler beim Erstellen der Checkout-Session');
    }

    if (data.checkout_url) {
      window.location.href = data.checkout_url;
    } else {
      throw new Error('Keine Checkout-URL erhalten');
    }
  };

  const handleAnfrage = async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Check if Auswertung already exists
      const { data: auswertung } = await supabase
        .from('auswertungen')
        .select('id')
        .eq('objekt_id', objektId)
        .limit(1)
        .single();

      if (auswertung) {
        toast.warning('Für dieses Objekt existiert bereits eine Auswertung');
        setError('Für dieses Objekt existiert bereits eine Auswertung');
        setLoading(false);
        return;
      }

      // Check if anfrage already exists (any active status)
      const { data: existing } = await supabase
        .from('anfragen')
        .select('id, payment_status')
        .eq('objekt_id', objektId)
        .in('status', ['offen', 'bezahlt', 'in_bearbeitung'])
        .single();

      if (existing) {
        if (existing.payment_status === 'pending') {
          // Anfrage exists but payment pending – redirect to checkout
          toast.info('Weiterleitung zur Zahlung...');
          await redirectToCheckout(existing.id);
          return;
        }
        toast.warning('Es existiert bereits eine Anfrage für dieses Objekt');
        setError('Es existiert bereits eine Anfrage für dieses Objekt');
        setLoading(false);
        return;
      }

      // Create new anfrage with pending payment
      const { data: newAnfrage, error: insertError } = await supabase
        .from('anfragen')
        .insert({
          objekt_id: objektId,
          mandant_id: mandantId,
          status: 'offen',
          payment_status: 'pending',
        })
        .select('id')
        .single();

      if (insertError || !newAnfrage) {
        throw new Error(insertError?.message || 'Fehler beim Erstellen der Anfrage');
      }

      // Redirect to Stripe Checkout
      toast.info('Weiterleitung zur Zahlung...');
      await redirectToCheckout(newAnfrage.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      toast.error('Fehler bei der Zahlungsabwicklung');
      setLoading(false);
    }
  };

  return (
    <div>
      <Button onClick={handleAnfrage} disabled={loading} variant="secondary">
        {loading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <CreditCard className="w-4 h-4 mr-2" />
        )}
        {loading ? 'Wird vorbereitet...' : 'Auswertung kaufen'}
      </Button>
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  );
}
