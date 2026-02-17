import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { EmpfehlungBadge, Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatPercent, formatDate } from '@/lib/formatters';
import type { Berechnungen, Erlaeuterungen } from '@/lib/types';
import {
  ArrowLeft, TrendingUp, TrendingDown, Banknote, Home, AlertTriangle,
  CheckCircle, CheckCircle2, Download, Clock, Building2, Shield,
  PieChart, BarChart3, ArrowUpRight, ArrowDownRight, Minus, Info,
  MapPin,
} from 'lucide-react';
import { SendEmailButton } from '@/components/send-email-button';
import { DynamicLageplanMap as LageplanMap } from '@/components/maps/lageplan-map-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

// =====================================================
// HELPER COMPONENTS (wie im PDF)
// =====================================================

function SectionBox({ number, title, badge, children }: {
  number: number;
  title: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-[#D5DEE6] overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-4 py-3 bg-[#EDF1F5]/80 border-b border-[#D5DEE6]">
        <span className="w-7 h-7 rounded-full bg-[#2A3F54] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
          {number}
        </span>
        <h3 className="text-sm font-bold text-[#1E2A3A]">{title}</h3>
        {badge && <div className="ml-auto">{badge}</div>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function DataRow({ label, value, bold, valueClass }: {
  label: string;
  value: string | React.ReactNode;
  bold?: boolean;
  valueClass?: string;
}) {
  return (
    <div className={`flex justify-between items-center py-2 ${bold ? 'border-t border-[#D5DEE6] mt-2 pt-3' : 'border-b border-[#D5DEE6]'}`}>
      <span className={`text-[#4A6A8D] text-sm ${bold ? 'font-semibold' : ''}`}>{label}</span>
      <span className={`text-sm font-medium flex-shrink-0 ${valueClass || (bold ? 'font-bold' : '')}`}>{value}</span>
    </div>
  );
}

function InfoBox({ children, variant = 'default' }: {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'info';
}) {
  const bgMap = { default: 'bg-[#EDF1F5]', success: 'bg-green-50', warning: 'bg-amber-50', info: 'bg-[#5B7A9D]/08' };
  const borderMap = { default: 'border-[#D5DEE6]', success: 'border-green-200', warning: 'border-amber-200', info: 'border-[#D5DEE6]' };
  return (
    <div className={`${bgMap[variant]} ${borderMap[variant]} border rounded-lg p-3 mt-3`}>
      {children}
    </div>
  );
}

function ProgressBar({ value, max = 100, color = 'bg-[#2A3F54]' }: {
  value: number;
  max?: number;
  color?: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="w-full h-2 bg-[#D5DEE6] rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function TrendArrow({ value }: { value: number }) {
  if (value > 0.5) {
    return (
      <span className="text-green-600 text-xs font-bold flex items-center gap-1">
        <ArrowUpRight className="w-3 h-3" />+{value.toFixed(1)}%
      </span>
    );
  }
  if (value < -0.5) {
    return (
      <span className="text-red-600 text-xs font-bold flex items-center gap-1">
        <ArrowDownRight className="w-3 h-3" />{value.toFixed(1)}%
      </span>
    );
  }
  return (
    <span className="text-[#9EAFC0] text-xs font-bold flex items-center gap-1">
      <Minus className="w-3 h-3" />{value.toFixed(1)}%
    </span>
  );
}

function TrafficLight({ status }: { status: 'green' | 'yellow' | 'red' }) {
  const colorMap = { green: 'bg-green-500', yellow: 'bg-yellow-500', red: 'bg-red-500' };
  return <span className={`inline-block w-3 h-3 rounded-full ${colorMap[status]} ring-2 ring-white`} />;
}

// =====================================================
// MAIN PAGE
// =====================================================

export default async function AuswertungDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id || '')
    .single();
  const isAdmin = profile?.role === 'admin';

  const { data: auswertung, error } = await supabase
    .from('auswertungen')
    .select('*, objekte (*), mandanten (name, anrede, ansprechpartner)')
    .eq('id', id)
    .single();

  if (error || !auswertung) notFound();

  const objekt = auswertung.objekte as Record<string, unknown>;
  const mandant = auswertung.mandanten as { name: string; anrede?: string; ansprechpartner?: string } | null;
  const berechnungen = auswertung.berechnungen as Berechnungen;
  const erlaeuterungen = auswertung.erlaeuterungen as Erlaeuterungen;

  const fin = berechnungen?.finanzierung;
  const kosten = berechnungen?.kostenstruktur;
  const cashflow = berechnungen?.cashflow;
  const rendite = berechnungen?.rendite;
  const miet = berechnungen?.mietanalyse;
  const weg = berechnungen?.weg_potenzial;
  const afa = berechnungen?.afa_rnd;
  const wert = berechnungen?.wertentwicklung;
  const mod559 = berechnungen?.modernisierung_559;
  const marktdaten = berechnungen?.marktdaten;

  // Berechnete Werte (wie im PDF)
  const kaufpreis = fin?.kaufpreis || (objekt?.kaufpreis as number) || 0;
  const jahresmiete = miet?.miete_ist_jahr || 0;
  const kaufpreisfaktor = marktdaten?.kaufpreisfaktor_region?.wert || 20;
  const verkehrswertErtrag = jahresmiete > 0 ? jahresmiete * kaufpreisfaktor : kaufpreis;
  const verkehrswertGeschaetzt = wert?.heute || verkehrswertErtrag || kaufpreis;
  const restschuld = fin?.fremdkapital || 0;
  const abbezahlteSumme = Math.max(0, verkehrswertGeschaetzt - restschuld);
  const beleihungswert = abbezahlteSumme * 0.7;
  const steuerersparnis = afa?.steuerersparnis_42 || 0;
  const rendite_nach_steuer = kaufpreis > 0
    ? ((miet?.miete_ist_jahr || 0) + steuerersparnis) / kaufpreis * 100
    : 0;

  const einheiten = (miet?.einheiten || []) as Array<{
    position: number; nutzung: string; flaeche: number; kaltmiete_ist: number;
    kaltmiete_soll: number; potenzial: number; vergleichsmiete?: number;
  }>;
  const einheitenMitPotenzial = einheiten.filter(e => e.potenzial > 0).length;
  const gesamtflaeche = einheiten.reduce((sum, e) => sum + (e.flaeche || 0), 0);
  const verkehrswertProQm = gesamtflaeche > 0 ? verkehrswertGeschaetzt / gesamtflaeche : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/auswertungen" className="p-2 hover:bg-[#EDF1F5] rounded-lg">
            <ArrowLeft className="w-5 h-5 text-[#4A6A8D]" />
          </Link>
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-[#1E2A3A]">
              {objekt?.strasse as string}, {objekt?.plz as string} {objekt?.ort as string}
            </h1>
            <p className="text-sm text-[#5B7A9D]">
              {mandant?.name || 'Unbekannter Mandant'} · {formatDate(auswertung.created_at)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 ml-11 sm:ml-0">
          <Badge variant={auswertung.status === 'abgeschlossen' ? 'success' : 'info'} className="gap-1">
            {auswertung.status === 'abgeschlossen' ? (
              <><CheckCircle2 className="w-3 h-3" /> Abgeschlossen</>
            ) : (
              <><Clock className="w-3 h-3" /> Eingereicht</>
            )}
          </Badge>
          {auswertung.pdf_url && (
            <a href={auswertung.pdf_url} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" className="gap-2">
                <Download className="w-4 h-4" />PDF ansehen
              </Button>
            </a>
          )}
          {isAdmin && <SendEmailButton auswertungId={id} status={auswertung.status} />}
        </div>
      </div>

      {/* ===== LAGEPLAN ===== */}
      <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-[#D5DEE6] overflow-hidden shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3 bg-[#EDF1F5]/80 border-b border-[#D5DEE6]">
          <MapPin className="w-5 h-5 text-[#2A3F54]" />
          <div>
            <h3 className="text-sm font-bold text-[#1E2A3A]">Lageplan</h3>
            <p className="text-xs text-[#5B7A9D]">{objekt?.strasse as string}, {objekt?.plz as string} {objekt?.ort as string}</p>
          </div>
        </div>
        <div className="p-3">
          <LageplanMap address={`${objekt?.strasse as string}, ${objekt?.plz as string} ${objekt?.ort as string}`} height={300} />
        </div>
      </div>

      {/* ===== KEY METRICS BAR ===== */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-[#D5DEE6] rounded-xl overflow-hidden border border-[#D5DEE6]">
        <div className="bg-white/80 backdrop-blur-sm p-4 text-center">
          <p className="text-xs text-[#5B7A9D]">Verkehrswert*</p>
          <p className="text-lg font-bold text-[#1E2A3A]">{formatCurrency(verkehrswertGeschaetzt)}</p>
          {gesamtflaeche > 0 && (
            <p className="text-xs text-[#2A3F54] font-semibold">({formatCurrency(verkehrswertProQm)}/m²)</p>
          )}
        </div>
        <div className="bg-white/80 backdrop-blur-sm p-4 text-center">
          <p className="text-xs text-[#5B7A9D]">EK-Puffer</p>
          <p className={`text-lg font-bold ${abbezahlteSumme >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(abbezahlteSumme)}
          </p>
          <p className="text-[10px] text-[#9EAFC0]">VW − Restschuld</p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm p-4 text-center">
          <p className="text-xs text-[#5B7A9D]">Rendite</p>
          <p className="text-lg font-bold text-[#1E2A3A]">{formatPercent(rendite?.rendite_ist)}</p>
          <p className="text-[10px] text-green-600">
            +{formatPercent(rendite_nach_steuer - (rendite?.rendite_ist || 0))} n. AfA
          </p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm p-4 text-center">
          <p className="text-xs text-[#5B7A9D]">AfA-Ersparnis</p>
          <p className="text-lg font-bold text-green-600">{formatCurrency(steuerersparnis)}/J.</p>
          <p className="text-[10px] text-[#9EAFC0]">bei 42% Grenzsteuersatz</p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm p-4 text-center col-span-2 md:col-span-1">
          <p className="text-xs text-[#5B7A9D] mb-1">Empfehlung</p>
          {auswertung.empfehlung ? (
            <EmpfehlungBadge empfehlung={auswertung.empfehlung} />
          ) : (
            <span className="text-[#9EAFC0]">-</span>
          )}
        </div>
      </div>

      {/* ===== BELEIHUNGSWERT ===== */}
      <div className="bg-[#EDF1F5] backdrop-blur-sm rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center border border-[#D5DEE6]">
        <div className="flex-shrink-0">
          <p className="text-xs text-[#2A3F54] font-bold">Beleihungswert (70% d. EK)</p>
          <p className="text-xl font-bold text-[#1E2A3A]">{formatCurrency(beleihungswert)}</p>
        </div>
        <div className="md:border-l md:border-[#D5DEE6] md:pl-4 text-xs text-[#4A6A8D]">
          <p>
            Abbezahlte Summe (VW − Restschuld): {formatCurrency(abbezahlteSumme)}.
            Der Beleihungswert (60–80%, hier 70%) zeigt die verfügbare Sicherheit für Refinanzierungen.
          </p>
          <p className="text-[10px] text-[#9EAFC0] italic mt-1">Quelle: Berechnung nach Bankenstandard (BelWertV)</p>
        </div>
      </div>

      {/* ===== MARKTDATEN ===== */}
      {marktdaten && (
        <div className="bg-purple-50/50 backdrop-blur-sm rounded-xl p-4 border border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[#1E2A3A]">Aktuelle Marktdaten</h3>
            <span className="text-xs text-[#5B7A9D]">Standort: {marktdaten.standort}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {/* Spalte 1 */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[#4A6A8D]">Vergleichsmiete Wohnen</span>
                <span className="font-semibold">{marktdaten.vergleichsmiete_wohnen.wert} €/m²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#4A6A8D]">Vergleichsmiete Gewerbe</span>
                <span className="font-semibold">{marktdaten.vergleichsmiete_gewerbe.wert} €/m²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#4A6A8D]">Kaufpreisfaktor</span>
                <span className="font-semibold">{marktdaten.kaufpreisfaktor_region.wert}x</span>
              </div>
            </div>
            {/* Spalte 2 */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[#4A6A8D]">Kappungsgrenze</span>
                <span className={`font-semibold ${marktdaten.kappungsgrenze.vorhanden ? 'text-red-600' : 'text-green-600'}`}>
                  {marktdaten.kappungsgrenze.prozent}% {marktdaten.kappungsgrenze.vorhanden ? '(angespannt)' : ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#4A6A8D]">Milieuschutz</span>
                <span className={`font-semibold ${marktdaten.milieuschutzgebiet.vorhanden ? 'text-red-600' : 'text-green-600'}`}>
                  {marktdaten.milieuschutzgebiet.vorhanden ? 'Ja' : 'Nein'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#4A6A8D]">Akt. Bauzinsen</span>
                <span className="font-semibold">
                  {marktdaten.aktuelle_bauzinsen.wert}% ({marktdaten.aktuelle_bauzinsen.zinsbindung})
                </span>
              </div>
            </div>
            {/* Spalte 3: Prognose */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-[#1E2A3A]">Preisprognose p.a.</p>
              <div className="flex justify-between items-center">
                <span className="text-[#4A6A8D]">0–3 Jahre</span>
                <TrendArrow value={marktdaten.preisprognose.kurz_0_3_jahre} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#4A6A8D]">3–7 Jahre</span>
                <TrendArrow value={marktdaten.preisprognose.mittel_3_7_jahre} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#4A6A8D]">7+ Jahre</span>
                <TrendArrow value={marktdaten.preisprognose.lang_7_plus_jahre} />
              </div>
            </div>
          </div>
          <p className="text-[10px] text-[#9EAFC0] italic mt-3">
            Quelle: Aktuelle Marktanalyse, Stand: {new Date(marktdaten.abfrage_datum).toLocaleDateString('de-DE')}
          </p>
        </div>
      )}

      {/* ===== SECTIONS 1–4 (2×2 Grid) ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Section 1: Finanzierungsprofil */}
        <SectionBox number={1} title="Finanzierungsprofil">
          <DataRow label="Eigenkapital" value={formatCurrency(fin?.eigenkapital)} />
          <DataRow label="Fremdkapital" value={formatCurrency(fin?.fremdkapital)} />
          <DataRow label="Zinssatz / Tilgung" value={`${formatPercent(fin?.zinssatz)} / ${formatPercent(fin?.tilgung)}`} />
          <DataRow
            label="Kapitaldienst p.a."
            value={formatCurrency(fin?.kapitaldienst)}
            valueClass="text-red-600 font-bold"
          />
          <DataRow label="Anfangsrendite" value={formatPercent(rendite?.rendite_ist)} bold />
          <InfoBox>
            <p className="text-xs text-[#4A6A8D]">
              • EK-Quote: {((fin?.eigenkapital || 0) / (fin?.kaufpreis || 1) * 100).toFixed(0)}%{' '}
              {(fin?.eigenkapital || 0) / (fin?.kaufpreis || 1) >= 0.3 ? '(konservativ)' : '(gehebelt)'}
            </p>
            <p className="text-xs text-[#4A6A8D]">
              • Zinsniveau: {(fin?.zinssatz || 0) <= 3.5 ? 'günstig' : (fin?.zinssatz || 0) <= 4.5 ? 'marktüblich' : 'erhöht'}
            </p>
          </InfoBox>
        </SectionBox>

        {/* Section 2: Ertragsprofil */}
        <SectionBox number={2} title="Ertragsprofil">
          <DataRow label="IST-Miete p.a." value={formatCurrency(miet?.miete_ist_jahr)} />
          <DataRow label="SOLL-Miete p.a." value={formatCurrency(miet?.miete_soll_jahr)} />
          <DataRow
            label="Mietpotenzial"
            value={`+${formatCurrency(miet?.potenzial_jahr)}`}
            bold
            valueClass="text-green-600 font-bold"
          />
          {miet?.miete_ist_jahr && miet.potenzial_jahr ? (
            <p className="text-xs text-[#5B7A9D] text-right mt-1">
              +{((miet.potenzial_jahr / miet.miete_ist_jahr) * 100).toFixed(1)}% Steigerung möglich
            </p>
          ) : null}
          <InfoBox>
            <p className="text-xs text-[#4A6A8D]">• IST: Tatsächliche Mieteinnahmen lt. Mandant</p>
            <p className="text-xs text-[#4A6A8D]">• SOLL: Marktmiete bei Neuvermietung</p>
            <p className="text-[10px] text-[#9EAFC0] italic mt-1">
              Quelle: {marktdaten?.vergleichsmiete_wohnen?.quelle || `Mietspiegel ${(objekt?.ort as string) || 'Region'}`}
            </p>
          </InfoBox>
        </SectionBox>

        {/* Section 3: Cashflow-Analyse */}
        <SectionBox number={3} title="Cashflow-Analyse">
          <DataRow label="Mieteinnahmen" value={formatCurrency(miet?.miete_ist_jahr)} />
          <DataRow label="./. Kapitaldienst" value={`-${formatCurrency(fin?.kapitaldienst)}`} valueClass="text-red-600" />
          <DataRow label="./. Kosten" value={`-${formatCurrency(kosten?.kosten_gesamt)}`} valueClass="text-red-600" />
          <DataRow
            label="Cashflow IST"
            value={formatCurrency(cashflow?.cashflow_ist_jahr)}
            bold
            valueClass={`font-bold ${(cashflow?.cashflow_ist_jahr || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}
          />
          <DataRow
            label="Cashflow optimiert"
            value={formatCurrency(cashflow?.cashflow_opt_jahr)}
            valueClass={`font-bold ${(cashflow?.cashflow_opt_jahr || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}
          />
          <InfoBox>
            <p className="text-xs text-[#4A6A8D]">• Cashflow = Miete − Kapitaldienst − Kosten</p>
            <p className={`text-xs ${(cashflow?.cashflow_ist_jahr || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              • Status: {(cashflow?.cashflow_ist_jahr || 0) >= 0 ? 'Objekt trägt sich selbst' : 'Unterdeckung – Zuschuss erforderlich'}
            </p>
          </InfoBox>
        </SectionBox>

        {/* Section 4: Kostenstruktur */}
        <SectionBox
          number={4}
          title="Kostenstruktur"
          badge={
            <TrafficLight
              status={kosten?.bewertung === 'gesund' ? 'green' : kosten?.bewertung === 'durchschnittlich' ? 'yellow' : 'red'}
            />
          }
        >
          <div className="space-y-3 mb-3">
            {[
              { label: 'Instandhaltung', value: kosten?.instandhaltung || 0, color: 'bg-[#2A3F54]' },
              { label: 'Verwaltung', value: kosten?.verwaltung || 0, color: 'bg-purple-500' },
              { label: 'Nicht umlf. BK', value: kosten?.betriebskosten_nicht_umlage || 0, color: 'bg-amber-500' },
              { label: 'Rücklagen', value: kosten?.ruecklagen || 0, color: 'bg-emerald-500' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-[#4A6A8D] w-20 flex-shrink-0">{item.label}</span>
                <div className="flex-1">
                  <ProgressBar value={item.value} max={kosten?.kosten_gesamt || 1} color={item.color} />
                </div>
                <span className="text-xs font-semibold w-16 text-right flex-shrink-0">
                  {formatCurrency(item.value)}
                </span>
              </div>
            ))}
          </div>
          <DataRow label="Gesamt" value={formatCurrency(kosten?.kosten_gesamt)} bold />
          <div className="mt-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-[#4A6A8D]">Kostenquote</span>
              <span className={`text-xs font-bold ${kosten?.bewertung === 'gesund' ? 'text-green-600' : kosten?.bewertung === 'durchschnittlich' ? 'text-amber-600' : 'text-red-600'}`}>
                {formatPercent(kosten?.kostenquote)} – {kosten?.bewertung}
              </span>
            </div>
            <ProgressBar
              value={kosten?.kostenquote || 0}
              max={50}
              color={kosten?.bewertung === 'gesund' ? 'bg-green-500' : kosten?.bewertung === 'durchschnittlich' ? 'bg-amber-500' : 'bg-red-500'}
            />
            <div className="flex justify-between text-[10px] text-[#9EAFC0] mt-1">
              <span>0%</span>
              <span className="text-green-500">25%</span>
              <span className="text-amber-500">35%</span>
              <span className="text-red-500">50%</span>
            </div>
          </div>
        </SectionBox>
      </div>

      {/* ===== SECTION 5: Mieterhöhungspotenzial Tabelle ===== */}
      <SectionBox
        number={5}
        title="Mieterhöhungspotenzial (§558 gilt nur für Wohnraum)"
        badge={
          <Badge variant="success">
            {einheitenMitPotenzial} von {einheiten.length} mit Potenzial
          </Badge>
        }
      >
        <div className="overflow-x-auto -mx-4">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="bg-[#EDF1F5] text-[#5B7A9D] font-semibold">
                <th className="px-3 py-2 text-center">#</th>
                <th className="px-3 py-2 text-left">Nutzung</th>
                <th className="px-3 py-2 text-right">Fläche</th>
                <th className="px-3 py-2 text-right">IST-Miete</th>
                <th className="px-3 py-2 text-right">€/m²</th>
                <th className="px-3 py-2 text-right">Markt</th>
                <th className="px-3 py-2 text-right">SOLL-Miete</th>
                <th className="px-3 py-2 text-right">Potenzial</th>
              </tr>
            </thead>
            <tbody>
              {einheiten.map((e, i) => {
                const euroPerSqm = e.flaeche > 0 ? e.kaltmiete_ist / e.flaeche : 0;
                return (
                  <tr key={i} className={i % 2 === 1 ? 'bg-[#EDF1F5]/50' : ''}>
                    <td className="px-3 py-2 text-center">{e.position}</td>
                    <td className="px-3 py-2">{e.nutzung}</td>
                    <td className="px-3 py-2 text-right">{e.flaeche} m²</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(e.kaltmiete_ist)}</td>
                    <td className="px-3 py-2 text-right">{euroPerSqm.toFixed(2)} €</td>
                    <td className="px-3 py-2 text-right">{e.vergleichsmiete || '-'} €</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(e.kaltmiete_soll)}</td>
                    <td className={`px-3 py-2 text-right font-semibold ${e.potenzial > 0 ? 'text-green-600' : 'text-[#9EAFC0]'}`}>
                      {e.potenzial > 0 ? `+${formatCurrency(e.potenzial)}` : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-[#EDF1F5] font-bold border-t border-[#D5DEE6]">
                <td className="px-3 py-2"></td>
                <td className="px-3 py-2">GESAMT</td>
                <td className="px-3 py-2"></td>
                <td className="px-3 py-2 text-right">{formatCurrency(miet?.miete_ist_monat)}</td>
                <td className="px-3 py-2"></td>
                <td className="px-3 py-2"></td>
                <td className="px-3 py-2 text-right">{formatCurrency(miet?.miete_soll_monat)}</td>
                <td className="px-3 py-2 text-right text-green-600">+{formatCurrency(miet?.potenzial_monat)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <InfoBox>
          <p className="text-xs text-[#4A6A8D]">
            • §558 BGB: Miete darf innerhalb von 3 Jahren um max. {(objekt?.milieuschutz as boolean) ? '15%' : '20%'} erhöht werden.
          </p>
          <p className="text-xs text-[#4A6A8D]">
            {`• "Sofort" = Erhöhung jetzt möglich. Sperrfrist: 15 Monate nach letzter Erhöhung.`}
          </p>
          <p className="text-xs text-[#4A6A8D]">
            • Gewerbe/Stellplatz: Freie Mietvertragsregelungen, keine gesetzliche Kappung.
          </p>
        </InfoBox>
      </SectionBox>

      {/* ===== SECTIONS 6 & 7 ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Section 6: Cashflow IST vs. Optimiert */}
        <SectionBox number={6} title="Cashflow IST vs. Optimiert">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-[#5B7A9D]">IST</span>
                <span className={`text-sm font-bold ${(cashflow?.cashflow_ist_jahr || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(cashflow?.cashflow_ist_jahr)}
                </span>
              </div>
              <div className="h-5 bg-[#EDF1F5] rounded overflow-hidden">
                <div
                  className={`h-full rounded ${(cashflow?.cashflow_ist_jahr || 0) >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{
                    width: `${Math.min(100, Math.abs(cashflow?.cashflow_ist_jahr || 0) / Math.max(Math.abs(cashflow?.cashflow_ist_jahr || 1), Math.abs(cashflow?.cashflow_opt_jahr || 1)) * 100)}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-green-600 font-bold">OPTIMIERT</span>
                <span className={`text-sm font-bold ${(cashflow?.cashflow_opt_jahr || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(cashflow?.cashflow_opt_jahr)}
                </span>
              </div>
              <div className="h-5 bg-[#EDF1F5] rounded overflow-hidden">
                <div
                  className={`h-full rounded ${(cashflow?.cashflow_opt_jahr || 0) >= 0 ? 'bg-green-600' : 'bg-red-500'}`}
                  style={{
                    width: `${Math.min(100, Math.abs(cashflow?.cashflow_opt_jahr || 0) / Math.max(Math.abs(cashflow?.cashflow_ist_jahr || 1), Math.abs(cashflow?.cashflow_opt_jahr || 1)) * 100)}%`,
                  }}
                />
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200">
              <p className="text-lg font-bold text-green-600">
                Potenzial: +{formatCurrency((cashflow?.cashflow_opt_jahr || 0) - (cashflow?.cashflow_ist_jahr || 0))} p.a.
              </p>
            </div>
          </div>
        </SectionBox>

        {/* Section 7: Wertentwicklung */}
        <SectionBox number={7} title="Wertentwicklung">
          <div className="flex items-end justify-center gap-3 h-32 mb-4">
            {[
              { label: 'Heute', value: wert?.heute || 0, pct: null as number | null },
              { label: '+3J', value: wert?.jahr_3 || 0, pct: wert?.heute ? ((wert.jahr_3 - wert.heute) / wert.heute * 100) : 0 },
              { label: '+5J', value: wert?.jahr_5 || 0, pct: wert?.heute ? ((wert.jahr_5 - wert.heute) / wert.heute * 100) : 0 },
              { label: '+7J', value: wert?.jahr_7 || 0, pct: wert?.heute ? ((wert.jahr_7 - wert.heute) / wert.heute * 100) : 0 },
              { label: '+10J', value: wert?.jahr_10 || 0, pct: wert?.heute ? ((wert.jahr_10 - wert.heute) / wert.heute * 100) : 0 },
            ].map((item, i) => {
              const maxVal = wert?.jahr_10 || wert?.heute || 1;
              const heightPct = Math.max(40, (item.value / maxVal) * 100);
              const barColors = ['#94a3b8', '#7a8c9d', '#5a6c7d', '#4a5c6d', '#3a4c5d'];
              return (
                <div key={i} className="flex flex-col items-center flex-1 max-w-16">
                  <span className="text-[10px] font-bold text-[#1E2A3A] mb-1">{formatCurrency(item.value)}</span>
                  {item.pct !== null && (
                    <span className="text-[10px] font-bold text-green-600">+{item.pct.toFixed(0)}%</span>
                  )}
                  <div
                    className="w-full rounded-t"
                    style={{ height: `${heightPct}%`, backgroundColor: barColors[i], minHeight: 24 }}
                  />
                  <span className="text-[10px] text-[#5B7A9D] mt-1">{item.label}</span>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-[#9EAFC0] italic text-center">
            Quelle: {marktdaten?.preisprognose ? 'Perplexity Marktprognose' : 'Hist. Durchschnitt (2,5% p.a.)'}
          </p>
        </SectionBox>
      </div>

      {/* ===== SECTIONS 8 & 9 ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Section 8: CAPEX & §559 */}
        <SectionBox number={8} title="CAPEX & §559 BGB">
          <DataRow label="CAPEX geplant" value={formatCurrency(mod559?.capex_betrag)} />
          <div className="bg-[#EDF1F5] rounded-xl p-4 mt-3 text-center border border-[#D5DEE6]">
            <p className="text-xs text-[#2A3F54] font-bold">§559 Modernisierungsumlage</p>
            <p className="text-2xl font-bold text-[#1E2A3A] my-1">
              {formatCurrency(mod559?.umlage_nach_kappung)} p.a.
            </p>
            <p className="text-xs text-[#5B7A9D]">Gekappt nach §559 Abs. 3a BGB</p>
          </div>
          <InfoBox>
            <p className="text-xs font-semibold text-[#4A6A8D] mb-1">Kappungsgrenzen §559 Abs. 3a BGB:</p>
            <p className="text-xs text-[#4A6A8D]">{'• Kaltmiete < 7€/m²: max. 2€/m² in 6 Jahren'}</p>
            <p className="text-xs text-[#4A6A8D]">{'• Kaltmiete ≥ 7€/m²: max. 3€/m² in 6 Jahren'}</p>
          </InfoBox>
        </SectionBox>

        {/* Section 9: WEG-Potenzial */}
        <SectionBox number={9} title="WEG-Potenzial">
          <DataRow label="Wert heute" value={formatCurrency(weg?.wert_heute)} />
          <DataRow label="Wert aufgeteilt (+15%)" value={formatCurrency(weg?.wert_aufgeteilt)} />
          <DataRow
            label="Potenzial"
            value={`+${formatCurrency(weg?.weg_gewinn)}`}
            bold
            valueClass="text-green-600 font-bold"
          />
          {weg?.bereits_aufgeteilt && (
            <Badge variant="info" className="mt-2">Bereits aufgeteilt</Badge>
          )}
          {weg?.genehmigung_erforderlich && (
            <div className="bg-amber-50 rounded-lg p-2 mt-2 text-center border border-amber-200">
              <span className="text-xs font-bold text-amber-600">Genehmigung nötig</span>
            </div>
          )}
          <InfoBox>
            <p className="text-xs text-[#4A6A8D]">• WEG-Aufteilung: +15% Wertsteigerung durch Einzelverkauf</p>
            <p className="text-xs text-[#4A6A8D]">
              • Status: {weg?.bereits_aufgeteilt ? 'Bereits aufgeteilt' : 'Noch nicht aufgeteilt'}
            </p>
          </InfoBox>
        </SectionBox>
      </div>

      {/* ===== SECTIONS 10 & 11 ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Section 10: AfA & Steuervorteile */}
        <SectionBox number={10} title="AfA & Steuervorteile">
          <div className="bg-green-50 rounded-lg p-4 mb-4 text-center border border-green-200">
            <p className="text-xs text-green-600 font-bold mb-1">Jährlicher Steuervorteil</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(steuerersparnis)}</p>
            <p className="text-xs text-[#5B7A9D]">bei 42% Grenzsteuersatz</p>
          </div>
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-[#4A6A8D]">Restnutzungsdauer</span>
              <span className="text-xs font-bold">{afa?.rnd} von 80 Jahren</span>
            </div>
            <ProgressBar value={afa?.rnd || 0} max={80} color="bg-[#2A3F54]" />
          </div>
          <DataRow label="Baujahr / Alter" value={`${afa?.baujahr} / ${afa?.alter}J.`} />
          <DataRow label="AfA-Satz" value={afa?.rnd ? `${(100 / afa.rnd).toFixed(2)}%` : '-'} />
          <DataRow label="AfA-Betrag p.a." value={formatCurrency(afa?.afa_jahr)} />
          <InfoBox>
            <p className="text-xs text-[#4A6A8D]">• AfA = Absetzung für Abnutzung (§7 EStG)</p>
            <p className="text-xs text-[#4A6A8D]">
              • Basis: {formatCurrency(afa?.gebaeude_wert)} Gebäudewert (80% KP)
            </p>
          </InfoBox>
        </SectionBox>

        {/* Section 11: Rendite-Szenarien */}
        <SectionBox number={11} title="Rendite-Szenarien">
          <div className="space-y-4 mb-4">
            {[
              { label: 'Brutto-Rendite IST', value: rendite?.rendite_ist || 0, color: 'bg-[#9EAFC0]' },
              { label: 'Brutto-Rendite OPT', value: rendite?.rendite_opt || 0, color: 'bg-green-500' },
              { label: 'Nach AfA (eff.)', value: rendite_nach_steuer, color: 'bg-[#1E2A3A]' },
              { label: 'EK-Rendite IST', value: rendite?.eigenkapitalrendite_ist || 0, color: 'bg-[#2A3F54]' },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-[#4A6A8D]">{item.label}</span>
                  <span className="text-xs font-bold">{formatPercent(item.value)}</span>
                </div>
                <ProgressBar value={item.value} max={15} color={item.color} />
              </div>
            ))}
          </div>
          <div className="bg-[#EDF1F5] rounded-xl p-3 text-center border border-[#D5DEE6]">
            <p className="text-xs text-[#2A3F54] font-bold">EK-Rendite optimiert</p>
            <p className="text-xl font-bold text-[#1E2A3A]">{formatPercent(rendite?.eigenkapitalrendite_opt)}</p>
          </div>
        </SectionBox>
      </div>

      {/* ===== SECTION 12: Exit-Szenarien ===== */}
      <SectionBox number={12} title="Exit-Szenarien">
        <div className="overflow-x-auto">
          <div className="flex items-end justify-between gap-2 min-w-[400px] px-4">
            {[
              { label: 'Heute', value: wert?.heute || 0 },
              { label: '+3 Jahre', value: wert?.jahr_3 || 0 },
              { label: '+5 Jahre', value: wert?.jahr_5 || 0 },
              { label: '+7 Jahre', value: wert?.jahr_7 || 0 },
              { label: '+10 Jahre', value: wert?.jahr_10 || 0 },
            ].map((item, i, arr) => {
              const maxVal = arr[arr.length - 1].value || 1;
              const minVal = (arr[0].value || 0) * 0.9;
              const range = maxVal - minVal || 1;
              const heightPct = 20 + ((item.value - minVal) / range) * 80;
              const increment = i > 0 ? item.value - arr[i - 1].value : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <span className="text-xs font-bold text-[#1E2A3A]">{formatCurrency(item.value)}</span>
                  {i > 0 && increment > 0 && (
                    <span className="text-[10px] font-bold text-green-600">+{formatCurrency(increment)}</span>
                  )}
                  <div className="w-full bg-green-100 rounded-t mt-1" style={{ height: `${heightPct}px` }}>
                    <div className="w-full h-full bg-gradient-to-t from-green-500 to-green-300 rounded-t" />
                  </div>
                  <span className="text-[10px] text-[#5B7A9D] mt-1">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 bg-green-50 rounded-lg p-4 mt-4 border border-green-200">
          <div className="text-center">
            <p className="text-xs text-[#5B7A9D]">Wertzuwachs 10J</p>
            <p className="text-lg font-bold text-green-600">
              +{formatCurrency((wert?.jahr_10 || 0) - (wert?.heute || 0))}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-[#5B7A9D]">Rendite p.a.</p>
            <p className="text-lg font-bold text-green-600">
              +{(wert?.heute && wert?.jahr_10)
                ? (((wert.jahr_10 / wert.heute) ** (1 / 10) - 1) * 100).toFixed(1)
                : '2.5'}%
            </p>
          </div>
        </div>
      </SectionBox>

      {/* ===== WERTSTEIGERNDE MASSNAHMEN ZUSAMMENFASSUNG ===== */}
      <div className="bg-green-50/50 backdrop-blur-sm rounded-xl p-5 border border-green-200">
        <h3 className="text-base font-bold text-green-700 mb-4">
          Zusammenfassung: Wertsteigernde Maßnahmen
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white rounded-lg p-4">
            <p className="text-xs text-[#5B7A9D] mb-1">Mieterhöhungspotenzial</p>
            <p className="text-xl font-bold text-green-600">+{formatCurrency(miet?.potenzial_jahr)}/Jahr</p>
            <p className="text-[10px] text-[#9EAFC0] mt-1">durch Anpassung auf Marktmiete</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-xs text-[#5B7A9D] mb-1">WEG-Aufteilung</p>
            <p className={`text-xl font-bold ${weg?.bereits_aufgeteilt ? 'text-[#9EAFC0]' : 'text-green-600'}`}>
              {weg?.bereits_aufgeteilt ? 'Bereits aufgeteilt' : `+${formatCurrency(weg?.weg_gewinn)}`}
            </p>
            <p className="text-[10px] text-[#9EAFC0] mt-1">Einmaliger Wertzuwachs</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-xs text-[#5B7A9D] mb-1">AfA-Steuerersparnis</p>
            <p className="text-xl font-bold text-[#1E2A3A]">+{formatCurrency(steuerersparnis)}/Jahr</p>
            <p className="text-[10px] text-[#9EAFC0] mt-1">bei 42% Grenzsteuersatz</p>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span className="font-bold text-[#1E2A3A]">Gesamtpotenzial (jährlich wiederkehrend):</span>
          <span className="text-xl font-bold text-green-600">
            +{formatCurrency((miet?.potenzial_jahr || 0) + steuerersparnis)}/Jahr
          </span>
        </div>
      </div>

      {/* ===== SECTION 13: Handlungsempfehlung ===== */}
      <SectionBox number={13} title="Handlungsempfehlung">
        {/* Empfehlung Badge */}
        <div className="bg-[#EDF1F5] rounded-xl p-6 mb-4 text-center border border-[#D5DEE6]">
          <p className="text-xs text-[#5B7A9D] mb-1">Unsere Empfehlung</p>
          <p className="text-3xl font-bold text-[#1E2A3A]">{auswertung.empfehlung || '-'}</p>
        </div>

        {/* Begründung */}
        {auswertung.empfehlung_begruendung && (
          <div className="mb-4">
            <h4 className="text-sm font-bold text-[#1E2A3A] mb-2">Begründung</h4>
            <p className="text-sm text-[#1E2A3A] leading-relaxed">{auswertung.empfehlung_begruendung}</p>
          </div>
        )}

        {/* Handlungsschritte */}
        {auswertung.empfehlung_handlungsschritte &&
          (auswertung.empfehlung_handlungsschritte as Array<string | { schritt: string; zeitrahmen: string }>).length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-bold text-[#1E2A3A] mb-3">Empfohlene Handlungsschritte</h4>
            <div className="space-y-2">
              {(auswertung.empfehlung_handlungsschritte as Array<string | { schritt: string; zeitrahmen: string }>).map(
                (schritt, i) => {
                  const isObject = typeof schritt === 'object' && schritt !== null;
                  const text = isObject ? schritt.schritt : schritt;
                  const zeitrahmen = isObject ? schritt.zeitrahmen : null;
                  return (
                    <div key={i} className="flex items-start gap-3 bg-[#EDF1F5] rounded-lg p-3">
                      <span className="w-6 h-6 rounded-full bg-[#2A3F54] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="flex-1 text-sm text-[#1E2A3A]">{text}</span>
                      {zeitrahmen && (
                        <span className="text-xs text-green-600 font-semibold flex-shrink-0">{zeitrahmen}</span>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          </div>
        )}

        {/* Chancen & Risiken */}
        {(auswertung.empfehlung_chancen || auswertung.empfehlung_risiken) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {auswertung.empfehlung_chancen && (
              <div>
                <h4 className="text-sm font-bold text-green-700 mb-2">Chancen</h4>
                <ul className="space-y-2">
                  {(auswertung.empfehlung_chancen as string[]).map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#1E2A3A]">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {auswertung.empfehlung_risiken && (
              <div>
                <h4 className="text-sm font-bold text-amber-700 mb-2">Risiken</h4>
                <ul className="space-y-2">
                  {(auswertung.empfehlung_risiken as string[]).map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#1E2A3A]">
                      <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Fazit */}
        {auswertung.empfehlung_fazit && (
          <div className="bg-[#EDF1F5] rounded-lg p-4 border-l-4 border-[#2A3F54]">
            <h4 className="text-sm font-bold text-[#1E2A3A] mb-1">Fazit</h4>
            <p className="text-sm text-[#1E2A3A] leading-relaxed">{auswertung.empfehlung_fazit}</p>
          </div>
        )}
      </SectionBox>

      {/* ===== ERGÄNZENDE ERLÄUTERUNGEN ===== */}
      {erlaeuterungen && (
        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-[#D5DEE6] overflow-hidden shadow-sm">
          <div className="px-4 py-3 bg-[#EDF1F5]/80 border-b border-[#D5DEE6]">
            <h3 className="text-sm font-bold text-[#1E2A3A]">Ergänzende Erläuterungen</h3>
          </div>
          <div className="p-4 space-y-4 text-sm text-[#1E2A3A]">
            {erlaeuterungen.finanzierungsprofil && (
              <div>
                <h4 className="text-xs font-bold text-[#2A3F54] mb-1">Finanzierungsprofil</h4>
                <p className="text-xs leading-relaxed">{erlaeuterungen.finanzierungsprofil}</p>
              </div>
            )}
            {erlaeuterungen.ertragsprofil && (
              <div>
                <h4 className="text-xs font-bold text-[#2A3F54] mb-1">Ertragsprofil</h4>
                <p className="text-xs leading-relaxed">{erlaeuterungen.ertragsprofil}</p>
              </div>
            )}
            {erlaeuterungen.mietanalyse && (
              <div>
                <h4 className="text-xs font-bold text-[#2A3F54] mb-1">Mietanalyse</h4>
                <p className="text-xs leading-relaxed">{erlaeuterungen.mietanalyse}</p>
              </div>
            )}
            {erlaeuterungen.kostenstruktur && (
              <div>
                <h4 className="text-xs font-bold text-[#2A3F54] mb-1">Kostenstruktur</h4>
                <p className="text-xs leading-relaxed">{erlaeuterungen.kostenstruktur}</p>
              </div>
            )}
            {erlaeuterungen.cashflow && (
              <div>
                <h4 className="text-xs font-bold text-[#2A3F54] mb-1">Cashflow</h4>
                <p className="text-xs leading-relaxed">{erlaeuterungen.cashflow}</p>
              </div>
            )}
            {erlaeuterungen.roi && (
              <div>
                <h4 className="text-xs font-bold text-[#2A3F54] mb-1">Rendite</h4>
                <p className="text-xs leading-relaxed">{erlaeuterungen.roi}</p>
              </div>
            )}
            {erlaeuterungen.weg_potenzial && (
              <div>
                <h4 className="text-xs font-bold text-[#2A3F54] mb-1">WEG-Potenzial</h4>
                <p className="text-xs leading-relaxed">{erlaeuterungen.weg_potenzial}</p>
              </div>
            )}
            {erlaeuterungen.rnd_afa && (
              <div>
                <h4 className="text-xs font-bold text-[#2A3F54] mb-1">AfA & Steuervorteile</h4>
                <p className="text-xs leading-relaxed">{erlaeuterungen.rnd_afa}</p>
              </div>
            )}
            {erlaeuterungen.capex_559 && (
              <div>
                <h4 className="text-xs font-bold text-[#2A3F54] mb-1">CAPEX & §559</h4>
                <p className="text-xs leading-relaxed">{erlaeuterungen.capex_559}</p>
              </div>
            )}
            {erlaeuterungen.wertentwicklung && (
              <div>
                <h4 className="text-xs font-bold text-[#2A3F54] mb-1">Wertentwicklung</h4>
                <p className="text-xs leading-relaxed">{erlaeuterungen.wertentwicklung}</p>
              </div>
            )}
            {erlaeuterungen.exit && (
              <div>
                <h4 className="text-xs font-bold text-[#2A3F54] mb-1">Exit-Szenarien</h4>
                <p className="text-xs leading-relaxed">{erlaeuterungen.exit}</p>
              </div>
            )}
            {erlaeuterungen.handlungsempfehlung && (
              <div>
                <h4 className="text-xs font-bold text-[#2A3F54] mb-1">Handlungsempfehlung</h4>
                <p className="text-xs leading-relaxed">{erlaeuterungen.handlungsempfehlung}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== HAFTUNGSAUSSCHLUSS ===== */}
      <div className="bg-[#EDF1F5] rounded-xl p-5 border border-[#D5DEE6]">
        <h3 className="text-sm font-bold text-[#1E2A3A] mb-3">Haftungsausschluss</h3>
        <div className="text-xs text-[#4A6A8D] space-y-2 leading-relaxed">
          <p>
            Die vorliegende Analyse dient ausschließlich der Einschätzung des Optimierungspotenzials und
            stellt kein Gutachten im Sinne des geltenden deutschen Rechts dar. Sie basiert auf den Angaben
            des Mandanten sowie statistischen und öffentlich verfügbaren Marktdaten.
          </p>
          <p>
            Für etwaige Abweichungen von tatsächlich erzielten Kauf- und/oder Verkaufspreisen und/oder Mieten
            wird jedwede Haftung ausgeschlossen.
          </p>
          <p>
            Diese Analyse ersetzt keine Rechts-, Steuer- oder Finanzberatung. Vor wichtigen
            Investitionsentscheidungen empfehlen wir die Konsultation entsprechender Fachberater.
          </p>
        </div>
      </div>

      {/* Metadaten */}
      <p className="text-xs text-[#9EAFC0] text-center">
        Auswertung erstellt am {formatDate(auswertung.created_at)} · Imperoyal Immobilien | Vertraulich
      </p>
    </div>
  );
}
