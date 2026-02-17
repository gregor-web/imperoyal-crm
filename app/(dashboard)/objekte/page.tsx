import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/lib/formatters';
import { Plus, Building2, User } from 'lucide-react';
import { SearchFilterBar } from '@/components/ui/search-filter-bar';
import { Pagination } from '@/components/ui/pagination';

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

const PAGE_SIZE = 20;

interface PageProps {
  searchParams: Promise<{ q?: string; typ?: string; page?: string }>;
}

export default async function ObjektePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  // Check user role
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('role, mandant_id').eq('id', user!.id).single();
  const isAdmin = profile?.role === 'admin';

  const searchQuery = params.q?.trim() || '';
  const filterTyp = params.typ || '';
  const currentPage = Math.max(1, Number(params.page) || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  // Count total for pagination
  let countQuery = supabase
    .from('objekte')
    .select('*', { count: 'exact', head: true });

  if (searchQuery) {
    countQuery = countQuery.or(`strasse.ilike.%${searchQuery}%,ort.ilike.%${searchQuery}%,plz.ilike.%${searchQuery}%`);
  }
  if (filterTyp) {
    countQuery = countQuery.eq('gebaeudetyp', filterTyp);
  }

  const { count } = await countQuery;
  const totalItems = count || 0;

  // Fetch objekte (RLS handles filtering for mandanten)
  let query = supabase
    .from('objekte')
    .select(`
      *,
      mandanten (id, name)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (searchQuery) {
    query = query.or(`strasse.ilike.%${searchQuery}%,ort.ilike.%${searchQuery}%,plz.ilike.%${searchQuery}%`);
  }
  if (filterTyp) {
    query = query.eq('gebaeudetyp', filterTyp);
  }

  const { data: objekte } = await query;

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
  const totalMandanten = mandantIds.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#EDF1F5]">Objekte</h1>
          <p className="text-sm sm:text-base text-[#6B8AAD] mt-1">
            {isAdmin
              ? `${totalItems} Objekte von ${totalMandanten} Mandanten`
              : `${totalItems} Objekte`}
          </p>
        </div>
        <Link href="/objekte/neu" className="self-start sm:self-auto">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Neues Objekt
          </Button>
        </Link>
      </div>

      {/* Search & Filter */}
      <SearchFilterBar
        placeholder="Adresse oder Ort suchen..."
        filters={[
          {
            key: 'typ',
            label: 'Alle Gebäudetypen',
            options: [
              { value: 'Mehrfamilienhaus', label: 'Mehrfamilienhaus' },
              { value: 'Einfamilienhaus', label: 'Einfamilienhaus' },
              { value: 'Wohn- und Geschäftshaus', label: 'Wohn- und Geschäftshaus' },
              { value: 'Gewerbe', label: 'Gewerbe' },
              { value: 'Bürogebäude', label: 'Bürogebäude' },
            ],
          },
        ]}
      />

      {/* Grouped View for Admin */}
      {isAdmin ? (
        <div className="space-y-6">
          {mandantIds.length > 0 ? (
            mandantIds.map((mandantId) => {
              const group = groupedObjekte[mandantId];
              return (
                <Card key={mandantId} className="overflow-hidden">
                  {/* Mandant Header */}
                  <div className="px-4 sm:px-5 py-3.5 border-b border-white/[0.08] bg-[#162636]/60">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#7A9BBD]/15 rounded-xl flex items-center justify-center">
                          <User className="w-4 h-4 text-[#6B8AAD]" />
                        </div>
                        <div>
                          <Link
                            href={`/mandanten/${mandantId}`}
                            className="text-[15px] font-semibold text-[#EDF1F5] hover:text-[#7A9BBD] transition-colors"
                          >
                            {group.mandantName}
                          </Link>
                          <p className="text-[#7A9BBD] text-[12px]">
                            {group.objekte.length} {group.objekte.length === 1 ? 'Objekt' : 'Objekte'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 ml-11 sm:ml-0">
                        <Building2 className="w-4 h-4 text-[#6B8AAD] hidden sm:block" />
                        <span className="text-[#EDF1F5] font-semibold text-sm">
                          {formatCurrency(group.objekte.reduce((sum, o) => sum + (o.kaufpreis || 0), 0))}
                        </span>
                        <span className="text-[#7A9BBD] text-[12px]">Gesamtwert</span>
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
                              <p className="text-sm text-[#7A9BBD]">{objekt.plz} {objekt.ort}</p>
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
                              className="text-[#7A9BBD] hover:text-[#6B8AAD] text-sm font-medium"
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
            <Card className="p-6 sm:p-8 text-center text-[#7A9BBD]">
              {searchQuery || filterTyp ? 'Keine Objekte mit diesen Filtern gefunden' : 'Keine Objekte vorhanden'}
            </Card>
          )}
          <Pagination totalItems={totalItems} pageSize={PAGE_SIZE} />
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
                        <p className="text-sm text-[#7A9BBD]">{objekt.plz} {objekt.ort}</p>
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
                        className="text-[#7A9BBD] hover:text-[#6B8AAD] text-sm font-medium"
                      >
                        Details
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableEmpty message={searchQuery || filterTyp ? 'Keine Objekte mit diesen Filtern gefunden' : 'Keine Objekte vorhanden'} colSpan={6} />
              )}
            </TableBody>
          </Table>
          <Pagination totalItems={totalItems} pageSize={PAGE_SIZE} />
        </Card>
      )}
    </div>
  );
}
