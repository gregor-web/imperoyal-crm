import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '@/components/ui/table';
import { formatDate, formatCurrency, formatAddress } from '@/lib/formatters';
import { ArrowLeft, Edit, Building2, Mail, Phone, MapPin, BarChart3 } from 'lucide-react';
import { getTierForMandant } from '@/lib/stripe';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function MandantDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Check if admin
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  // Fetch mandant
  const { data: mandant, error } = await supabase
    .from('mandanten')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !mandant) {
    notFound();
  }

  // Fetch objekte for this mandant
  const { data: objekte } = await supabase
    .from('objekte')
    .select('id, strasse, plz, ort, kaufpreis, gebaeudetyp, created_at')
    .eq('mandant_id', id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/mandanten" className="p-2 hover:bg-[#162636] rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-[#6B8AAD]" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#EDF1F5]">{mandant.name}</h1>
            <p className="text-sm sm:text-base text-[#6B8AAD]">{mandant.ansprechpartner || 'Kein Ansprechpartner'}</p>
          </div>
        </div>
        <Link href={`/mandanten/${id}/edit`} className="self-start sm:self-auto ml-11 sm:ml-0">
          <Button variant="secondary">
            <Edit className="w-4 h-4 mr-2" />
            Bearbeiten
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Kontaktdaten */}
        <Card title="Kontaktdaten" className="lg:col-span-1">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-[#6B8AAD] mt-0.5" />
              <div>
                <p className="text-sm text-[#7A9BBD]">E-Mail</p>
                <a href={`mailto:${mandant.email}`} className="text-[#7A9BBD] hover:underline break-all">
                  {mandant.email}
                </a>
              </div>
            </div>

            {mandant.telefon && (
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#6B8AAD] mt-0.5" />
                <div>
                  <p className="text-sm text-[#7A9BBD]">Telefon</p>
                  <a href={`tel:${mandant.telefon}`} className="text-[#EDF1F5]">
                    {mandant.telefon}
                  </a>
                </div>
              </div>
            )}

            {(mandant.strasse || mandant.ort) && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#6B8AAD] mt-0.5" />
                <div>
                  <p className="text-sm text-[#7A9BBD]">Adresse</p>
                  <p className="text-[#EDF1F5]">
                    {formatAddress(mandant.strasse, mandant.plz, mandant.ort)}
                  </p>
                  {mandant.land && mandant.land !== 'Deutschland' && (
                    <p className="text-[#6B8AAD]">{mandant.land}</p>
                  )}
                </div>
              </div>
            )}

            {mandant.kontaktart && (
              <div className="pt-2 border-t border-white/[0.08]">
                <p className="text-sm text-[#7A9BBD]">Bevorzugte Kontaktart</p>
                <Badge variant="info">{mandant.kontaktart}</Badge>
              </div>
            )}

            {mandant.position && (
              <div>
                <p className="text-sm text-[#7A9BBD]">Position</p>
                <p className="text-[#EDF1F5]">{mandant.position}</p>
              </div>
            )}

            {/* Pricing Tier */}
            <div className="pt-3 border-t border-white/[0.08]">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-[#6B8AAD]" />
                <p className="text-sm text-[#7A9BBD]">Analyse-Tarif</p>
              </div>
              {(() => {
                const count = mandant.completed_analysen || 0;
                const tier = getTierForMandant(count);
                return (
                  <div className="bg-[#162636] rounded-lg p-3 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-[#EDF1F5]">{tier.label}</span>
                      <span className="text-sm font-bold text-[#EDF1F5]">{tier.preisProAnalyse} €</span>
                    </div>
                    <p className="text-xs text-[#6B8AAD]">
                      {count} {count === 1 ? 'Analyse' : 'Analysen'} abgeschlossen
                    </p>
                    {tier.maxAnalysen && (
                      <div className="w-full h-1 bg-[#253546] rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full bg-[#5B7A9D] rounded-full"
                          style={{ width: `${Math.min(100, ((count - tier.minAnalysen + 1) / (tier.maxAnalysen - tier.minAnalysen + 1)) * 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </Card>

        {/* Objekte */}
        <Card
          title="Objekte"
          subtitle={`${objekte?.length || 0} Objekte`}
          className="lg:col-span-2"
          actions={
            <Link href={`/objekte/neu?mandant=${id}`}>
              <Button size="sm">+ Objekt</Button>
            </Link>
          }
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Adresse</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Kaufpreis</TableHead>
                <TableHead>Erstellt</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {objekte && objekte.length > 0 ? (
                objekte.map((objekt) => (
                  <TableRow key={objekt.id}>
                    <TableCell className="font-medium">
                      {objekt.strasse}, {objekt.plz} {objekt.ort}
                    </TableCell>
                    <TableCell>{objekt.gebaeudetyp || '-'}</TableCell>
                    <TableCell>{formatCurrency(objekt.kaufpreis)}</TableCell>
                    <TableCell>{formatDate(objekt.created_at)}</TableCell>
                    <TableCell>
                      <Link
                        href={`/objekte/${objekt.id}`}
                        className="text-[#7A9BBD] hover:text-[#6B8AAD] text-sm"
                      >
                        Details
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableEmpty message="Keine Objekte vorhanden" colSpan={5} />
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Metadaten */}
      <div className="flex flex-col sm:flex-row gap-1 text-sm text-[#7A9BBD]">
        <span>Erstellt am {formatDate(mandant.created_at)}</span>
        <span className="hidden sm:inline">|</span>
        <span>Aktualisiert {formatDate(mandant.updated_at)}</span>
      </div>
    </div>
  );
}
