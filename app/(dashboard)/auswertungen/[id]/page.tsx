import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, StatCard } from '@/components/ui/card';
import { EmpfehlungBadge, Badge } from '@/components/ui/badge';
import { formatCurrency, formatPercent, formatDate } from '@/lib/formatters';
import type { Berechnungen, Erlaeuterungen } from '@/lib/types';
import { ArrowLeft, TrendingUp, Banknote, Home, AlertTriangle, CheckCircle } from 'lucide-react';
import { PdfExportButton } from '@/components/pdf-export-button';
import { DebugPdfButton } from '@/components/debug-pdf-button';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AuswertungDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  // Check if user is admin
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id || '')
    .single();
  const isAdmin = profile?.role === 'admin';

  // Fetch auswertung with objekt and mandant
  const { data: auswertung, error } = await supabase
    .from('auswertungen')
    .select(`
      *,
      objekte (*),
      mandanten (name)
    `)
    .eq('id', id)
    .single();

  if (error || !auswertung) {
    notFound();
  }

  const objekt = auswertung.objekte as Record<string, unknown>;
  const mandant = auswertung.mandanten as { name: string } | null;
  const berechnungen = auswertung.berechnungen as Berechnungen;
  const erlaeuterungen = auswertung.erlaeuterungen as Erlaeuterungen;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/auswertungen" className="p-2 hover:bg-slate-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Auswertung: {objekt?.strasse as string}
            </h1>
            <p className="text-slate-600">
              {objekt?.plz as string} {objekt?.ort as string} | {mandant?.name || 'Unbekannter Mandant'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {isAdmin && <DebugPdfButton auswertungId={id} />}
          <PdfExportButton auswertungId={id} />
        </div>
      </div>

      {/* Empfehlung Header */}
      {auswertung.empfehlung && (
        <Card className="border-l-4 border-l-blue-500">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <EmpfehlungBadge empfehlung={auswertung.empfehlung} />
                <Badge variant={
                  auswertung.empfehlung_prioritaet === 'hoch' ? 'danger' :
                  auswertung.empfehlung_prioritaet === 'mittel' ? 'warning' : 'success'
                }>
                  Priorität: {auswertung.empfehlung_prioritaet}
                </Badge>
              </div>
              <p className="text-slate-700">{auswertung.empfehlung_begruendung}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Kaufpreis"
          value={formatCurrency(berechnungen?.finanzierung?.kaufpreis)}
          icon={<Banknote className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Rendite IST"
          value={formatPercent(berechnungen?.rendite?.rendite_ist)}
          subtitle={`Optimiert: ${formatPercent(berechnungen?.rendite?.rendite_opt)}`}
          icon={<TrendingUp className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Cashflow IST"
          value={formatCurrency(berechnungen?.cashflow?.cashflow_ist_jahr)}
          subtitle="pro Jahr"
          icon={<TrendingUp className="w-6 h-6" />}
          color="amber"
        />
        <StatCard
          title="Mietpotenzial"
          value={formatCurrency(berechnungen?.mietanalyse?.potenzial_jahr)}
          subtitle="pro Jahr"
          icon={<Home className="w-6 h-6" />}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Finanzierungsprofil */}
        <Card title="Finanzierungsprofil">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Eigenkapital</span>
              <span className="font-medium">{formatCurrency(berechnungen?.finanzierung?.eigenkapital)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Fremdkapital</span>
              <span className="font-medium">{formatCurrency(berechnungen?.finanzierung?.fremdkapital)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Zinssatz</span>
              <span className="font-medium">{formatPercent(berechnungen?.finanzierung?.zinssatz)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Tilgung</span>
              <span className="font-medium">{formatPercent(berechnungen?.finanzierung?.tilgung)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-slate-600 font-medium">Kapitaldienst p.a.</span>
              <span className="font-bold text-red-600">{formatCurrency(berechnungen?.finanzierung?.kapitaldienst)}</span>
            </div>
          </div>
          {erlaeuterungen?.finanzierungsprofil && (
            <p className="mt-4 text-sm text-slate-500 border-t pt-4">{erlaeuterungen.finanzierungsprofil}</p>
          )}
        </Card>

        {/* Kostenstruktur */}
        <Card title="Kostenstruktur">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Betriebskosten (nicht umlagef.)</span>
              <span className="font-medium">{formatCurrency(berechnungen?.kostenstruktur?.betriebskosten_nicht_umlage)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Instandhaltung</span>
              <span className="font-medium">{formatCurrency(berechnungen?.kostenstruktur?.instandhaltung)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Verwaltung</span>
              <span className="font-medium">{formatCurrency(berechnungen?.kostenstruktur?.verwaltung)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Rücklagen</span>
              <span className="font-medium">{formatCurrency(berechnungen?.kostenstruktur?.ruecklagen)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-slate-600 font-medium">Kosten gesamt</span>
              <span className="font-bold">{formatCurrency(berechnungen?.kostenstruktur?.kosten_gesamt)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Kostenquote</span>
              <Badge variant={
                berechnungen?.kostenstruktur?.bewertung === 'gesund' ? 'success' :
                berechnungen?.kostenstruktur?.bewertung === 'durchschnittlich' ? 'warning' : 'danger'
              }>
                {formatPercent(berechnungen?.kostenstruktur?.kostenquote)} - {berechnungen?.kostenstruktur?.bewertung}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Cashflow */}
        <Card title="Cashflow-Analyse">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500 mb-1">IST (jährlich)</p>
                <p className={`text-2xl font-bold ${berechnungen?.cashflow?.cashflow_ist_jahr >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(berechnungen?.cashflow?.cashflow_ist_jahr)}
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-slate-500 mb-1">Optimiert (jährlich)</p>
                <p className={`text-2xl font-bold ${berechnungen?.cashflow?.cashflow_opt_jahr >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(berechnungen?.cashflow?.cashflow_opt_jahr)}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* WEG-Potenzial */}
        <Card title="WEG-Potenzial">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Wert heute</span>
              <span className="font-medium">{formatCurrency(berechnungen?.weg_potenzial?.wert_heute)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Wert aufgeteilt (+15%)</span>
              <span className="font-medium">{formatCurrency(berechnungen?.weg_potenzial?.wert_aufgeteilt)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-slate-600 font-medium">Potenzial</span>
              <span className="font-bold text-green-600">{formatCurrency(berechnungen?.weg_potenzial?.weg_gewinn)}</span>
            </div>
            {berechnungen?.weg_potenzial?.bereits_aufgeteilt && (
              <Badge variant="info">Bereits aufgeteilt</Badge>
            )}
            {berechnungen?.weg_potenzial?.genehmigung_erforderlich && (
              <Badge variant="warning">Genehmigung erforderlich</Badge>
            )}
          </div>
        </Card>

        {/* AfA / RND */}
        <Card title="AfA / Restnutzungsdauer">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Baujahr</span>
              <span className="font-medium">{berechnungen?.afa_rnd?.baujahr}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Alter</span>
              <span className="font-medium">{berechnungen?.afa_rnd?.alter} Jahre</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Restnutzungsdauer</span>
              <span className="font-medium">{berechnungen?.afa_rnd?.rnd} Jahre</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Gebäudewert (80%)</span>
              <span className="font-medium">{formatCurrency(berechnungen?.afa_rnd?.gebaeude_wert)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-slate-600 font-medium">AfA p.a.</span>
              <span className="font-bold">{formatCurrency(berechnungen?.afa_rnd?.afa_jahr)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Steuerersparnis (42%)</span>
              <span className="font-medium text-green-600">{formatCurrency(berechnungen?.afa_rnd?.steuerersparnis_42)}</span>
            </div>
          </div>
        </Card>

        {/* Wertentwicklung */}
        <Card title="Wertentwicklung (2,5% p.a.)">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Heute</span>
              <span className="font-medium">{formatCurrency(berechnungen?.wertentwicklung?.heute)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">+ 3 Jahre</span>
              <span className="font-medium">{formatCurrency(berechnungen?.wertentwicklung?.jahr_3)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">+ 5 Jahre</span>
              <span className="font-medium">{formatCurrency(berechnungen?.wertentwicklung?.jahr_5)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">+ 7 Jahre</span>
              <span className="font-medium">{formatCurrency(berechnungen?.wertentwicklung?.jahr_7)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-slate-600 font-medium">+ 10 Jahre</span>
              <span className="font-bold text-green-600">{formatCurrency(berechnungen?.wertentwicklung?.jahr_10)}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Handlungsempfehlungen */}
      {(auswertung.empfehlung_handlungsschritte || auswertung.empfehlung_chancen || auswertung.empfehlung_risiken) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {auswertung.empfehlung_handlungsschritte && (
            <Card title="Handlungsschritte">
              <ul className="space-y-2">
                {(auswertung.empfehlung_handlungsschritte as Array<string | { schritt: string; zeitrahmen: string }>).map((schritt, i) => {
                  // Support both old (string) and new (object with zeitrahmen) format
                  const isObject = typeof schritt === 'object' && schritt !== null;
                  const schrittText = isObject ? schritt.schritt : schritt;
                  const zeitrahmen = isObject ? schritt.zeitrahmen : null;
                  return (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <span className="text-slate-700">{schrittText}</span>
                        {zeitrahmen && (
                          <span className="ml-2 text-xs text-green-600 font-medium">({zeitrahmen})</span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}

          {auswertung.empfehlung_chancen && (
            <Card title="Chancen">
              <ul className="space-y-2">
                {(auswertung.empfehlung_chancen as string[]).map((chance, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-slate-700">{chance}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {auswertung.empfehlung_risiken && (
            <Card title="Risiken">
              <ul className="space-y-2">
                {(auswertung.empfehlung_risiken as string[]).map((risiko, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <span className="text-slate-700">{risiko}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}

      {/* Fazit */}
      {auswertung.empfehlung_fazit && (
        <Card title="Fazit">
          <p className="text-slate-700">{auswertung.empfehlung_fazit}</p>
        </Card>
      )}

      {/* Metadaten */}
      <div className="text-sm text-slate-500">
        Auswertung erstellt am {formatDate(auswertung.created_at)}
      </div>
    </div>
  );
}
