import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
    const { anfrage_id } = body;

    if (!anfrage_id) {
      return NextResponse.json({ error: 'Anfrage ID fehlt' }, { status: 400 });
    }

    // Update Anfrage status
    const { error } = await supabase
      .from('anfragen')
      .update({ status: 'bearbeitet' })
      .eq('id', anfrage_id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating anfrage:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren' },
      { status: 500 }
    );
  }
}
