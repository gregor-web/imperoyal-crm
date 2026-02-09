import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { findePassendeKaeufer } from '@/lib/matching';
import type { Objekt, Ankaufsprofil } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const { objekt_id } = await request.json();

    if (!objekt_id) {
      return NextResponse.json({ error: 'objekt_id ist erforderlich' }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    // Fetch the object
    const { data: objekt, error: objektError } = await supabase
      .from('objekte')
      .select('*')
      .eq('id', objekt_id)
      .single();

    if (objektError || !objekt) {
      return NextResponse.json({ error: 'Objekt nicht gefunden' }, { status: 404 });
    }

    // Fetch all ankaufsprofile (excluding the object owner's profile)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .single();

    let ankaufsprofileQuery = supabase
      .from('ankaufsprofile')
      .select(`
        *,
        mandanten (id, name, ansprechpartner, email)
      `);

    // Non-admin users can only see their own profiles matched
    if (profile?.role !== 'admin') {
      ankaufsprofileQuery = ankaufsprofileQuery.neq('mandant_id', objekt.mandant_id);
    }

    const { data: ankaufsprofile, error: profileError } = await ankaufsprofileQuery;

    if (profileError) {
      console.error('Error fetching ankaufsprofile:', profileError);
      return NextResponse.json({ error: 'Fehler beim Laden der Ankaufsprofile' }, { status: 500 });
    }

    if (!ankaufsprofile || ankaufsprofile.length === 0) {
      return NextResponse.json({
        success: true,
        matches: [],
        message: 'Keine passenden Ankaufsprofile gefunden',
      });
    }

    // Convert to the expected format
    const formattedProfiles: (Ankaufsprofil & { mandanten: { id: string; name: string; ansprechpartner: string; email: string } })[] =
      ankaufsprofile.map((p) => ({
        id: p.id,
        mandant_id: p.mandant_id,
        name: p.name,
        min_volumen: p.min_volumen,
        max_volumen: p.max_volumen,
        assetklassen: p.assetklassen || [],
        regionen: p.regionen,
        rendite_min: p.rendite_min,
        sonstiges: p.sonstiges,
        created_at: p.created_at,
        updated_at: p.updated_at,
        mandanten: p.mandanten as { id: string; name: string; ansprechpartner: string; email: string },
      }));

    // Run the matching algorithm
    const matches = findePassendeKaeufer(objekt as Objekt, formattedProfiles);

    return NextResponse.json({
      success: true,
      matches: matches.map((m) => ({
        ankaufsprofil: {
          id: m.profil.id,
          name: m.profil.name,
          mandant: m.profil.mandanten,
        },
        score: m.score,
        details: m.details,
      })),
    });
  } catch (error) {
    console.error('Matching error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Matching' },
      { status: 500 }
    );
  }
}
