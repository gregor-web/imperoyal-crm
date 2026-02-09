'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { MandantForm } from '@/components/forms/mandant-form';
import type { MandantInput } from '@/lib/validators';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditMandantPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [mandant, setMandant] = useState<MandantInput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMandant = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('mandanten')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        setError('Mandant nicht gefunden');
      } else {
        setMandant(data);
      }
      setIsFetching(false);
    };

    fetchMandant();
  }, [id]);

  const handleSubmit = async (data: MandantInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('mandanten')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      router.push(`/mandanten/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!mandant) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error || 'Mandant nicht gefunden'}</p>
        <Link href="/mandanten" className="text-blue-600 hover:underline mt-4 inline-block">
          Zurück zur Liste
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/mandanten/${id}`} className="p-2 hover:bg-slate-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mandant bearbeiten</h1>
          <p className="text-slate-600 mt-1">{mandant.name}</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <Card>
        <MandantForm
          defaultValues={mandant}
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/mandanten/${id}`)}
          isLoading={isLoading}
        />
      </Card>
    </div>
  );
}
