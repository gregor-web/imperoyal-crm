'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/formatters';
import { Building2, FileBarChart, TrendingUp, Users } from 'lucide-react';

interface DashboardStats {
  objekteCount: number;
  auswertungenCount: number;
  mandantenCount: number;
  mietpotenzialTotal: number;
}

interface DashboardStatsProps {
  isAdmin: boolean;
  initialStats: DashboardStats;
}

export function DashboardStats({ isAdmin, initialStats }: DashboardStatsProps) {
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const supabase = createClient();

  const fetchStats = async () => {
    // Fetch objekte count
    const { count: objekteCount } = await supabase
      .from('objekte')
      .select('*', { count: 'exact', head: true });

    // Fetch auswertungen count
    const { count: auswertungenCount } = await supabase
      .from('auswertungen')
      .select('*', { count: 'exact', head: true });

    // Fetch mandanten count (admin only)
    let mandantenCount = 0;
    if (isAdmin) {
      const { count } = await supabase
        .from('mandanten')
        .select('*', { count: 'exact', head: true });
      mandantenCount = count || 0;
    }

    // Calculate total mietpotenzial from auswertungen
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

    setStats({
      objekteCount: objekteCount || 0,
      auswertungenCount: auswertungenCount || 0,
      mandantenCount,
      mietpotenzialTotal,
    });
  };

  useEffect(() => {
    // Set up realtime subscriptions
    const objekteChannel = supabase
      .channel('objekte-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'objekte' },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    const auswertungenChannel = supabase
      .channel('auswertungen-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'auswertungen' },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    const mandantenChannel = isAdmin
      ? supabase
          .channel('mandanten-changes')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'mandanten' },
            () => {
              fetchStats();
            }
          )
          .subscribe()
      : null;

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(objekteChannel);
      supabase.removeChannel(auswertungenChannel);
      if (mandantenChannel) {
        supabase.removeChannel(mandantenChannel);
      }
    };
  }, [isAdmin]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <StatCard
        title="Objekte"
        value={stats.objekteCount.toString()}
        subtitle="Immobilien im Portfolio"
        color="blue"
        icon={<Building2 className="w-6 h-6 text-white" />}
      />
      <StatCard
        title="Auswertungen"
        value={stats.auswertungenCount.toString()}
        subtitle="Analysen erstellt"
        color="green"
        icon={<FileBarChart className="w-6 h-6 text-white" />}
      />
      <StatCard
        title="Mietpotenzial"
        value={formatCurrency(stats.mietpotenzialTotal)}
        subtitle="Gesamt pro Jahr"
        color="amber"
        icon={<TrendingUp className="w-6 h-6 text-white" />}
      />
      {isAdmin && (
        <StatCard
          title="Mandanten"
          value={stats.mandantenCount.toString()}
          subtitle="Aktive Kunden"
          color="purple"
          icon={<Users className="w-6 h-6 text-white" />}
        />
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  color,
  icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  color: 'blue' | 'green' | 'amber' | 'purple';
  icon: React.ReactNode;
}) {
  const colorClasses = {
    blue: 'from-[#4A6A8D] to-[#5B7A9D]',
    green: 'from-green-500 to-green-600',
    amber: 'from-amber-500 to-amber-600',
    purple: 'from-[#1E2A3A] to-[#2A3F54]',
  };

  return (
    <div className="glass-card rounded-xl p-4 sm:p-6">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-[#4A6A8D]">{title}</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1E2A3A] mt-1 truncate">{value}</p>
          <p className="text-xs sm:text-sm text-[#5B7A9D] mt-1">{subtitle}</p>
        </div>
        <div
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center flex-shrink-0 ml-3`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
