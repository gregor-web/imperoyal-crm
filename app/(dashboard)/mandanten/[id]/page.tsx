import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '@/components/ui/table';
import { formatDate, formatCurrency, formatAddress } from '@/lib/formatters';
import { ArrowLeft, Edit, Building2, Mail, Phone, MapPin } from 'lucide-react';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function MandantDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  // Check if admin
  const { data: profile } = await supabase.from('profiles').select('role').single();
  if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  // Fetch mandant
  const { data: mandant, error } = await supabase
    .from('mandanten')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !mandant) {
    notFound();
  }

  // Fetch objekte for this mandant
  const { data: objekte } = await supabase
    .from('objekte')
    .select('id, strasse, plz, ort, kaufpreis, gebaeudetyp, created_at')
    .eq('mandant_id', id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/mandanten" className="p-2 hover:bg-slate-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{mandant.name}</h1>
            <p className="text-slate-600">{mandant.ansprechpartner || 'Kein Ansprechpartner'}</p>
          </div>
        </div>
        <Link href={`/mandanten/${id}/edit`}>
          <Button variant="secondary">
            <Edit className="w-4 h-4 mr-2" />
            Bearbeiten
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kontaktdaten */}
        <Card title="Kontaktdaten" className="lg:col-span-1">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm text-slate-500">E-Mail</p>
                <a href={`mailto:${mandant.email}`} className="text-blue-600 hover:underline">
                  {mandant.email}
                </a>
              </div>
            </div>

            {mandant.telefon && (
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">Telefon</p>
                  <a href={`tel:${mandant.telefon}`} className="text-slate-800">
                    {mandant.telefon}
                  </a>
                </div>
              </div>
            )}

            {(mandant.strasse || mandant.ort) && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">Adresse</p>
                  <p className="text-slate-800">
                    {formatAddress(mandant.strasse, mandant.plz, mandant.ort)}
                  </p>
                  {mandant.land && mandant.land !== 'Deutschland' && (
                    <p className="text-slate-600">{mandant.land}</p>
                  )}
                </div>
              </div>
            )}

            {mandant.kontaktart && (
              <div className="pt-2 border-t border-slate-100">
                <p className="text-sm text-slate-500">Bevorzugte Kontaktart</p>
                <Badge variant="info">{mandant.kontaktart}</Badge>
              </div>
            )}

            {mandant.position && (
              <div>
                <p className="text-sm text-slate-500">Position</p>
                <p className="text-slate-800">{mandant.position}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Objekte */}
        <Card
          title="Objekte"
          subtitle={`${objekte?.length || 0} Objekte`}
          className="lg:col-span-2"
          actions={
            <Link href={`/objekte/neu?mandant=${id}`}>
              <Button size="sm">+ Objekt</Button>
            </Link>
          }
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Adresse</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Kaufpreis</TableHead>
                <TableHead>Erstellt</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {objekte && objekte.length > 0 ? (
                objekte.map((objekt) => (
                  <TableRow key={objekt.id}>
                    <TableCell className="font-medium">
                      {objekt.strasse}, {objekt.plz} {objekt.ort}
                    </TableCell>
                    <TableCell>{objekt.gebaeudetyp || '-'}</TableCell>
                    <TableCell>{formatCurrency(objekt.kaufpreis)}</TableCell>
                    <TableCell>{formatDate(objekt.created_at)}</TableCell>
                    <TableCell>
                      <Link
                        href={`/objekte/${objekt.id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        Details
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableEmpty message="Keine Objekte vorhanden" colSpan={5} />
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Metadaten */}
      <div className="text-sm text-slate-500">
        Erstellt am {formatDate(mandant.created_at)} | Zuletzt aktualisiert am {formatDate(mandant.updated_at)}
      </div>
    </div>
  );
}
