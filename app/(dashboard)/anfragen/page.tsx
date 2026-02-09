import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/lib/formatters';
import { Eye, FileText, CheckCircle, Clock } from 'lucide-react';

export default async function AnfragenPage() {
  const supabase = await createClient();

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .single();

  if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  // Fetch all anfragen with objekt and mandant data
  const { data: anfragen, error } = await supabase
    .from('anfragen')
    .select(`
      *,
      objekte (id, strasse, plz, ort, kaufpreis),
      mandanten (name)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching anfragen:', error);
  }

  const offeneAnfragen = anfragen?.filter((a) => a.status === 'offen') || [];
  const bearbeiteteAnfragen = anfragen?.filter((a) => a.status === 'bearbeitet') || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Auswertungsanfragen</h1>
        <p className="text-slate-600 mt-1">
          Anfragen von Mandanten zur Objektauswertung
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Offene Anfragen</p>
              <p className="text-2xl font-bold text-slate-800">{offeneAnfragen.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Bearbeitet</p>
              <p className="text-2xl font-bold text-slate-800">{bearbeiteteAnfragen.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Offene Anfragen */}
      <Card title="Offene Anfragen">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Objekt</TableHead>
              <TableHead>Mandant</TableHead>
              <TableHead>Kaufpreis</TableHead>
              <TableHead>Angefragt am</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offeneAnfragen.length > 0 ? (
              offeneAnfragen.map((anfrage) => {
                const objekt = anfrage.objekte as { id: string; strasse: string; plz: string; ort: string; kaufpreis: number } | null;
                const mandant = anfrage.mandanten as { name: string } | null;

                return (
                  <TableRow key={anfrage.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{objekt?.strasse}</p>
                        <p className="text-sm text-slate-500">{objekt?.plz} {objekt?.ort}</p>
                      </div>
                    </TableCell>
                    <TableCell>{mandant?.name || '-'}</TableCell>
                    <TableCell>{formatCurrency(objekt?.kaufpreis)}</TableCell>
                    <TableCell>{formatDate(anfrage.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Link href={`/objekte/${objekt?.id}`}>
                          <Button variant="secondary" className="p-2">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link href={`/objekte/${objekt?.id}?auswerten=true`}>
                          <Button className="p-2">
                            <FileText className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableEmpty colSpan={5} message="Keine offenen Anfragen vorhanden." />
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Bearbeitete Anfragen */}
      {bearbeiteteAnfragen.length > 0 && (
        <Card title="Bearbeitete Anfragen">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Objekt</TableHead>
                <TableHead>Mandant</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Angefragt am</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bearbeiteteAnfragen.map((anfrage) => {
                const objekt = anfrage.objekte as { id: string; strasse: string; plz: string; ort: string } | null;
                const mandant = anfrage.mandanten as { name: string } | null;

                return (
                  <TableRow key={anfrage.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{objekt?.strasse}</p>
                        <p className="text-sm text-slate-500">{objekt?.plz} {objekt?.ort}</p>
                      </div>
                    </TableCell>
                    <TableCell>{mandant?.name || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="success">Bearbeitet</Badge>
                    </TableCell>
                    <TableCell>{formatDate(anfrage.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Link href={`/objekte/${objekt?.id}`}>
                          <Button variant="secondary" className="p-2">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
