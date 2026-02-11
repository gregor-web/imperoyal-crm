'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Play, Loader2 } from 'lucide-react';

interface StartAnalyseButtonProps {
  objektId: string;
  anfrageId: string;
}

export function StartAnalyseButton({ objektId, anfrageId }: StartAnalyseButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartAnalyse = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Start the analysis
      const response = await fetch('/api/auswertung', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objekt_id: objektId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Analyse konnte nicht gestartet werden');
      }

      const { auswertung_id } = await response.json();

      // Set status to "fertig"
      await fetch('/api/anfragen/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anfrage_id: anfrageId, status: 'fertig' }),
      });

      // Navigate to the new Auswertung
      router.push(`/auswertungen/${auswertung_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleStartAnalyse}
        disabled={isLoading}
        className="gap-2"
        title="Analyse starten"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Play className="w-4 h-4" />
        )}
        {isLoading ? 'Analysiere...' : 'Analyse starten'}
      </Button>
      {error && (
        <span className="text-xs text-red-600">{error}</span>
      )}
    </div>
  );
}
