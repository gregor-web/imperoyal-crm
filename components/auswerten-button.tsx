'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FileBarChart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AuswertenButtonProps {
  objektId: string;
}

export function AuswertenButton({ objektId }: AuswertenButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuswerten = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auswertung', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ objekt_id: objektId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fehler bei der Auswertung');
      }

      // Redirect to auswertung detail page
      toast.success('Auswertung erfolgreich erstellt!');
      router.push(`/auswertungen/${data.auswertung_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      toast.error('Fehler bei der Auswertung');
      setLoading(false);
    }
  };

  return (
    <div>
      <Button onClick={handleAuswerten} disabled={loading}>
        {loading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <FileBarChart className="w-4 h-4 mr-2" />
        )}
        {loading ? 'Auswertung läuft...' : 'Auswerten'}
      </Button>
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  );
}
