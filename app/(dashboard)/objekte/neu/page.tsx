'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { ObjektForm } from '@/components/forms/objekt-form';
import type { ObjektInput } from '@/lib/validators';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NeuObjektPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedMandant = searchParams.get('mandant');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mandanten, setMandanten] = useState<{ id: string; name: string }[]>([]);
  const [selectedMandant, setSelectedMandant] = useState(preselectedMandant || '');
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
    };

    fetchData();
  }, []);

  const handleSubmit = async (data: ObjektInput) => {
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
      const { data: objekt, error } = await supabase
        .from('objekte')
        .insert({ ...data, mandant_id: mandantId })
        .select()
        .single();

      if (error) throw error;

      router.push(`/objekte/${objekt.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/objekte" className="p-2 hover:bg-slate-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Neues Objekt</h1>
          <p className="text-slate-600 mt-1">Erstellen Sie ein neues Immobilienobjekt</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Mandant Selection for Admin */}
      {isAdmin && (
        <Card className="mb-6">
          <Select
            label="Mandant auswählen *"
            value={selectedMandant}
            onChange={(e) => setSelectedMandant(e.target.value)}
            options={mandanten.map((m) => ({ value: m.id, label: m.name }))}
            placeholder="Mandant auswählen..."
          />
        </Card>
      )}

      <Card>
        <ObjektForm
          mandantId={isAdmin ? selectedMandant : (userMandantId || undefined)}
          onSubmit={handleSubmit}
          onCancel={() => router.push('/objekte')}
          isLoading={isLoading}
        />
      </Card>
    </div>
  );
}
