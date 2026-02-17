import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { SearchFilterBar } from '@/components/ui/search-filter-bar';
import { ObjekteView } from '@/components/objekte/objekte-view';

interface GroupedObjekte {
  [mandantId: string]: { mandantName: string; objekte: Record<string, unknown>[] };
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
              { value: 'MFH', label: 'MFH' },
              { value: 'Wohn- & Geschäftshaus', label: 'Wohn- & Geschäftshaus' },
              { value: 'Büro', label: 'Büro' },
              { value: 'Retail', label: 'Retail' },
              { value: 'Logistik', label: 'Logistik' },
              { value: 'Spezialimmobilie', label: 'Spezialimmobilie' },
            ],
          },
        ]}
      />

      {/* Grid/List View with Toggle */}
      <ObjekteView
        objekte={(objekte as never[]) || []}
        groupedObjekte={groupedObjekte as never}
        mandantIds={mandantIds}
        isAdmin={isAdmin}
        totalItems={totalItems}
        searchQuery={searchQuery}
        filterTyp={filterTyp}
      />
    </div>
  );
}
