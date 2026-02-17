import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/lib/formatters';
import { FileBarChart, Clock, CheckCircle, Plus, Download, CreditCard, AlertCircle, TrendingUp, Zap } from 'lucide-react';
import { PaymentRetryButton } from '@/components/payment-retry-button';
import { getTierForMandant, PRICING_TIERS } from '@/lib/stripe';

// Status config for display
const STATUS_CONFIG = {
  offen: {
    label: 'Zahlung ausstehend',
    variant: 'warning' as const,
    icon: AlertCircle,
    description: 'Bitte schließen Sie die Zahlung ab.',
    showInLegend: true,
  },
  bezahlt: {
    label: 'Bezahlt',
    variant: 'info' as const,
    icon: CreditCard,
    description: 'Zahlung eingegangen, Auswertung wird vorbereitet.',
    showInLegend: true,
  },
  in_bearbeitung: {
    label: 'In Bearbeitung',
    variant: 'info' as const,
    icon: Clock,
    description: 'Ihre Anfrage wird bearbeitet.',
    showInLegend: false,
  },
  fertig: {
    label: 'Abgeschlossen',
    variant: 'success' as const,
    icon: CheckCircle,
    description: 'Die Auswertung ist fertig.',
    showInLegend: false,
  },
  versendet: {
    label: 'Versendet',
    variant: 'success' as const,
    icon: CheckCircle,
    description: 'Die Auswertung wurde Ihnen zugesendet.',
    showInLegend: true,
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

  // Fetch mandant data for pricing tier info
  const { data: mandant } = await supabase
    .from('mandanten')
    .select('completed_analysen')
    .eq('id', profile?.mandant_id)
    .single();

  const completedAnalysen = mandant?.completed_analysen || 0;
  const currentTier = getTierForMandant(completedAnalysen);

  if (error) {
    console.error('Error fetching anfragen:', error);
  }

  // Fetch auswertungen for this mandant to link them
  const { data: auswertungen } = await supabase
    .from('auswertungen')
    .select('id, objekt_id, pdf_url, created_at')
    .eq('mandant_id', profile?.mandant_id);

  // Create a map of objekt_id -> auswertung info
  const auswertungMap = new Map<string, { id: string; pdf_url: string | null }>();
  auswertungen?.forEach((a) => {
    if (a.objekt_id) {
      auswertungMap.set(a.objekt_id, { id: a.id, pdf_url: a.pdf_url });
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#EDF1F5] tracking-[-0.02em]">Meine Anfragen</h1>
          <p className="text-sm sm:text-base text-[#6B8AAD] mt-1">
            Übersicht Ihrer Auswertungsanfragen
          </p>
        </div>
        <Link href="/objekte" className="self-start sm:self-auto">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Neue Anfrage
          </Button>
        </Link>
      </div>

      {/* Status Legend */}
      <Card>
        <div className="flex flex-wrap gap-4">
          {Object.entries(STATUS_CONFIG)
            .filter(([, config]) => config.showInLegend)
            .map(([key, config]) => {
              const Icon = config.icon;
              return (
                <div key={key} className="flex items-center gap-2 text-sm">
                  <Badge variant={config.variant} className="gap-1">
                    <Icon className="w-3 h-3" />
                    {config.label}
                  </Badge>
                  <span className="text-[#7A9BBD] hidden sm:inline">- {config.description}</span>
                </div>
              );
            })}
        </div>
      </Card>

      {/* Pricing Tier Info */}
      <div className="bg-gradient-to-r from-[#1E2A3A] to-[#253546] rounded-xl p-4 sm:p-5 border border-white/[0.08]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-[#7A9BBD]/15 rounded-xl flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-[#7A9BBD]" />
            </div>
            <div>
              <p className="text-xs text-[#7A9BBD]">Ihr aktueller Tarif</p>
              <p className="text-lg font-bold text-[#EDF1F5]">{currentTier.label}</p>
              <p className="text-sm text-[#6B8AAD] mt-0.5">
                {completedAnalysen} {completedAnalysen === 1 ? 'Analyse' : 'Analysen'} abgeschlossen
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#EDF1F5]">{currentTier.preisProAnalyse} €</p>
              <p className="text-[10px] text-[#6B8AAD]">pro Analyse (netto)</p>
            </div>
            {currentTier.name !== 'grossbestand' && (
              <div className="flex items-center gap-2 px-3 py-2 bg-[#34C759]/10 rounded-lg border border-[#34C759]/20">
                <Zap className="w-4 h-4 text-[#34C759]" />
                <div>
                  <p className="text-[10px] text-[#34C759] font-medium">Nächster Tarif</p>
                  <p className="text-xs text-[#EDF1F5]">
                    {currentTier.name === 'einstieg'
                      ? `ab 11 Analysen: 250 €`
                      : `ab 50 Analysen: 180 €`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Progress to next tier */}
        {currentTier.maxAnalysen && (
          <div className="mt-3 pt-3 border-t border-white/[0.06]">
            <div className="flex justify-between text-[10px] text-[#6B8AAD] mb-1">
              <span>{completedAnalysen} / {currentTier.maxAnalysen} im aktuellen Tarif</span>
              <span>{currentTier.maxAnalysen - completedAnalysen} bis zum nächsten Tarif</span>
            </div>
            <div className="w-full h-1.5 bg-[#253546] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#5B7A9D] to-[#34C759] rounded-full transition-all"
                style={{ width: `${Math.min(100, ((completedAnalysen - currentTier.minAnalysen + 1) / (currentTier.maxAnalysen - currentTier.minAnalysen + 1)) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

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
            const auswertungInfo = objekt?.id ? auswertungMap.get(objekt.id) : null;

            return (
              <Card key={anfrage.id} className="hover:shadow-md transition-shadow">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Objekt Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-[#7A9BBD]/15 rounded-xl flex items-center justify-center shrink-0">
                          <FileBarChart className="w-5 h-5 text-[#6B8AAD]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#EDF1F5]">{objekt?.strasse}</h3>
                          <p className="text-sm text-[#7A9BBD]">
                            {objekt?.plz} {objekt?.ort} • {objekt?.gebaeudetyp}
                          </p>
                          <p className="text-sm text-[#7A9BBD]">
                            Kaufpreis: {formatCurrency(objekt?.kaufpreis)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="text-right sm:text-right">
                      <Badge variant={statusConfig.variant} className="gap-1 mb-1">
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </Badge>
                      <p className="text-xs text-[#7A9BBD]">
                        Angefragt am {formatDate(anfrage.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Payment Info for pending payments */}
                  {anfrage.payment_status === 'pending' && status === 'offen' && (
                    <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-white/[0.08]">
                      <PaymentRetryButton anfrageId={anfrage.id} />
                    </div>
                  )}

                  {/* Bezahlt info */}
                  {anfrage.payment_status === 'paid' && anfrage.amount_cents && (
                    <div className="flex items-center gap-2 pt-3 border-t border-white/[0.08] text-sm text-[#34C759]">
                      <CreditCard className="w-4 h-4" />
                      <span>Bezahlt: {formatCurrency(anfrage.amount_cents / 100)}</span>
                      {anfrage.paid_at && (
                        <span className="text-[#6B8AAD]">am {formatDate(anfrage.paid_at)}</span>
                      )}
                    </div>
                  )}

                  {/* Actions - full width buttons for completed items */}
                  {(status === 'fertig' || status === 'versendet') && auswertungInfo && (
                    <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-white/[0.08]">
                      <Link href={`/auswertungen/${auswertungInfo.id}`} className="flex-1">
                        <Button className="w-full gap-2">
                          <FileBarChart className="w-4 h-4" />
                          Auswertung ansehen
                        </Button>
                      </Link>
                      {auswertungInfo.pdf_url && (
                        <a href={auswertungInfo.pdf_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                          <Button variant="secondary" className="w-full gap-2">
                            <Download className="w-4 h-4" />
                            PDF herunterladen
                          </Button>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <FileBarChart className="w-12 h-12 text-[#4A6A8D] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#EDF1F5] mb-2">Keine Anfragen vorhanden</h3>
            <p className="text-[#7A9BBD] mb-6">
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
