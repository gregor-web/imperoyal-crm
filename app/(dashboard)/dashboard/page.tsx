import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { Plus } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, name')
    .single();

  const isAdmin = profile?.role === 'admin';

  // Fetch initial stats on server for SSR
  const { count: objekteCount } = await supabase
    .from('objekte')
    .select('*', { count: 'exact', head: true });

  const { count: auswertungenCount } = await supabase
    .from('auswertungen')
    .select('*', { count: 'exact', head: true });

  let mandantenCount = 0;
  if (isAdmin) {
    const { count } = await supabase
      .from('mandanten')
      .select('*', { count: 'exact', head: true });
    mandantenCount = count || 0;
  }

  // Calculate total mietpotenzial
  const { data: auswertungen } = await supabase
    .from('auswertungen')
    .select('berechnungen');

  let mietpotenzialTotal = 0;
  if (auswertungen) {
    auswertungen.forEach((a) => {
      const berechnungen = a.berechnungen as { mietanalyse?: { potenzial_jahr?: number } } | null;
      if (berechnungen?.mietanalyse?.potenzial_jahr) {
        mietpotenzialTotal += berechnungen.mietanalyse.potenzial_jahr;
      }
    });
  }

  const initialStats = {
    objekteCount: objekteCount || 0,
    auswertungenCount: auswertungenCount || 0,
    mandantenCount,
    mietpotenzialTotal,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Willkommen{profile?.name ? `, ${profile.name}` : ''}
        </h1>
        <p className="text-slate-600 mt-1">
          {isAdmin
            ? 'Verwalten Sie Mandanten, Objekte und Auswertungen.'
            : 'Verwalten Sie Ihre Objekte und Auswertungen.'}
        </p>
      </div>

      {/* Stats Cards with Realtime Updates */}
      <DashboardStats isAdmin={isAdmin} initialStats={initialStats} />

      {/* Quick Actions */}
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Schnellaktionen
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/objekte/neu"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Neues Objekt anlegen
          </Link>
          {isAdmin && (
            <Link
              href="/mandanten/neu"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Neuen Mandanten anlegen
            </Link>
          )}
          <Link
            href="/ankaufsprofile/neu"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Ankaufsprofil erstellen
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  );
}

async function RecentActivity() {
  const supabase = await createClient();

  // Fetch recent auswertungen
  const { data: recentAuswertungen } = await supabase
    .from('auswertungen')
    .select(`
      id,
      created_at,
      empfehlung,
      objekte (strasse, plz, ort)
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  if (!recentAuswertungen || recentAuswertungen.length === 0) {
    return null;
  }

  return (
    <div className="glass-card rounded-xl p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">
        Letzte Auswertungen
      </h2>
      <div className="space-y-3">
        {recentAuswertungen.map((a) => {
          const objekt = a.objekte as unknown as { strasse: string; plz: string; ort: string } | null;
          return (
            <Link
              key={a.id}
              href={`/auswertungen/${a.id}`}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div>
                <p className="font-medium text-slate-800">
                  {objekt?.strasse || 'Unbekannt'}
                </p>
                <p className="text-sm text-slate-500">
                  {objekt?.plz} {objekt?.ort}
                </p>
              </div>
              <div className="text-right">
                {a.empfehlung && (
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                    a.empfehlung === 'HALTEN' ? 'bg-green-100 text-green-700' :
                    a.empfehlung === 'OPTIMIEREN' ? 'bg-blue-100 text-blue-700' :
                    a.empfehlung === 'RESTRUKTURIEREN' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {a.empfehlung}
                  </span>
                )}
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(a.created_at).toLocaleDateString('de-DE')}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
