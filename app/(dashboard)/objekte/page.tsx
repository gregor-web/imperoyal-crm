import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/lib/formatters';
import { Plus, Building2, User } from 'lucide-react';

interface Objekt {
  id: string;
  strasse: string;
  plz: string;
  ort: string;
  gebaeudetyp: string | null;
  kaufpreis: number;
  wohneinheiten: number | null;
  gewerbeeinheiten: number | null;
  created_at: string;
  mandant_id: string;
  mandanten: { id: string; name: string } | null;
}

interface GroupedObjekte {
  [mandantId: string]: {
    mandantName: string;
    objekte: Objekt[];
  };
}

export default async function ObjektePage() {
  const supabase = await createClient();

  // Check user role
  const { data: profile } = await supabase.from('profiles').select('role, mandant_id').single();
  const isAdmin = profile?.role === 'admin';

  // Fetch objekte (RLS handles filtering for mandanten)
  const { data: objekte } = await supabase
    .from('objekte')
    .select(`
      *,
      mandanten (id, name)
    `)
    .order('created_at', { ascending: false });

  // Group objekte by mandant for admin view
  const groupedObjekte: GroupedObjekte = {};
  if (objekte) {
    objekte.forEach((objekt) => {
      const mandantId = objekt.mandant_id;
      const mandantName = (objekt.mandanten as { id: string; name: string })?.name || 'Unbekannt';

      if (!groupedObjekte[mandantId]) {
        groupedObjekte[mandantId] = {
          mandantName,
          objekte: [],
        };
      }
      groupedObjekte[mandantId].objekte.push(objekt as Objekt);
    });
  }

  const mandantIds = Object.keys(groupedObjekte);
  const totalObjekte = objekte?.length || 0;
  const totalMandanten = mandantIds.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E2A3A]">Objekte</h1>
          <p className="text-[#4A6A8D] mt-1">
            {isAdmin
              ? `${totalObjekte} Objekte von ${totalMandanten} Mandanten`
              : 'Ihre Immobilien'}
          </p>
        </div>
        <Link href="/objekte/neu">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Neues Objekt
          </Button>
        </Link>
      </div>

      {/* Grouped View for Admin */}
      {isAdmin ? (
        <div className="space-y-6">
          {mandantIds.length > 0 ? (
            mandantIds.map((mandantId) => {
              const group = groupedObjekte[mandantId];
              return (
                <Card key={mandantId} className="overflow-hidden">
                  {/* Mandant Header */}
                  <div className="bg-gradient-to-r from-[#1E2A3A] to-[#2A3F54] px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-white/10 p-2 rounded-lg">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <Link
                            href={`/mandanten/${mandantId}`}
                            className="text-lg font-semibold text-white hover:text-[#D5DEE6] transition-colors"
                          >
                            {group.mandantName}
                          </Link>
                          <p className="text-[#B8C5D1] text-sm">
                            {group.objekte.length} {group.objekte.length === 1 ? 'Objekt' : 'Objekte'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-[#9EAFC0]" />
                        <span className="text-white font-medium">
                          {formatCurrency(group.objekte.reduce((sum, o) => sum + (o.kaufpreis || 0), 0))}
                        </span>
                        <span className="text-[#9EAFC0] text-sm">Gesamtwert</span>
                      </div>
                    </div>
                  </div>

                  {/* Objekte Table */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Adresse</TableHead>
                        <TableHead>Typ</TableHead>
                        <TableHead>Kaufpreis</TableHead>
                        <TableHead>Einheiten</TableHead>
                        <TableHead>Erstellt</TableHead>
                        <TableHead className="w-24">Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.objekte.map((objekt) => (
                        <TableRow key={objekt.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{objekt.strasse}</p>
                              <p className="text-sm text-[#5B7A9D]">{objekt.plz} {objekt.ort}</p>
                            </div>
                          </TableCell>
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
                              className="text-[#5B7A9D] hover:text-[#4A6A8D] text-sm font-medium"
                            >
                              Details
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              );
            })
          ) : (
            <Card className="p-8 text-center text-[#5B7A9D]">
              Keine Objekte vorhanden
            </Card>
          )}
        </div>
      ) : (
        /* Simple Table for Mandant View */
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Adresse</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Kaufpreis</TableHead>
                <TableHead>Einheiten</TableHead>
                <TableHead>Erstellt</TableHead>
                <TableHead className="w-24">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {objekte && objekte.length > 0 ? (
                objekte.map((objekt) => (
                  <TableRow key={objekt.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{objekt.strasse}</p>
                        <p className="text-sm text-[#5B7A9D]">{objekt.plz} {objekt.ort}</p>
                      </div>
                    </TableCell>
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
                        className="text-[#5B7A9D] hover:text-[#4A6A8D] text-sm font-medium"
                      >
                        Details
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableEmpty message="Keine Objekte vorhanden" colSpan={6} />
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
