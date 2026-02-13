import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { ArrowLeft, Edit, Target, MapPin, TrendingUp, Building2 } from 'lucide-react';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AnkaufsprofilDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch ankaufsprofil with mandant
  const { data: profil, error } = await supabase
    .from('ankaufsprofile')
    .select(`
      *,
      mandanten (name)
    `)
    .eq('id', id)
    .single();

  if (error || !profil) {
    notFound();
  }

  const mandant = profil.mandanten as { name: string } | null;
  const assetklassen = profil.assetklassen as string[] | null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/ankaufsprofile" className="p-2 hover:bg-slate-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">{profil.name}</h1>
            <p className="text-sm sm:text-base text-slate-600">{mandant?.name || 'Unbekannter Mandant'}</p>
          </div>
        </div>
        <Link href={`/ankaufsprofile/${id}/edit`} className="self-start sm:self-auto ml-11 sm:ml-0">
          <Button variant="secondary">
            <Edit className="w-4 h-4 mr-2" />
            Bearbeiten
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Volumen */}
        <Card title="Investitionsvolumen">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Zielvolumen</p>
              <p className="text-xl font-bold text-slate-800">
                {formatCurrency(profil.min_volumen)} - {formatCurrency(profil.max_volumen)}
              </p>
            </div>
          </div>
        </Card>

        {/* Rendite */}
        <Card title="Mindestrendite">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Erwartete Rendite</p>
              <p className="text-xl font-bold text-slate-800">
                {profil.rendite_min ? `${profil.rendite_min}%` : 'Keine Angabe'}
              </p>
            </div>
          </div>
        </Card>

        {/* Assetklassen */}
        <Card title="Assetklassen">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex flex-wrap gap-2">
              {assetklassen && assetklassen.length > 0 ? (
                assetklassen.map((klasse) => (
                  <Badge key={klasse} variant="info">
                    {klasse}
                  </Badge>
                ))
              ) : (
                <span className="text-slate-500">Keine Assetklassen definiert</span>
              )}
            </div>
          </div>
        </Card>

        {/* Regionen */}
        <Card title="Zielregionen">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-slate-700">
                {profil.regionen || 'Keine Regionen definiert'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Sonstiges */}
      {profil.sonstiges && (
        <Card title="Sonstige Anforderungen">
          <p className="text-slate-700 whitespace-pre-wrap">{profil.sonstiges}</p>
        </Card>
      )}

      {/* Metadaten */}
      <div className="text-sm text-slate-500">
        Erstellt am {formatDate(profil.created_at)}
        {profil.updated_at && profil.updated_at !== profil.created_at && (
          <span> | Zuletzt bearbeitet am {formatDate(profil.updated_at)}</span>
        )}
      </div>
    </div>
  );
}
