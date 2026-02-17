'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { MandantForm } from '@/components/forms/mandant-form';
import type { MandantInput } from '@/lib/validators';
import { generatePassword } from '@/lib/supabase/admin';

export default function NeuMandantPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);

  const handleSubmit = async (data: MandantInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/mandanten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Fehler beim Erstellen');
      }

      if (result.password) {
        setCreatedPassword(result.password);
      } else {
        router.push('/mandanten');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setIsLoading(false);
    }
  };

  if (createdPassword) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card title="Mandant erstellt" className="text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-[#34C759]/12 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-[#34C759]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-[#EDF1F5]">Mandant erfolgreich erstellt!</h2>
            <p className="text-[#6B8AAD]">
              Das temporäre Passwort für den Mandanten lautet:
            </p>
            <div className="bg-[#162636] rounded-lg p-4 font-mono text-lg">
              {createdPassword}
            </div>
            <p className="text-sm text-[#FF9500]">
              Bitte notieren Sie dieses Passwort und teilen Sie es dem Mandanten mit.
              Es wird nicht erneut angezeigt.
            </p>
            <button
              onClick={() => router.push('/mandanten')}
              className="mt-4 px-6 py-2 bg-[#5B7A9D] text-white rounded-[10px] hover:bg-[#6B8AAD]"
            >
              Zur Mandantenliste
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-[#EDF1F5]">Neuer Mandant</h1>
        <p className="text-[#6B8AAD] mt-1">Erstellen Sie einen neuen Mandanten</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <Card>
        <MandantForm
          onSubmit={handleSubmit}
          onCancel={() => router.push('/mandanten')}
          isLoading={isLoading}
        />
      </Card>
    </div>
  );
}
