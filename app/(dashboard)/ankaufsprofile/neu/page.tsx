'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

export default function NeuesAnkaufsprofilPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mandanten, setMandanten] = useState<Mandant[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userMandantId, setUserMandantId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, mandant_id')
        .single();

      if (profile) {
        setIsAdmin(profile.role === 'admin');
        setUserMandantId(profile.mandant_id);

        // If admin, fetch all mandanten
        if (profile.role === 'admin') {
          const { data: mandantenData } = await supabase
            .from('mandanten')
            .select('id, name')
            .order('name');
          setMandanten(mandantenData || []);
        }
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (data: AnkaufsprofilInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Determine mandant_id
      const mandant_id = isAdmin ? data.mandant_id : userMandantId;

      if (!mandant_id) {
        throw new Error('Mandant ID fehlt');
      }

      const { error } = await supabase.from('ankaufsprofile').insert({
        mandant_id,
        name: data.name,
        min_volumen: data.min_volumen,
        max_volumen: data.max_volumen,
        assetklassen: data.assetklassen,
        regionen: data.regionen,
        rendite_min: data.rendite_min,
        sonstiges: data.sonstiges,
      });

      if (error) throw error;

      router.push('/ankaufsprofile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/ankaufsprofile" className="p-2 hover:bg-slate-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Neues Ankaufsprofil</h1>
          <p className="text-slate-600 mt-1">Erstellen Sie ein neues Ankaufsprofil</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <Card>
        <AnkaufsprofilForm
          onSubmit={handleSubmit}
          onCancel={() => router.push('/ankaufsprofile')}
          isLoading={isLoading}
          mandanten={isAdmin ? mandanten : undefined}
          showMandantSelect={isAdmin}
        />
      </Card>
    </div>
  );
}
