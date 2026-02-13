'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Send, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SendEmailButtonProps {
  auswertungId: string;
  status: string;
}

export function SendEmailButton({ auswertungId, status }: SendEmailButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  // Already completed
  if (status === 'abgeschlossen') {
    return (
      <Button variant="secondary" disabled className="gap-2">
        <CheckCircle className="w-4 h-4" />
        Abgeschlossen
      </Button>
    );
  }

  const handleSend = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/email/auswertung', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ auswertung_id: auswertungId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Versenden');
      }

      setSuccess(true);
      toast.success('Auswertung erfolgreich per E-Mail versendet!');
      // Refresh the page to update status
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      toast.error('Fehler beim Versenden der E-Mail');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Button variant="secondary" disabled className="gap-2 bg-green-100 text-green-700">
        <CheckCircle className="w-4 h-4" />
        Versendet!
      </Button>
    );
  }

  return (
    <div>
      <Button onClick={handleSend} disabled={loading} className="gap-2">
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        {loading ? 'Wird versendet...' : 'Per E-Mail senden'}
      </Button>
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  );
}
