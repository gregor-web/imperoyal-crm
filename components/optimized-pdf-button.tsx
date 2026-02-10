'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';

interface OptimizedPdfButtonProps {
  auswertungId: string;
}

export function OptimizedPdfButton({ auswertungId }: OptimizedPdfButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');

  const handleExport = async () => {
    setLoading(true);
    setError(null);
    setStatus('Generiere PDF...');

    try {
      const response = await fetch('/api/pdf/optimized', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ auswertung_id: auswertungId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Fehler beim PDF-Export');
      }

      // Get optimization info from headers
      const attempts = response.headers.get('X-Optimization-Attempts');
      const success = response.headers.get('X-Optimization-Success');

      if (attempts) {
        setStatus(`Optimiert in ${attempts} Versuchen`);
      }

      // Get the PDF blob
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `auswertung-${auswertungId}-optimized.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setTimeout(() => setStatus(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button
        variant="primary"
        onClick={handleExport}
        disabled={loading}
        className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4 mr-2" />
        )}
        {loading ? 'KI optimiert...' : 'KI-Optimiertes PDF'}
      </Button>
      {status && (
        <p className="text-green-600 text-sm mt-2">{status}</p>
      )}
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  );
}
