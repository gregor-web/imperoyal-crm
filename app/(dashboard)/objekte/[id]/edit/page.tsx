'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { ObjektForm } from '@/components/forms/objekt-form';
import { EinheitenForm } from '@/components/forms/einheiten-form';
import type { ObjektInput } from '@/lib/validators';
import type { Einheit } from '@/lib/types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditObjektPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [objekt, setObjekt] = useState<ObjektInput | null>(null);
  const [einheiten, setEinheiten] = useState<Einheit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'objekt' | 'einheiten'>('objekt');

  useEffect(() => {
    const fetchObjekt = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('objekte')
        .select('*, einheiten(*)')
        .eq('id', id)
        .single();

      if (error || !data) {
        setError('Objekt nicht gefunden');
      } else {
        setObjekt(data);
        setEinheiten(data.einheiten || []);
      }
      setIsFetching(false);
    };

    fetchObjekt();
  }, [id]);

  const handleObjektSubmit = async (data: ObjektInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('objekte')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      router.push(`/objekte/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEinheitenSubmit = async (data: Einheit[]) => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Delete existing einheiten
      await supabase.from('einheiten').delete().eq('objekt_id', id);

      // Insert new einheiten
      if (data.length > 0) {
        const einheitenData = data.map((e, index) => ({
          objekt_id: id,
          position: index + 1,
          nutzung: e.nutzung,
          flaeche: e.flaeche,
          kaltmiete: e.kaltmiete,
          vergleichsmiete: e.vergleichsmiete,
          mietvertragsart: e.mietvertragsart,
          letzte_mieterhoehung: e.letzte_mieterhoehung,
        }));

        const { error } = await supabase.from('einheiten').insert(einheitenData);
        if (error) throw error;
      }

      router.push(`/objekte/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5B7A9D]"></div>
      </div>
    );
  }

  if (!objekt) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error || 'Objekt nicht gefunden'}</p>
        <Link href="/objekte" className="text-[#5B7A9D] hover:underline mt-4 inline-block">
          Zurück zur Liste
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 sm:gap-4 mb-6">
        <Link href={`/objekte/${id}`} className="p-2 hover:bg-[#EDF1F5] rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-[#4A6A8D]" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1E2A3A]">Objekt bearbeiten</h1>
          <p className="text-[#4A6A8D] mt-1">{objekt.strasse}</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('objekt')}
          className={`px-4 py-2 min-h-[44px] rounded-[10px] font-medium transition-colors ${
            activeTab === 'objekt'
              ? 'bg-[#5B7A9D] text-white'
              : 'bg-[#EDF1F5] text-[#1E2A3A] hover:bg-[#D5DEE6]'
          }`}
        >
          Objektdaten
        </button>
        <button
          onClick={() => setActiveTab('einheiten')}
          className={`px-4 py-2 min-h-[44px] rounded-[10px] font-medium transition-colors ${
            activeTab === 'einheiten'
              ? 'bg-[#5B7A9D] text-white'
              : 'bg-[#EDF1F5] text-[#1E2A3A] hover:bg-[#D5DEE6]'
          }`}
        >
          Einheiten ({einheiten.length})
        </button>
      </div>

      <Card>
        {activeTab === 'objekt' ? (
          <ObjektForm
            defaultValues={objekt}
            onSubmit={handleObjektSubmit}
            onCancel={() => router.push(`/objekte/${id}`)}
            isLoading={isLoading}
          />
        ) : (
          <EinheitenForm
            objektId={id}
            defaultValues={einheiten}
            onSubmit={handleEinheitenSubmit}
            isLoading={isLoading}
          />
        )}
      </Card>
    </div>
  );
}
