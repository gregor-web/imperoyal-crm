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
      setStatus('Generiere optimiertes PDF...');
      console.log('[OptimizedPDF] Sending request...');

      // Use AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 min timeout

      const response = await fetch('/api/pdf/optimized', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ auswertung_id: auswertungId }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

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

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `auswertung-${auswertungId}-optimized.pdf`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) {
          filename = match[1];
        }
      }
      console.log('[OptimizedPDF] Filename:', filename);

      setStatus('Lade PDF herunter...');

      // Get the PDF blob
      const blob = await response.blob();
      console.log('[OptimizedPDF] Blob size:', blob.size, 'bytes');

      if (blob.size === 0) {
        throw new Error('PDF ist leer');
      }

      // Create download link - use different approach for better browser compatibility
      const url = window.URL.createObjectURL(blob);
      console.log('[OptimizedPDF] Created blob URL:', url);

      // Try using link click first
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = url;
      link.download = filename;
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);

      console.log('[OptimizedPDF] Triggering download...');
      link.click();

      // Cleanup after a delay
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        console.log('[OptimizedPDF] Cleanup done');
      }, 1000);

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
        {loading ? 'Optimiere...' : 'Optimiertes PDF'}
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
