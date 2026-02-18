import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/formatters';
import { EmpfehlungBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Plus,
  Clock,
  CheckCircle,
  Send,
  FileBarChart,
  Building2,
  ArrowRight,
  Heart,
  Download,
  Eye,
  CreditCard,
} from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, name, mandant_id')
    .eq('id', user!.id)
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
  let anfragenOffenCount = 0;
  if (isAdmin) {
    const { count } = await supabase
      .from('mandanten')
      .select('*', { count: 'exact', head: true });
    mandantenCount = count || 0;

    const { count: offenCount } = await supabase
      .from('anfragen')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'offen');
    anfragenOffenCount = offenCount || 0;
  }

  // Calculate total mietpotenzial (for mandant view)
  let mietpotenzialTotal = 0;
  if (!isAdmin) {
    const { data: auswertungen } = await supabase
      .from('auswertungen')
      .select('berechnungen');

    if (auswertungen) {
      auswertungen.forEach((a) => {
        const berechnungen = a.berechnungen as { mietanalyse?: { potenzial_jahr?: number } } | null;
        if (berechnungen?.mietanalyse?.potenzial_jahr) {
          mietpotenzialTotal += berechnungen.mietanalyse.potenzial_jahr;
        }
      });
    }
  }

  const initialStats = {
    objekteCount: objekteCount || 0,
    auswertungenCount: auswertungenCount || 0,
    mandantenCount,
    anfragenOffenCount,
    mietpotenzialTotal,
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#EDF1F5] tracking-[-0.02em]">
          Willkommen{profile?.name ? `, ${profile.name}` : ''}
        </h1>
        <p className="text-[#6B8AAD] mt-1">
          {isAdmin
            ? 'Übersicht über Mandanten, Anfragen und Auswertungen.'
            : 'Ihr persönliches Immobilien-Dashboard.'}
        </p>
      </div>

      {/* Stats Cards with Realtime Updates */}
      <DashboardStats isAdmin={isAdmin} initialStats={initialStats} />

      {/* Role-specific content */}
      {isAdmin ? (
        <AdminDashboardContent />
      ) : (
        <MandantDashboardContent mandantId={profile?.mandant_id} />
      )}
    </div>
  );
}

// ============================================================
// ADMIN DASHBOARD
// ============================================================
async function AdminDashboardContent() {
  const supabase = await createClient();

  // Offene Anfragen
  const { data: offeneAnfragen } = await supabase
    .from('anfragen')
    .select('*, objekte(strasse, plz, ort, kaufpreis), mandanten(name)')
    .eq('status', 'offen')
    .order('created_at', { ascending: true })
    .limit(5);

  // Neue Kaufinteressen
  const { data: neueInteressen, count: interessenCount } = await supabase
    .from('interessen')
    .select('*, objekt:objekte(strasse, plz, ort), kaeufer:mandanten!kaeufer_mandant_id(name)', { count: 'exact' })
    .eq('status', 'neu')
    .order('created_at', { ascending: false })
    .limit(3);

  // Letzte Auswertungen
  const { data: recentAuswertungen } = await supabase
    .from('auswertungen')
    .select('id, created_at, empfehlung, objekte(strasse, plz, ort), mandanten(name)')
    .order('created_at', { ascending: false })
    .limit(5);

  const offeneCount = offeneAnfragen?.length || 0;

  return (
    <>
      {/* Quick Actions */}
      <div className="glass-card rounded-2xl p-4 sm:p-5">
        <h2 className="text-[13px] font-semibold text-[#6B8AAD] uppercase tracking-[0.05em] mb-3">Schnellaktionen</h2>
        <div className="flex flex-col sm:flex-row flex-wrap gap-2">
          <Link
            href="/mandanten/neu"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#5B7A9D] text-white rounded-[10px] hover:bg-[#7A9BBD] transition-colors text-[13px] font-medium min-h-[44px] shadow-[0_1px_2px_rgba(0,0,0,0.30)]"
          >
            <Plus className="w-4 h-4" />
            Mandanten anlegen
          </Link>
          <Link
            href="/objekte/neu"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#5B7A9D] text-white rounded-[10px] hover:bg-[#7A9BBD] transition-colors text-[13px] font-medium min-h-[44px] shadow-[0_1px_2px_rgba(0,0,0,0.30)]"
          >
            <Plus className="w-4 h-4" />
            Objekt anlegen
          </Link>
          <Link
            href="/anfragen"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#253546] border border-white/[0.12] text-[#EDF1F5] rounded-[10px] hover:bg-[#2A3F54] hover:border-[#5B7A9D] transition-colors text-[13px] font-medium min-h-[44px]"
          >
            <FileBarChart className="w-4 h-4" />
            Anfragen bearbeiten
          </Link>
        </div>
      </div>

      {/* Two-column layout: Offene Anfragen + Kaufinteressen */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Offene Anfragen */}
        <Card
          title="Offene Anfragen"
          subtitle={offeneCount > 0 ? `${offeneCount} warten auf Bearbeitung` : undefined}
          actions={
            offeneCount > 0 ? (
              <Link href="/anfragen">
                <Button variant="ghost" size="sm" className="gap-1">
                  Alle <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            ) : undefined
          }
        >
          {offeneAnfragen && offeneAnfragen.length > 0 ? (
            <div className="space-y-3">
              {offeneAnfragen.map((anfrage) => {
                const objekt = anfrage.objekte as { strasse: string; plz: string; ort: string; kaufpreis: number } | null;
                const mandant = anfrage.mandanten as { name: string } | null;
                return (
                  <div key={anfrage.id} className="flex items-center justify-between p-3 rounded-lg bg-[#FF9500]/08 border border-[#FF9500]/20">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[#EDF1F5] truncate">{objekt?.strasse}</p>
                      <p className="text-sm text-[#7A9BBD]">{mandant?.name} · {formatCurrency(objekt?.kaufpreis)}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <Clock className="w-4 h-4 text-[#FF9500]" />
                      <span className="text-xs text-[#6B8AAD] whitespace-nowrap">
                        {formatDateTime(anfrage.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-[#6B8AAD]">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-[#34C759]" />
              <p className="text-sm">Keine offenen Anfragen</p>
            </div>
          )}
        </Card>

        {/* Neue Kaufinteressen */}
        <Card
          title="Neue Kaufinteressen"
          subtitle={interessenCount ? `${interessenCount} neue Interessenten` : undefined}
          actions={
            (interessenCount || 0) > 0 ? (
              <Link href="/anfragen">
                <Button variant="ghost" size="sm" className="gap-1">
                  Alle <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            ) : undefined
          }
        >
          {neueInteressen && neueInteressen.length > 0 ? (
            <div className="space-y-3">
              {neueInteressen.map((interesse) => {
                const objekt = interesse.objekt as { strasse: string; plz: string; ort: string } | null;
                const kaeufer = interesse.kaeufer as { name: string } | null;
                return (
                  <div key={interesse.id} className="flex items-center justify-between p-3 rounded-lg bg-[#FF3B30]/08 border border-[#FF3B30]/20">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-pink-500 shrink-0" />
                        <p className="font-medium text-[#EDF1F5] truncate">{kaeufer?.name}</p>
                      </div>
                      <p className="text-sm text-[#7A9BBD] ml-6">interessiert an {objekt?.strasse}</p>
                    </div>
                    <span className="text-xs text-[#6B8AAD] whitespace-nowrap ml-3">
                      {formatDate(interesse.created_at)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-[#6B8AAD]">
              <Heart className="w-8 h-8 mx-auto mb-2 text-[#3D5167]" />
              <p className="text-sm">Keine neuen Kaufinteressen</p>
            </div>
          )}
        </Card>
      </div>

      {/* Letzte Auswertungen */}
      {recentAuswertungen && recentAuswertungen.length > 0 && (
        <Card
          title="Letzte Auswertungen"
          actions={
            <Link href="/auswertungen">
              <Button variant="ghost" size="sm" className="gap-1">
                Alle <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          }
        >
          <div className="space-y-2 sm:space-y-3">
            {recentAuswertungen.map((a) => {
              const objekt = a.objekte as unknown as { strasse: string; plz: string; ort: string } | null;
              const mandant = a.mandanten as unknown as { name: string } | null;
              return (
                <Link
                  key={a.id}
                  href={`/auswertungen/${a.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-[#162636] transition-colors min-h-[44px]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-[#EDF1F5] truncate">{objekt?.strasse || 'Unbekannt'}</p>
                    <p className="text-sm text-[#7A9BBD]">
                      {mandant?.name} · {objekt?.plz} {objekt?.ort}
                    </p>
                  </div>
                  <div className="text-right ml-3">
                    {a.empfehlung && <EmpfehlungBadge empfehlung={a.empfehlung} />}
                    <p className="text-xs text-[#6B8AAD] mt-1">
                      {new Date(a.created_at).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>
      )}
    </>
  );
}

// ============================================================
// MANDANT (KUNDEN) DASHBOARD
// ============================================================
async function MandantDashboardContent({ mandantId }: { mandantId?: string }) {
  const supabase = await createClient();

  if (!mandantId) return null;

  // Meine Objekte
  const { data: objekte } = await supabase
    .from('objekte')
    .select('id, strasse, plz, ort, kaufpreis, gebaeudetyp')
    .eq('mandant_id', mandantId)
    .order('created_at', { ascending: false })
    .limit(5);

  // Meine Anfragen mit Status
  const { data: anfragen } = await supabase
    .from('anfragen')
    .select('*, objekte(id, strasse, plz, ort)')
    .eq('mandant_id', mandantId)
    .order('created_at', { ascending: false })
    .limit(5);

  // Meine fertigen Auswertungen
  const { data: auswertungen } = await supabase
    .from('auswertungen')
    .select('id, empfehlung, pdf_url, created_at, objekte(strasse, plz, ort)')
    .eq('mandant_id', mandantId)
    .order('created_at', { ascending: false })
    .limit(5);

  const offeneAnfragen = anfragen?.filter((a) => a.status === 'offen') || [];
  const fertigeAnfragen = anfragen?.filter((a) => a.status === 'fertig' || a.status === 'versendet') || [];

  const statusIcon = (status: string) => {
    switch (status) {
      case 'offen': return <Clock className="w-4 h-4 text-[#FF9500]" />;
      case 'bezahlt': return <CreditCard className="w-4 h-4 text-[#7A9BBD]" />;
      case 'in_bearbeitung': return <Clock className="w-4 h-4 text-[#7A9BBD]" />;
      case 'fertig': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'versendet': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Clock className="w-4 h-4 text-[#6B8AAD]" />;
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'offen': return 'Zahlung ausstehend';
      case 'bezahlt': return 'Bezahlt';
      case 'in_bearbeitung': return 'In Bearbeitung';
      case 'fertig': return 'Fertig';
      case 'versendet': return 'Versendet';
      default: return status;
    }
  };

  return (
    <>
      {/* Quick Actions für Mandant */}
      <div className="glass-card rounded-2xl p-4 sm:p-5">
        <h2 className="text-[13px] font-semibold text-[#6B8AAD] uppercase tracking-[0.05em] mb-3">Was möchten Sie tun?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Link
            href="/objekte/neu"
            className="flex items-center gap-3 p-4 rounded-xl border border-white/[0.08] hover:border-[#5B7A9D] hover:bg-[#1E2A3A] transition-all min-h-[44px] group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#7A9BBD]/15 flex items-center justify-center shrink-0 text-[#6B8AAD] group-hover:bg-[#5B7A9D]/20 transition-colors">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-[#EDF1F5] text-[13px]">Objekt hinzufügen</p>
              <p className="text-[12px] text-[#7A9BBD]">Neue Immobilie erfassen</p>
            </div>
          </Link>
          <Link
            href="/objekte"
            className="flex items-center gap-3 p-4 rounded-xl border border-white/[0.08] hover:border-[#5B7A9D] hover:bg-[#1E2A3A] transition-all min-h-[44px] group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#34C759]/15 flex items-center justify-center shrink-0 text-[#34C759] group-hover:bg-[#34C759]/15 transition-colors">
              <FileBarChart className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-[#EDF1F5] text-[13px]">Auswertung anfragen</p>
              <p className="text-[12px] text-[#7A9BBD]">Objekt analysieren lassen</p>
            </div>
          </Link>
          <Link
            href="/ankaufsprofile/neu"
            className="flex items-center gap-3 p-4 rounded-xl border border-white/[0.08] hover:border-[#5B7A9D] hover:bg-[#1E2A3A] transition-all min-h-[44px] group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#1E2A3A]/08 flex items-center justify-center shrink-0 text-[#3D5167] group-hover:bg-[#1E2A3A]/12 transition-colors">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-[#EDF1F5] text-[13px]">Ankaufsprofil</p>
              <p className="text-[12px] text-[#7A9BBD]">Kaufkriterien hinterlegen</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Status meiner Anfragen */}
      {anfragen && anfragen.length > 0 && (
        <Card
          title="Status meiner Anfragen"
          subtitle={offeneAnfragen.length > 0 ? `${offeneAnfragen.length} in Bearbeitung` : 'Alle erledigt'}
          actions={
            <Link href="/meine-anfragen">
              <Button variant="ghost" size="sm" className="gap-1">
                Alle <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          }
        >
          <div className="space-y-3">
            {anfragen.map((anfrage) => {
              const objekt = anfrage.objekte as { id: string; strasse: string; plz: string; ort: string } | null;
              return (
                <div key={anfrage.id} className="flex items-center justify-between p-3 rounded-lg bg-[#162636]/50">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {statusIcon(anfrage.status)}
                    <div className="min-w-0">
                      <p className="font-medium text-[#EDF1F5] text-sm truncate">{objekt?.strasse}</p>
                      <p className="text-xs text-[#7A9BBD]">{objekt?.plz} {objekt?.ort}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      anfrage.status === 'offen' ? 'bg-[#FF9500]/15 text-amber-700' :
                      anfrage.status === 'fertig' || anfrage.status === 'versendet' ? 'bg-[#34C759]/12 text-[#34C759]' :
                      anfrage.status === 'bezahlt' ? 'bg-[#7A9BBD]/15 text-[#6B8AAD]' :
                      'bg-[#253546] text-[#EDF1F5]'
                    }`}>
                      {statusLabel(anfrage.status)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Zwei-Spalten: Objekte + Auswertungen */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meine Objekte */}
        <Card
          title="Meine Objekte"
          subtitle={`${objekte?.length || 0} Immobilien`}
          actions={
            <Link href="/objekte">
              <Button variant="ghost" size="sm" className="gap-1">
                Alle <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          }
        >
          {objekte && objekte.length > 0 ? (
            <div className="space-y-3">
              {objekte.map((objekt) => (
                <Link
                  key={objekt.id}
                  href={`/objekte/${objekt.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-[#162636] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Building2 className="w-4 h-4 text-[#7A9BBD] shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-[#EDF1F5] text-sm truncate">{objekt.strasse}</p>
                      <p className="text-xs text-[#7A9BBD]">{objekt.plz} {objekt.ort}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-[#EDF1F5] whitespace-nowrap ml-3">
                    {formatCurrency(objekt.kaufpreis)}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Building2 className="w-8 h-8 mx-auto mb-2 text-[#3D5167]" />
              <p className="text-sm text-[#6B8AAD] mb-3">Noch keine Objekte erfasst</p>
              <Link href="/objekte/neu">
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Objekt hinzufügen
                </Button>
              </Link>
            </div>
          )}
        </Card>

        {/* Meine Auswertungen */}
        <Card
          title="Meine Auswertungen"
          subtitle={`${auswertungen?.length || 0} Analysen`}
          actions={
            <Link href="/auswertungen">
              <Button variant="ghost" size="sm" className="gap-1">
                Alle <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          }
        >
          {auswertungen && auswertungen.length > 0 ? (
            <div className="space-y-3">
              {auswertungen.map((a) => {
                const objekt = a.objekte as unknown as { strasse: string; plz: string; ort: string } | null;
                return (
                  <div key={a.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-[#162636] transition-colors">
                    <Link href={`/auswertungen/${a.id}`} className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="min-w-0">
                        <p className="font-medium text-[#EDF1F5] text-sm truncate">{objekt?.strasse}</p>
                        <p className="text-xs text-[#7A9BBD]">
                          {new Date(a.created_at).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                    </Link>
                    <div className="flex items-center gap-2 ml-3">
                      {a.empfehlung && <EmpfehlungBadge empfehlung={a.empfehlung} />}
                      <div className="flex gap-1">
                        <Link href={`/auswertungen/${a.id}`}>
                          <button className="p-1.5 rounded hover:bg-[#253546] transition-colors" title="Ansehen">
                            <Eye className="w-3.5 h-3.5 text-[#7A9BBD]" />
                          </button>
                        </Link>
                        {a.pdf_url && (
                          <a href={a.pdf_url} target="_blank" rel="noopener noreferrer">
                            <button className="p-1.5 rounded hover:bg-[#253546] transition-colors" title="PDF herunterladen">
                              <Download className="w-3.5 h-3.5 text-[#7A9BBD]" />
                            </button>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6">
              <FileBarChart className="w-8 h-8 mx-auto mb-2 text-[#3D5167]" />
              <p className="text-sm text-[#6B8AAD]">Noch keine Auswertungen</p>
              <p className="text-xs text-[#4A6A8D] mt-1">Fordern Sie eine Analyse für eines Ihrer Objekte an</p>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
