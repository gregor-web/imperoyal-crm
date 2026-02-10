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
    setStatus('Starte Optimierung...');
    console.log('[OptimizedPDF] Starting export for:', auswertungId);

    try {
      setStatus('Generiere PDF & analysiere mit KI...');
      console.log('[OptimizedPDF] Sending request...');

      const response = await fetch('/api/pdf/optimized', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ auswertung_id: auswertungId }),
      });

      console.log('[OptimizedPDF] Response status:', response.status);
      console.log('[OptimizedPDF] Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        let errorMessage = 'Fehler beim PDF-Export';
        try {
          const data = await response.json();
          errorMessage = data.error || errorMessage;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // Get optimization info from headers
      const attempts = response.headers.get('X-Optimization-Attempts');
      console.log('[OptimizedPDF] Optimization attempts:', attempts);

      setStatus('Lade PDF herunter...');

      // Get the PDF blob
      const blob = await response.blob();
      console.log('[OptimizedPDF] Blob size:', blob.size, 'bytes');

      if (blob.size === 0) {
        throw new Error('PDF ist leer');
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `auswertung-${auswertungId}-optimized.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setStatus(attempts ? `Fertig! Optimiert in ${attempts} Versuchen` : 'Fertig!');
      console.log('[OptimizedPDF] Download triggered successfully');

      setTimeout(() => setStatus(''), 5000);
    } catch (err) {
      console.error('[OptimizedPDF] Error:', err);
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
