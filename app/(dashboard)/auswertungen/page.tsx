import { createClient } from '@/lib/supabase/server';
import { SearchFilterBar } from '@/components/ui/search-filter-bar';

export const dynamic = 'force-dynamic';
import { AuswertungenView } from '@/components/auswertungen/auswertungen-view';

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
        <h1 className="text-xl sm:text-2xl font-bold text-[#EDF1F5]">Auswertungen</h1>
        <p className="text-sm sm:text-base text-[#6B8AAD] mt-1">
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

      {/* Grid/List View */}
      <AuswertungenView
        auswertungen={(filtered as never[]) || []}
        totalItems={totalItems}
        searchQuery={searchQuery}
        filterEmpfehlung={filterEmpfehlung}
        filterStatus={filterStatus}
        isAdmin={isAdmin}
      />
    </div>
  );
}
