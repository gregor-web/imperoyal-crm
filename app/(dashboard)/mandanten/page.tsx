import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
import { MandantenActions } from './mandanten-actions';
import { SearchFilterBar } from '@/components/ui/search-filter-bar';
import { MandantenView } from '@/components/mandanten/mandanten-view';

const PAGE_SIZE = 20;

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function MandantenPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  const searchQuery = params.q?.trim() || '';
  const currentPage = Math.max(1, Number(params.page) || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  // Count total for pagination
  let countQuery = supabase
    .from('mandanten')
    .select('*', { count: 'exact', head: true });

  if (searchQuery) {
    countQuery = countQuery.or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,ansprechpartner.ilike.%${searchQuery}%,ort.ilike.%${searchQuery}%`);
  }

  const { count } = await countQuery;
  const totalItems = count || 0;

  // Fetch mandanten with pagination
  let query = supabase
    .from('mandanten')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (searchQuery) {
    query = query.or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,ansprechpartner.ilike.%${searchQuery}%,ort.ilike.%${searchQuery}%`);
  }

  const { data: mandanten } = await query;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#EDF1F5] tracking-[-0.02em]">Mandanten</h1>
          <p className="text-sm sm:text-base text-[#6B8AAD] mt-1">
            {totalItems} Mandanten verwalten
          </p>
        </div>
        <div className="self-start sm:self-auto">
          <MandantenActions />
        </div>
      </div>

      {/* Search */}
      <SearchFilterBar placeholder="Mandanten suchen (Name, E-Mail, Ort...)" />

      {/* Grid/List View */}
      <MandantenView
        mandanten={(mandanten as never[]) || []}
        totalItems={totalItems}
        searchQuery={searchQuery}
      />
    </div>
  );
}
