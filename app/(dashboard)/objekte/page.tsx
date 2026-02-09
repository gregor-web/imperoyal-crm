import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/lib/formatters';
import { Plus, Building2 } from 'lucide-react';

export default async function ObjektePage() {
  const supabase = await createClient();

  // Check user role
  const { data: profile } = await supabase.from('profiles').select('role, mandant_id').single();
  const isAdmin = profile?.role === 'admin';

  // Fetch objekte (RLS handles filtering for mandanten)
  const { data: objekte, error } = await supabase
    .from('objekte')
    .select(`
      *,
      mandanten (name)
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Objekte</h1>
          <p className="text-slate-600 mt-1">
            {isAdmin ? 'Alle Immobilien im System' : 'Ihre Immobilien'}
          </p>
        </div>
        <Link href="/objekte/neu">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Neues Objekt
          </Button>
        </Link>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Adresse</TableHead>
              {isAdmin && <TableHead>Mandant</TableHead>}
              <TableHead>Typ</TableHead>
              <TableHead>Kaufpreis</TableHead>
              <TableHead>Einheiten</TableHead>
              <TableHead>Erstellt</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {objekte && objekte.length > 0 ? (
              objekte.map((objekt) => (
                <TableRow key={objekt.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{objekt.strasse}</p>
                      <p className="text-sm text-slate-500">{objekt.plz} {objekt.ort}</p>
                    </div>
                  </TableCell>
                  {isAdmin && (
                    <TableCell>{(objekt.mandanten as { name: string })?.name || '-'}</TableCell>
                  )}
                  <TableCell>
                    {objekt.gebaeudetyp && <Badge>{objekt.gebaeudetyp}</Badge>}
                  </TableCell>
                  <TableCell>{formatCurrency(objekt.kaufpreis)}</TableCell>
                  <TableCell>
                    {(objekt.wohneinheiten || 0) + (objekt.gewerbeeinheiten || 0)} Einheiten
                  </TableCell>
                  <TableCell>{formatDate(objekt.created_at)}</TableCell>
                  <TableCell>
                    <Link
                      href={`/objekte/${objekt.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Details
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableEmpty message="Keine Objekte vorhanden" colSpan={isAdmin ? 7 : 6} />
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
