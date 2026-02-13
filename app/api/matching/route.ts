import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { findePassendeKaeufer } from '@/lib/matching';
import type { Objekt, Ankaufsprofil, Mandant } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const { objekt_id } = await request.json();

    if (!objekt_id) {
      return NextResponse.json({ error: 'objekt_id ist erforderlich' }, { status: 400 });
    }

    // SECURITY: Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(objekt_id)) {
      return NextResponse.json({ error: 'Ungültige Objekt-ID' }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    // SECURITY: Only admins can run matching (prevents IDOR - leaking buyer contact data)
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 });
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
    const ankaufsprofileQuery = supabase
      .from('ankaufsprofile')
      .select('*');

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

    // Fetch mandanten for the profiles
    const mandantIds = [...new Set(ankaufsprofile.map(p => p.mandant_id))];
    const { data: mandanten } = await supabase
      .from('mandanten')
      .select('*')
      .in('id', mandantIds);

    // Run the matching algorithm
    const matches = findePassendeKaeufer(
      objekt as Objekt,
      ankaufsprofile as Ankaufsprofil[],
      (mandanten || []) as Mandant[]
    );

    return NextResponse.json({
      success: true,
      matches: matches.map((m) => ({
        ankaufsprofil: {
          id: m.ankaufsprofil.id,
          name: m.ankaufsprofil.name,
        },
        mandant: {
          id: m.mandant.id,
          name: m.mandant.name,
          ansprechpartner: m.mandant.ansprechpartner,
          email: m.mandant.email,
        },
        score: m.score,
        matches: m.matches,
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
