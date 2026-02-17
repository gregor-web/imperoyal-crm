import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '@/components/ui/table';
import { EmpfehlungBadge, StatusBadge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/lib/formatters';
import { SearchFilterBar } from '@/components/ui/search-filter-bar';
import { Pagination } from '@/components/ui/pagination';

const PAGE_SIZE = 20;

interface PageProps {
  searchParams: Promise<{ q?: string; empfehlung?: string; status?: string; page?: string }>;
}

export default async function AuswertungenPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  // Check user role
  const { data: profile } = user
    ? await supabase.from('profiles').select('role').eq('id', user.id).single()
    : { data: null };
  const isAdmin = profile?.role === 'admin';

  const searchQuery = params.q?.trim() || '';
  const filterEmpfehlung = params.empfehlung || '';
  const filterStatus = params.status || '';
  const currentPage = Math.max(1, Number(params.page) || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  // Build base query
  let countQuery = supabase
    .from('auswertungen')
    .select('*, objekte!inner(strasse, plz, ort, kaufpreis), mandanten!inner(name)', { count: 'exact', head: true });

  let dataQuery = supabase
    .from('auswertungen')
    .select('*, objekte(strasse, plz, ort, kaufpreis), mandanten(name)')
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  // Apply filters
  if (filterEmpfehlung) {
    countQuery = countQuery.eq('empfehlung', filterEmpfehlung);
    dataQuery = dataQuery.eq('empfehlung', filterEmpfehlung);
  }
  if (filterStatus) {
    countQuery = countQuery.eq('status', filterStatus);
    dataQuery = dataQuery.eq('status', filterStatus);
  }

  const { count } = await countQuery;
  const totalItems = count || 0;

  const { data: auswertungen } = await dataQuery;

  // Client-side text filter (Supabase can't ilike on joined fields easily)
  const filtered = searchQuery
    ? auswertungen?.filter((a) => {
        const objekt = a.objekte as { strasse: string; plz: string; ort: string } | null;
        const mandant = a.mandanten as { name: string } | null;
        const q = searchQuery.toLowerCase();
        return (
          objekt?.strasse?.toLowerCase().includes(q) ||
          objekt?.ort?.toLowerCase().includes(q) ||
          objekt?.plz?.includes(q) ||
          mandant?.name?.toLowerCase().includes(q)
        );
      })
    : auswertungen;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#1E2A3A]">Auswertungen</h1>
        <p className="text-sm sm:text-base text-[#4A6A8D] mt-1">
          {isAdmin ? `${totalItems} Analysen im System` : 'Ihre Immobilien-Analysen'}
        </p>
      </div>

      {/* Search & Filter */}
      <SearchFilterBar
        placeholder="Objekt oder Mandant suchen..."
        filters={[
          {
            key: 'empfehlung',
            label: 'Alle Empfehlungen',
            options: [
              { value: 'HALTEN', label: 'Halten' },
              { value: 'OPTIMIEREN', label: 'Optimieren' },
              { value: 'RESTRUKTURIEREN', label: 'Restrukturieren' },
              { value: 'VERKAUFEN', label: 'Verkaufen' },
            ],
          },
          {
            key: 'status',
            label: 'Alle Status',
            options: [
              { value: 'erstellt', label: 'Eingereicht' },
              { value: 'abgeschlossen', label: 'Abgeschlossen' },
            ],
          },
        ]}
      />

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
            {filtered && filtered.length > 0 ? (
              filtered.map((auswertung) => {
                const objekt = auswertung.objekte as { strasse: string; plz: string; ort: string; kaufpreis: number } | null;
                const mandant = auswertung.mandanten as { name: string } | null;

                return (
                  <TableRow key={auswertung.id}>
                    <TableCell>
                      {objekt ? (
                        <div>
                          <p className="font-medium">{objekt.strasse}</p>
                          <p className="text-sm text-[#5B7A9D]">{objekt.plz} {objekt.ort}</p>
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
                        className="text-[#5B7A9D] hover:text-[#4A6A8D] text-sm font-medium"
                      >
                        Ansehen
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableEmpty
                message={searchQuery || filterEmpfehlung || filterStatus ? 'Keine Auswertungen mit diesen Filtern gefunden' : 'Keine Auswertungen vorhanden'}
                colSpan={isAdmin ? 7 : 6}
              />
            )}
          </TableBody>
        </Table>
        <Pagination totalItems={totalItems} pageSize={PAGE_SIZE} />
      </Card>
    </div>
  );
}
