'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { ObjektWizard } from '@/components/forms/objekt-wizard';
import type { ObjektInput, EinheitInput } from '@/lib/validators';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

function NeuObjektContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedMandant = searchParams.get('mandant');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mandanten, setMandanten] = useState<{ id: string; name: string }[]>([]);
  const [selectedMandant, setSelectedMandant] = useState(preselectedMandant || '');
  const [isAdmin, setIsAdmin] = useState(false);
  const [userMandantId, setUserMandantId] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, mandant_id')
        .single();

      const admin = profile?.role === 'admin';
      setIsAdmin(admin);
      setUserMandantId(profile?.mandant_id);

      if (admin) {
        // Fetch all mandanten for admin
        const { data } = await supabase
          .from('mandanten')
          .select('id, name')
          .order('name');
        setMandanten(data || []);
      } else if (profile?.mandant_id) {
        // Use user's mandant_id
        setSelectedMandant(profile.mandant_id);
      }

      setDataLoaded(true);
    };

    fetchData();
  }, []);

  const handleSubmit = async (data: ObjektInput, einheiten: EinheitInput[]) => {
    setIsLoading(true);
    setError(null);

    const mandantId = isAdmin ? selectedMandant : userMandantId;

    if (!mandantId) {
      setError('Bitte wählen Sie einen Mandanten aus');
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      // 1. Create the Objekt
      const { data: objekt, error: objektError } = await supabase
        .from('objekte')
        .insert({ ...data, mandant_id: mandantId })
        .select()
        .single();

      if (objektError) throw objektError;

      // 2. Create the Einheiten with objekt_id
      if (einheiten.length > 0) {
        const einheitenWithObjektId = einheiten.map((e, index) => ({
          ...e,
          objekt_id: objekt.id,
          position: index + 1,
        }));

        const { error: einheitenError } = await supabase
          .from('einheiten')
          .insert(einheitenWithObjektId);

        if (einheitenError) throw einheitenError;
      }

      router.push(`/objekte/${objekt.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setIsLoading(false);
    }
  };

  if (!dataLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#7A9BBD]" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/objekte" className="p-2 hover:bg-[#162636] rounded-lg">
          <ArrowLeft className="w-5 h-5 text-[#7A9BBD]" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#EDF1F5]">Neues Objekt</h1>
          <p className="text-[#6B8AAD] mt-1">Schritt für Schritt zum neuen Objekt</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Mandant Selection for Admin */}
      {isAdmin && !selectedMandant && (
        <Card className="mb-6">
          <Select
            label="Mandant auswählen *"
            value={selectedMandant}
            onChange={(e) => setSelectedMandant(e.target.value)}
            options={mandanten.map((m) => ({ value: m.id, label: m.name }))}
            placeholder="Zuerst Mandant auswählen..."
          />
          <p className="text-sm text-[#7A9BBD] mt-2">
            Wählen Sie den Mandanten, für den dieses Objekt erstellt werden soll.
          </p>
        </Card>
      )}

      {/* Show wizard only when mandant is selected (or not admin) */}
      {(selectedMandant || !isAdmin) && (
        <Card>
          <ObjektWizard
            mandantId={isAdmin ? selectedMandant : (userMandantId || undefined)}
            onSubmit={handleSubmit}
            onCancel={() => router.push('/objekte')}
            isLoading={isLoading}
          />
        </Card>
      )}
    </div>
  );
}

export default function NeuObjektPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#7A9BBD]" />
      </div>
    }>
      <NeuObjektContent />
    </Suspense>
  );
}
