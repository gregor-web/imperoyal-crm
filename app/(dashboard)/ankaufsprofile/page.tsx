import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/formatters';
import { Plus, Eye } from 'lucide-react';

export default async function AnkaufsprofilePage() {
  const supabase = await createClient();

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, mandant_id')
    .single();

  const isAdmin = profile?.role === 'admin';

  // Fetch ankaufsprofile with mandant names
  let query = supabase
    .from('ankaufsprofile')
    .select(`
      *,
      mandanten (name)
    `)
    .order('created_at', { ascending: false });

  // Non-admin users only see their own profiles
  if (!isAdmin && profile?.mandant_id) {
    query = query.eq('mandant_id', profile.mandant_id);
  }

  const { data: profile_list, error } = await query;

  if (error) {
    console.error('Error fetching ankaufsprofile:', error);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Ankaufsprofile</h1>
          <p className="text-slate-600 mt-1">
            {isAdmin ? 'Alle Ankaufsprofile im System' : 'Ihre Ankaufsprofile'}
          </p>
        </div>
        <Link href="/ankaufsprofile/neu">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Neues Profil
          </Button>
        </Link>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              {isAdmin && <TableHead>Mandant</TableHead>}
              <TableHead>Volumen</TableHead>
              <TableHead>Assetklassen</TableHead>
              <TableHead>Min. Rendite</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profile_list && profile_list.length > 0 ? (
              profile_list.map((profil) => {
                const mandant = profil.mandanten as { name: string } | null;
                const assetklassen = profil.assetklassen as string[] | null;

                return (
                  <TableRow key={profil.id}>
                    <TableCell className="font-medium">{profil.name}</TableCell>
                    {isAdmin && (
                      <TableCell>{mandant?.name || '-'}</TableCell>
                    )}
                    <TableCell>
                      {formatCurrency(profil.min_volumen)} - {formatCurrency(profil.max_volumen)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {assetklassen?.slice(0, 3).map((klasse) => (
                          <Badge key={klasse} variant="info">
                            {klasse}
                          </Badge>
                        ))}
                        {assetklassen && assetklassen.length > 3 && (
                          <Badge variant="default">+{assetklassen.length - 3}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {profil.rendite_min ? `${profil.rendite_min}%` : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Link href={`/ankaufsprofile/${profil.id}`}>
                          <Button variant="secondary" className="p-2">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableEmpty colSpan={isAdmin ? 6 : 5} message="Keine Ankaufsprofile vorhanden. Klicken Sie auf 'Neues Profil' um eines zu erstellen." />
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
