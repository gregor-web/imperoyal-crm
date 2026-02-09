import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, name')
    .single();

  const isAdmin = profile?.role === 'admin';

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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Objekte"
          value="-"
          subtitle="Immobilien im Portfolio"
          color="blue"
        />
        <DashboardCard
          title="Auswertungen"
          value="-"
          subtitle="Analysen erstellt"
          color="green"
        />
        <DashboardCard
          title="Mietpotenzial"
          value="-"
          subtitle="Durchschnittlich"
          color="amber"
        />
        {isAdmin && (
          <DashboardCard
            title="Mandanten"
            value="-"
            subtitle="Aktive Kunden"
            color="purple"
          />
        )}
      </div>

      {/* Quick Actions */}
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Schnellaktionen
        </h2>
        <div className="flex flex-wrap gap-3">
          <QuickActionButton href="/objekte/neu" label="Neues Objekt anlegen" />
          {isAdmin && (
            <QuickActionButton href="/mandanten/neu" label="Neuen Mandanten anlegen" />
          )}
          <QuickActionButton href="/ankaufsprofile/neu" label="Ankaufsprofil erstellen" />
        </div>
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  value,
  subtitle,
  color,
}: {
  title: string;
  value: string;
  subtitle: string;
  color: 'blue' | 'green' | 'amber' | 'purple';
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    amber: 'from-amber-500 to-amber-600',
    purple: 'from-purple-500 to-purple-600',
  };

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
          <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
        </div>
        <div
          className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center`}
        >
          <div className="w-6 h-6 bg-white/30 rounded" />
        </div>
      </div>
    </div>
  );
}

function QuickActionButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
    >
      <span>+</span>
      {label}
    </a>
  );
}
