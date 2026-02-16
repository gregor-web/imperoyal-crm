'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentRetryButtonProps {
  anfrageId: string;
}

export function PaymentRetryButton({ anfrageId }: PaymentRetryButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anfrage_id: anfrageId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fehler bei der Zahlungsabwicklung');
      }

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Zahlungsfehler');
      setLoading(false);
    }
  };

  return (
    <Button onClick={handlePayment} disabled={loading} className="w-full sm:w-auto gap-2">
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <CreditCard className="w-4 h-4" />
      )}
      {loading ? 'Wird vorbereitet...' : 'Jetzt bezahlen'}
    </Button>
  );
}
