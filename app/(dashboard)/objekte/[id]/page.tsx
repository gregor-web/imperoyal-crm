import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, StatCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '@/components/ui/table';
import { formatDate, formatCurrency, formatPercent, formatBoolean, formatArea } from '@/lib/formatters';
import { ArrowLeft, Edit, Banknote, Home, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { AuswertenButton } from '@/components/auswerten-button';
import { AnfrageButton } from '@/components/anfrage-button';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ObjektDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch objekt with mandant and einheiten
  const { data: objekt, error } = await supabase
    .from('objekte')
    .select(`
      *,
      mandanten (id, name),
      einheiten (*)
    `)
    .eq('id', id)
    .single();

  if (error || !objekt) {
    notFound();
  }

  // Check if user is admin and get mandant_id
  const { data: profile } = await supabase.from('profiles').select('role, mandant_id').single();
  const isAdmin = profile?.role === 'admin';

  // Check if there's an open anfrage for this object
  const { data: offeneAnfrage } = await supabase
    .from('anfragen')
    .select('id, status')
    .eq('objekt_id', id)
    .eq('status', 'offen')
    .single();

  // Check if an Auswertung already exists for this object
  const { data: bestehendeAuswertung } = await supabase
    .from('auswertungen')
    .select('id, created_at, empfehlung')
    .eq('objekt_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  // Calculate some basic stats
  const einheiten = objekt.einheiten || [];
  const totalMiete = einheiten.reduce((sum: number, e: { kaltmiete?: number }) => sum + (e.kaltmiete || 0), 0);
  const totalFlaeche = einheiten.reduce((sum: number, e: { flaeche?: number }) => sum + (e.flaeche || 0), 0);
  const rendite = objekt.kaufpreis > 0 ? (totalMiete * 12 / objekt.kaufpreis) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/objekte" className="p-2 hover:bg-slate-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">{objekt.strasse}</h1>
            <p className="text-sm sm:text-base text-slate-600">{objekt.plz} {objekt.ort}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center ml-11 sm:ml-0">
          {isAdmin ? (
            <AuswertenButton objektId={id} />
          ) : bestehendeAuswertung ? (
            <Link href={`/auswertungen/${bestehendeAuswertung.id}`}>
              <Button variant="primary">
                <CheckCircle className="w-4 h-4 mr-2" />
                Auswertung ansehen
              </Button>
            </Link>
          ) : offeneAnfrage ? (
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Anfrage ausstehend</span>
            </div>
          ) : (
            <AnfrageButton
              objektId={id}
              mandantId={(objekt.mandanten as { id: string })?.id || ''}
            />
          )}
          <Link href={`/objekte/${id}/edit`}>
            <Button variant="secondary">
              <Edit className="w-4 h-4 mr-2" />
              Bearbeiten
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Kaufpreis"
          value={formatCurrency(objekt.kaufpreis)}
          icon={<Banknote className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Einheiten"
          value={einheiten.length.toString()}
          subtitle={`${objekt.wohneinheiten || 0} Wohnen, ${objekt.gewerbeeinheiten || 0} Gewerbe`}
          icon={<Home className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          title="Monatsmiete (IST)"
          value={formatCurrency(totalMiete)}
          subtitle={`${formatCurrency(totalMiete * 12)} p.a.`}
          icon={<TrendingUp className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Rendite (IST)"
          value={formatPercent(rendite)}
          icon={<TrendingUp className="w-6 h-6" />}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Objektdaten */}
        <Card title="Objektdaten" className="lg:col-span-2">
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 text-sm">
            <div>
              <p className="text-slate-500">Gebäudetyp</p>
              <p className="font-medium">{objekt.gebaeudetyp || '-'}</p>
            </div>
            <div>
              <p className="text-slate-500">Baujahr</p>
              <p className="font-medium">{objekt.baujahr || '-'}</p>
            </div>
            <div>
              <p className="text-slate-500">Heizung</p>
              <p className="font-medium">{objekt.heizungsart || '-'}</p>
            </div>
            <div>
              <p className="text-slate-500">Wohnfläche</p>
              <p className="font-medium">{formatArea(objekt.wohnflaeche)}</p>
            </div>
            <div>
              <p className="text-slate-500">Gewerbefläche</p>
              <p className="font-medium">{formatArea(objekt.gewerbeflaeche)}</p>
            </div>
            <div>
              <p className="text-slate-500">Grundstück</p>
              <p className="font-medium">{formatArea(objekt.grundstueck)}</p>
            </div>
            <div>
              <p className="text-slate-500">Denkmalschutz</p>
              <p className="font-medium">{formatBoolean(objekt.denkmalschutz)}</p>
            </div>
            <div>
              <p className="text-slate-500">Aufzug</p>
              <p className="font-medium">{formatBoolean(objekt.aufzug)}</p>
            </div>
            <div>
              <p className="text-slate-500">WEG aufgeteilt</p>
              <p className="font-medium">{formatBoolean(objekt.weg_aufgeteilt)}</p>
            </div>
          </div>
        </Card>

        {/* Finanzierung */}
        <Card title="Finanzierung">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between gap-2">
              <span className="text-slate-500">Kaufpreis</span>
              <span className="font-medium flex-shrink-0">{formatCurrency(objekt.kaufpreis)}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-slate-500">Eigenkapital</span>
              <span className="font-medium flex-shrink-0">{formatPercent(objekt.eigenkapital_prozent)}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-slate-500">Zinssatz</span>
              <span className="font-medium flex-shrink-0">{formatPercent(objekt.zinssatz)}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-slate-500">Tilgung</span>
              <span className="font-medium flex-shrink-0">{formatPercent(objekt.tilgung)}</span>
            </div>
            {objekt.darlehensstand && (
              <div className="flex justify-between gap-2 pt-2 border-t">
                <span className="text-slate-500">Darlehensstand</span>
                <span className="font-medium flex-shrink-0">{formatCurrency(objekt.darlehensstand)}</span>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Einheiten */}
      <Card title={`Einheiten (${einheiten.length})`}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nr.</TableHead>
              <TableHead>Nutzung</TableHead>
              <TableHead>Fläche</TableHead>
              <TableHead>Kaltmiete</TableHead>
              <TableHead>€/m²</TableHead>
              <TableHead>Vertragsart</TableHead>
              <TableHead>Letzte Erhöhung</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {einheiten.length > 0 ? (
              einheiten.map((einheit: {
                id: string;
                position: number;
                nutzung: string;
                flaeche?: number;
                kaltmiete?: number;
                mietvertragsart: string;
                letzte_mieterhoehung?: string;
              }) => (
                <TableRow key={einheit.id}>
                  <TableCell>{einheit.position}</TableCell>
                  <TableCell>
                    <Badge variant={einheit.nutzung === 'Wohnen' ? 'info' : einheit.nutzung === 'Gewerbe' ? 'warning' : 'default'}>
                      {einheit.nutzung}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatArea(einheit.flaeche)}</TableCell>
                  <TableCell>{formatCurrency(einheit.kaltmiete)}</TableCell>
                  <TableCell>
                    {einheit.flaeche && einheit.kaltmiete
                      ? formatCurrency(einheit.kaltmiete / einheit.flaeche) + '/m²'
                      : '-'}
                  </TableCell>
                  <TableCell>{einheit.mietvertragsart}</TableCell>
                  <TableCell>{formatDate(einheit.letzte_mieterhoehung)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableEmpty message="Keine Einheiten vorhanden" colSpan={7} />
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Metadaten */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-sm text-slate-500">
        <span>
          Mandant: {(objekt.mandanten as { name: string })?.name || '-'}
        </span>
        <span>
          Erstellt am {formatDate(objekt.created_at)} | Aktualisiert {formatDate(objekt.updated_at)}
        </span>
      </div>
    </div>
  );
}
