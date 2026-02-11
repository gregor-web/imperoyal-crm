import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/lib/formatters';
import { Eye, FileBarChart, Clock, CheckCircle, Send, Plus } from 'lucide-react';

const STATUS_CONFIG = {
  offen: {
    label: 'Eingereicht',
    variant: 'warning' as const,
    icon: Clock,
    description: 'Ihre Anfrage wurde eingereicht.',
  },
  in_bearbeitung: {
    label: 'Abgeschlossen',
    variant: 'success' as const,
    icon: CheckCircle,
    description: 'Die Auswertung ist fertig.',
  },
  fertig: {
    label: 'Abgeschlossen',
    variant: 'success' as const,
    icon: CheckCircle,
    description: 'Die Auswertung ist fertig.',
  },
  versendet: {
    label: 'Zugestellt',
    variant: 'default' as const,
    icon: Send,
    description: 'Per E-Mail zugesendet.',
  },
};

export default async function MeineAnfragenPage() {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, mandant_id')
    .eq('id', user.id)
    .single();

  // Redirect admins to the admin anfragen page
  if (profile?.role === 'admin') {
    redirect('/anfragen');
  }

  // Fetch anfragen for this mandant with objekt data
  const { data: anfragen, error } = await supabase
    .from('anfragen')
    .select(`
      *,
      objekte (id, strasse, plz, ort, kaufpreis, gebaeudetyp)
    `)
    .eq('mandant_id', profile?.mandant_id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching anfragen:', error);
  }

  // Fetch auswertungen for this mandant to link them
  const { data: auswertungen } = await supabase
    .from('auswertungen')
    .select('id, objekt_id, created_at')
    .eq('mandant_id', profile?.mandant_id);

  // Create a map of objekt_id -> latest auswertung
  const auswertungMap = new Map<string, string>();
  auswertungen?.forEach((a) => {
    if (a.objekt_id) {
      auswertungMap.set(a.objekt_id, a.id);
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Meine Anfragen</h1>
          <p className="text-slate-600 mt-1">
            Übersicht Ihrer Auswertungsanfragen
          </p>
        </div>
        <Link href="/objekte">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Neue Anfrage
          </Button>
        </Link>
      </div>

      {/* Status Legend */}
      <Card>
        <div className="flex flex-wrap gap-4">
          {Object.entries(STATUS_CONFIG).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <div key={key} className="flex items-center gap-2 text-sm">
                <Badge variant={config.variant} className="gap-1">
                  <Icon className="w-3 h-3" />
                  {config.label}
                </Badge>
                <span className="text-slate-500 hidden sm:inline">- {config.description}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Anfragen Liste */}
      {anfragen && anfragen.length > 0 ? (
        <div className="space-y-4">
          {anfragen.map((anfrage) => {
            const objekt = anfrage.objekte as {
              id: string;
              strasse: string;
              plz: string;
              ort: string;
              kaufpreis: number;
              gebaeudetyp: string;
            } | null;

            const status = anfrage.status as keyof typeof STATUS_CONFIG;
            const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.offen;
            const StatusIcon = statusConfig.icon;
            const auswertungId = objekt?.id ? auswertungMap.get(objekt.id) : null;

            return (
              <Card key={anfrage.id} className="hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Objekt Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                        <FileBarChart className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">{objekt?.strasse}</h3>
                        <p className="text-sm text-slate-500">
                          {objekt?.plz} {objekt?.ort} • {objekt?.gebaeudetyp}
                        </p>
                        <p className="text-sm text-slate-500">
                          Kaufpreis: {formatCurrency(objekt?.kaufpreis)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Badge variant={statusConfig.variant} className="gap-1 mb-1">
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </Badge>
                      <p className="text-xs text-slate-500">
                        Angefragt am {formatDate(anfrage.created_at)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link href={`/objekte/${objekt?.id}`}>
                        <Button variant="secondary" size="sm" title="Objekt ansehen">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      {(status === 'fertig' || status === 'versendet') && auswertungId && (
                        <Link href={`/auswertungen/${auswertungId}`}>
                          <Button size="sm" title="Auswertung ansehen">
                            <FileBarChart className="w-4 h-4" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <FileBarChart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-800 mb-2">Keine Anfragen vorhanden</h3>
            <p className="text-slate-500 mb-6">
              Sie haben noch keine Auswertung angefragt. Gehen Sie zu einem Ihrer Objekte und fordern Sie eine Analyse an.
            </p>
            <Link href="/objekte">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Zu meinen Objekten
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
