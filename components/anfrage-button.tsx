'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { Send, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AnfrageButtonProps {
  objektId: string;
  mandantId: string;
}

export function AnfrageButton({ objektId, mandantId }: AnfrageButtonProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnfrage = async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Check if anfrage already exists
      const { data: existing } = await supabase
        .from('anfragen')
        .select('id')
        .eq('objekt_id', objektId)
        .eq('status', 'offen')
        .single();

      if (existing) {
        toast.warning('Es existiert bereits eine offene Anfrage für dieses Objekt');
        setError('Es existiert bereits eine offene Anfrage für dieses Objekt');
        setLoading(false);
        return;
      }

      // Create new anfrage
      const { error: insertError } = await supabase
        .from('anfragen')
        .insert({
          objekt_id: objektId,
          mandant_id: mandantId,
          status: 'offen',
        });

      if (insertError) {
        throw new Error(insertError.message);
      }

      setSuccess(true);
      toast.success('Auswertungsanfrage erfolgreich gesendet!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      toast.error('Fehler beim Senden der Anfrage');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle className="w-5 h-5" />
        <span className="text-sm font-medium">Anfrage gesendet!</span>
      </div>
    );
  }

  return (
    <div>
      <Button onClick={handleAnfrage} disabled={loading} variant="secondary">
        {loading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Send className="w-4 h-4 mr-2" />
        )}
        {loading ? 'Wird gesendet...' : 'Auswertung anfragen'}
      </Button>
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  );
}
