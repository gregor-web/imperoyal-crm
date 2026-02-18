import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { PdfConfig } from '@/lib/types';
import { PdfEditorView } from '@/components/pdf-editor-view';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PdfEditorPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') redirect('/auswertungen');

  const { data: auswertung, error } = await supabase
    .from('auswertungen')
    .select('id, pdf_config, objekte (strasse, plz, ort), mandanten (name)')
    .eq('id', id)
    .single();

  if (error || !auswertung) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const objekt = auswertung.objekte as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mandant = auswertung.mandanten as any;

  return (
    <PdfEditorView
      auswertungId={id}
      initialConfig={(auswertung.pdf_config as PdfConfig) || null}
      objektLabel={objekt ? `${objekt.strasse}, ${objekt.plz} ${objekt.ort}` : 'Unbekannt'}
      mandantName={mandant?.name || 'Unbekannt'}
    />
  );
}
