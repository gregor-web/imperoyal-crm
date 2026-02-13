'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { AnkaufsprofilForm } from '@/components/forms/ankaufsprofil-form';
import type { AnkaufsprofilInput } from '@/lib/validators';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Mandant {
  id: string;
  name: string;
}

export default function EditAnkaufsprofilPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [profil, setProfil] = useState<AnkaufsprofilInput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mandanten, setMandanten] = useState<Mandant[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .single();

      if (profile) {
        setIsAdmin(profile.role === 'admin');

        // If admin, fetch all mandanten
        if (profile.role === 'admin') {
          const { data: mandantenData } = await supabase
            .from('mandanten')
            .select('id, name')
            .order('name');
          setMandanten(mandantenData || []);
        }
      }

      // Fetch the ankaufsprofil
      const { data, error } = await supabase
        .from('ankaufsprofile')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        setError('Ankaufsprofil nicht gefunden');
      } else {
        setProfil(data);
      }

      setIsFetching(false);
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (data: AnkaufsprofilInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('ankaufsprofile')
        .update({
          name: data.name,
          min_volumen: data.min_volumen,
          max_volumen: data.max_volumen,
          assetklassen: data.assetklassen,
          regionen: data.regionen,
          rendite_min: data.rendite_min,
          sonstiges: data.sonstiges,
          ...(isAdmin && data.mandant_id ? { mandant_id: data.mandant_id } : {}),
        })
        .eq('id', id);

      if (error) throw error;

      router.push(`/ankaufsprofile/${id}`);
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

  if (!profil) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error || 'Ankaufsprofil nicht gefunden'}</p>
        <Link href="/ankaufsprofile" className="text-blue-600 hover:underline mt-4 inline-block">
          Zurück zur Liste
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/ankaufsprofile/${id}`} className="p-2 hover:bg-slate-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Ankaufsprofil bearbeiten</h1>
          <p className="text-slate-600 mt-1">{profil.name}</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <Card>
        <AnkaufsprofilForm
          defaultValues={profil}
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/ankaufsprofile/${id}`)}
          isLoading={isLoading}
          mandanten={isAdmin ? mandanten : undefined}
          showMandantSelect={isAdmin}
        />
      </Card>
    </div>
  );
}
