import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const VALID_STATUSES = ['offen', 'in_bearbeitung', 'fertig', 'versendet'];

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 });
    }

    const body = await request.json();
    const { anfrage_id, status } = body;

    if (!anfrage_id) {
      return NextResponse.json({ error: 'Anfrage ID fehlt' }, { status: 400 });
    }

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Ungültiger Status. Erlaubt: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    // Update Anfrage status
    const { error } = await supabase
      .from('anfragen')
      .update({ status })
      .eq('id', anfrage_id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error('Error updating anfrage status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Fehler beim Aktualisieren' },
      { status: 500 }
    );
  }
}
