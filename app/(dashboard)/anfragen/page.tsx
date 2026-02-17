import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/lib/formatters';
import { Eye, CheckCircle, Clock, Heart, Phone, Mail, CreditCard } from 'lucide-react';
import { StartAnalyseButton } from '@/components/anfragen/start-analyse-button';

export default async function AnfragenPage() {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  // Fetch all anfragen with objekt and mandant data
  const { data: anfragen, error } = await supabase
    .from('anfragen')
    .select(`
      *,
      objekte (id, strasse, plz, ort, kaufpreis),
      mandanten (name)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching anfragen:', error);
  }

  // Fetch interessen (buyer interests) using admin client to bypass RLS
  const adminSupabase = createAdminClient();
  const { data: interessen, error: interessenError } = await adminSupabase
    .from('interessen')
    .select(`
      *,
      objekt:objekte(id, strasse, plz, ort, kaufpreis, gebaeudetyp),
      kaeufer:mandanten!kaeufer_mandant_id(id, name, email, ansprechpartner, telefon),
      ankaufsprofil:ankaufsprofile(id, name)
    `)
    .order('created_at', { ascending: false });

  if (interessenError) {
    console.error('Error fetching interessen:', interessenError);
  }

  const offeneAnfragen = anfragen?.filter((a) => a.status === 'offen' && a.payment_status !== 'paid') || [];
  const bezahlteAnfragen = anfragen?.filter((a) => a.status === 'bezahlt' || (a.status === 'offen' && a.payment_status === 'paid')) || [];
  // Versendet = komplett erledigt, wird nicht mehr angezeigt
  const fertigeAnfragen = anfragen?.filter((a) => a.status === 'fertig' || a.status === 'in_bearbeitung' || a.status === 'versendet') || [];
  const neueInteressen = interessen?.filter((i) => i.status === 'neu') || [];
  const bearbeiteteInteressen = interessen?.filter((i) => i.status !== 'neu') || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#EDF1F5] tracking-[-0.02em]">Auswertungsanfragen</h1>
        <p className="text-sm sm:text-base text-[#6B8AAD] mt-1">
          Anfragen von Mandanten zur Objektauswertung
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-[#FF9500]/15 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-[#FF9500]" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#7A9BBD] uppercase tracking-[0.05em]">Unbezahlt</p>
              <p className="text-2xl font-bold text-[#EDF1F5] tracking-[-0.02em]">{offeneAnfragen.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-[#34C759]/15 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-[#34C759]" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#7A9BBD] uppercase tracking-[0.05em]">Bezahlt & bereit</p>
              <p className="text-2xl font-bold text-[#EDF1F5] tracking-[-0.02em]">{bezahlteAnfragen.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-[#7A9BBD]/15 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-[#6B8AAD]" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#7A9BBD] uppercase tracking-[0.05em]">Kaufinteressen</p>
              <p className="text-2xl font-bold text-[#EDF1F5] tracking-[-0.02em]">{neueInteressen.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-[#34C759]/15 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-[#34C759]" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#7A9BBD] uppercase tracking-[0.05em]">Fertig</p>
              <p className="text-2xl font-bold text-[#EDF1F5] tracking-[-0.02em]">{fertigeAnfragen.length + bearbeiteteInteressen.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Bezahlte Anfragen – bereit zur Auswertung */}
      <Card title="Bezahlte Anfragen – bereit zur Auswertung">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Objekt</TableHead>
              <TableHead>Mandant</TableHead>
              <TableHead>Kaufpreis</TableHead>
              <TableHead>Bezahlt</TableHead>
              <TableHead>Betrag</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bezahlteAnfragen.length > 0 ? (
              bezahlteAnfragen.map((anfrage) => {
                const objekt = anfrage.objekte as { id: string; strasse: string; plz: string; ort: string; kaufpreis: number } | null;
                const mandant = anfrage.mandanten as { name: string } | null;

                return (
                  <TableRow key={anfrage.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{objekt?.strasse}</p>
                        <p className="text-sm text-[#7A9BBD]">{objekt?.plz} {objekt?.ort}</p>
                      </div>
                    </TableCell>
                    <TableCell>{mandant?.name || '-'}</TableCell>
                    <TableCell>{formatCurrency(objekt?.kaufpreis)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-[#34C759]" />
                        <span className="text-sm text-[#34C759]">{formatDate(anfrage.paid_at)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {anfrage.amount_cents ? formatCurrency(anfrage.amount_cents / 100) : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Link href={`/objekte/${objekt?.id}`}>
                          <Button variant="secondary" className="p-2" title="Objekt ansehen">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        {objekt?.id && (
                          <StartAnalyseButton
                            objektId={objekt.id}
                            anfrageId={anfrage.id}
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableEmpty colSpan={6} message="Keine bezahlten Anfragen vorhanden." />
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Offene/Unbezahlte Anfragen */}
      {offeneAnfragen.length > 0 && (
      <Card title="Unbezahlte Anfragen">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Objekt</TableHead>
              <TableHead>Mandant</TableHead>
              <TableHead>Kaufpreis</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Angefragt am</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
              {offeneAnfragen.map((anfrage) => {
                const objekt = anfrage.objekte as { id: string; strasse: string; plz: string; ort: string; kaufpreis: number } | null;
                const mandant = anfrage.mandanten as { name: string } | null;

                return (
                  <TableRow key={anfrage.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{objekt?.strasse}</p>
                        <p className="text-sm text-[#7A9BBD]">{objekt?.plz} {objekt?.ort}</p>
                      </div>
                    </TableCell>
                    <TableCell>{mandant?.name || '-'}</TableCell>
                    <TableCell>{formatCurrency(objekt?.kaufpreis)}</TableCell>
                    <TableCell>
                      <Badge variant="warning">Zahlung ausstehend</Badge>
                    </TableCell>
                    <TableCell>{formatDate(anfrage.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Link href={`/objekte/${objekt?.id}`}>
                          <Button variant="secondary" className="p-2" title="Objekt ansehen">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </Card>
      )}

      {/* Neue Kaufinteressen */}
      {neueInteressen.length > 0 && (
        <Card title="Neue Kaufinteressen">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Käufer</TableHead>
                <TableHead>Objekt</TableHead>
                <TableHead>Kaufpreis</TableHead>
                <TableHead>Kontakt</TableHead>
                <TableHead>Eingegangen</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {neueInteressen.map((interesse) => {
                const objekt = interesse.objekt as { id: string; strasse: string; plz: string; ort: string; kaufpreis: number } | null;
                const kaeufer = interesse.kaeufer as { id: string; name: string; email: string; ansprechpartner: string; telefon: string } | null;
                const ankaufsprofil = interesse.ankaufsprofil as { id: string; name: string } | null;

                return (
                  <TableRow key={interesse.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{kaeufer?.ansprechpartner || kaeufer?.name}</p>
                        <p className="text-sm text-[#7A9BBD]">{kaeufer?.name}</p>
                        {ankaufsprofil && (
                          <p className="text-xs text-[#7A9BBD]">Profil: {ankaufsprofil.name}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{objekt?.strasse}</p>
                        <p className="text-sm text-[#7A9BBD]">{objekt?.plz} {objekt?.ort}</p>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(objekt?.kaufpreis)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {kaeufer?.email && (
                          <a href={`mailto:${kaeufer.email}`} className="flex items-center gap-1 text-sm text-[#7A9BBD] hover:underline">
                            <Mail className="w-3 h-3" />
                            {kaeufer.email}
                          </a>
                        )}
                        {kaeufer?.telefon && (
                          <a href={`tel:${kaeufer.telefon}`} className="flex items-center gap-1 text-sm text-[#6B8AAD]">
                            <Phone className="w-3 h-3" />
                            {kaeufer.telefon}
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(interesse.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Link href={`/objekte/${objekt?.id}`}>
                          <Button variant="secondary" className="p-2">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link href={`/mandanten/${kaeufer?.id}`}>
                          <Button variant="secondary" className="p-2">
                            <Heart className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Fertige Anfragen */}
      {fertigeAnfragen.length > 0 && (
        <Card title="Fertige Anfragen">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Objekt</TableHead>
                <TableHead>Mandant</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Angefragt am</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fertigeAnfragen.map((anfrage) => {
                const objekt = anfrage.objekte as { id: string; strasse: string; plz: string; ort: string } | null;
                const mandant = anfrage.mandanten as { name: string } | null;

                return (
                  <TableRow key={anfrage.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{objekt?.strasse}</p>
                        <p className="text-sm text-[#7A9BBD]">{objekt?.plz} {objekt?.ort}</p>
                      </div>
                    </TableCell>
                    <TableCell>{mandant?.name || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="success">
                        {anfrage.status === 'versendet' ? 'Versendet' : 'Fertig'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(anfrage.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Link href={`/objekte/${objekt?.id}`}>
                          <Button variant="secondary" className="p-2">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

