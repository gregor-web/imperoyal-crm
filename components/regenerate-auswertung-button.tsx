'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface RegenerateAuswertungButtonProps {
  objektId: string;
}

export function RegenerateAuswertungButton({ objektId }: RegenerateAuswertungButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRegenerate = async () => {
    if (!confirm('Auswertung neu generieren? Die bestehende Auswertung wird dabei ersetzt.')) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auswertung', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objekt_id: objektId, force: true }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fehler bei der Auswertung');
      }

      toast.success('Auswertung erfolgreich neu generiert!');
      router.push(`/auswertungen/${data.auswertung_id}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Fehler bei der Regenerierung');
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleRegenerate}
      disabled={loading}
      variant="secondary"
      className="gap-2"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <RefreshCw className="w-4 h-4" />
      )}
      {loading ? 'Generiere neu...' : 'Neu generieren'}
    </Button>
  );
}
