import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '@/components/ui/table';
import { EmpfehlungBadge, StatusBadge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/lib/formatters';

export default async function AuswertungenPage() {
  const supabase = await createClient();

  // Check user role
  const { data: profile } = await supabase.from('profiles').select('role').single();
  const isAdmin = profile?.role === 'admin';

  // Fetch auswertungen with objekt data
  const { data: auswertungen } = await supabase
    .from('auswertungen')
    .select(`
      *,
      objekte (strasse, plz, ort, kaufpreis),
      mandanten (name)
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Auswertungen</h1>
        <p className="text-slate-600 mt-1">
          {isAdmin ? 'Alle Analysen im System' : 'Ihre Immobilien-Analysen'}
        </p>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Objekt</TableHead>
              {isAdmin && <TableHead>Mandant</TableHead>}
              <TableHead>Kaufpreis</TableHead>
              <TableHead>Empfehlung</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Erstellt</TableHead>
              <TableHead className="w-24">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auswertungen && auswertungen.length > 0 ? (
              auswertungen.map((auswertung) => {
                const objekt = auswertung.objekte as { strasse: string; plz: string; ort: string; kaufpreis: number } | null;
                const mandant = auswertung.mandanten as { name: string } | null;

                return (
                  <TableRow key={auswertung.id}>
                    <TableCell>
                      {objekt ? (
                        <div>
                          <p className="font-medium">{objekt.strasse}</p>
                          <p className="text-sm text-slate-500">{objekt.plz} {objekt.ort}</p>
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    {isAdmin && <TableCell>{mandant?.name || '-'}</TableCell>}
                    <TableCell>{objekt ? formatCurrency(objekt.kaufpreis) : '-'}</TableCell>
                    <TableCell>
                      {auswertung.empfehlung ? (
                        <EmpfehlungBadge empfehlung={auswertung.empfehlung} />
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={auswertung.status} />
                    </TableCell>
                    <TableCell>{formatDate(auswertung.created_at)}</TableCell>
                    <TableCell>
                      <Link
                        href={`/auswertungen/${auswertung.id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Ansehen
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableEmpty
                message="Keine Auswertungen vorhanden"
                colSpan={isAdmin ? 7 : 6}
              />
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
