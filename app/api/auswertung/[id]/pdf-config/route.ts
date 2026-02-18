import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { PdfConfig, PdfSectionId } from '@/lib/types';

// Valid section IDs for validation
const VALID_SECTION_IDS: PdfSectionId[] = [
  'steckbrief', 'finanzierung', 'ertrag', 'cashflow', 'kosten',
  'mieterhohung', 'cashflow_chart', 'wertentwicklung', 'capex', 'weg',
  'afa', 'roi', 'exit', 'empfehlung', 'erlaeuterungen',
];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    // Only admin can edit PDF config
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Nur Admins können die PDF-Konfiguration ändern' }, { status: 403 });
    }

    const body = await request.json();
    const pdfConfig = body.pdf_config as PdfConfig;

    // Validate structure
    if (!pdfConfig || !Array.isArray(pdfConfig.sections)) {
      return NextResponse.json({ error: 'Ungültige PDF-Konfiguration' }, { status: 400 });
    }

    // Validate each section
    for (const section of pdfConfig.sections) {
      if (!VALID_SECTION_IDS.includes(section.id)) {
        return NextResponse.json({ error: `Ungültige Sektion: ${section.id}` }, { status: 400 });
      }
      if (typeof section.visible !== 'boolean') {
        return NextResponse.json({ error: `Ungültiger Sichtbarkeitswert für: ${section.id}` }, { status: 400 });
      }
      if (typeof section.order !== 'number') {
        return NextResponse.json({ error: `Ungültige Reihenfolge für: ${section.id}` }, { status: 400 });
      }
    }

    // Update auswertung
    const { error: updateError } = await supabase
      .from('auswertungen')
      .update({ pdf_config: pdfConfig })
      .eq('id', id);

    if (updateError) {
      console.error('[PDF Config] Update error:', updateError);
      return NextResponse.json({ error: 'Fehler beim Speichern' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[PDF Config] Error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
