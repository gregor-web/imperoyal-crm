import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '@/components/ui/table';
import { formatDate } from '@/lib/formatters';
import { MandantenActions } from './mandanten-actions';

export default async function MandantenPage() {
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

  // Fetch mandanten
  const { data: mandanten } = await supabase
    .from('mandanten')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Mandanten</h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">Verwalten Sie Ihre Mandanten</p>
        </div>
        <div className="self-start sm:self-auto">
          <MandantenActions />
        </div>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Firma</TableHead>
              <TableHead>Ansprechpartner</TableHead>
              <TableHead>E-Mail</TableHead>
              <TableHead>Ort</TableHead>
              <TableHead>Erstellt</TableHead>
              <TableHead className="w-20">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mandanten && mandanten.length > 0 ? (
              mandanten.map((mandant) => (
                <TableRow key={mandant.id}>
                  <TableCell className="font-medium">{mandant.name}</TableCell>
                  <TableCell>{mandant.ansprechpartner || '-'}</TableCell>
                  <TableCell>{mandant.email}</TableCell>
                  <TableCell>{mandant.ort || '-'}</TableCell>
                  <TableCell>{formatDate(mandant.created_at)}</TableCell>
                  <TableCell>
                    <Link
                      href={`/mandanten/${mandant.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Details
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableEmpty message="Keine Mandanten vorhanden" colSpan={6} />
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
