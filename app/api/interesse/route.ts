import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// UUID validation schema
const interesseSchema = z.object({
  objekt_id: z.string().uuid('Ungültige Objekt-ID'),
  mandant_id: z.string().uuid('Ungültige Mandant-ID'),
  ankaufsprofil_id: z.string().uuid('Ungültige Ankaufsprofil-ID').optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // SECURITY: Validate input with Zod
    const parseResult = interesseSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Ungültige Eingabedaten', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { objekt_id, mandant_id, ankaufsprofil_id } = parseResult.data;

    // Use admin client for public interest registration (no auth required for this endpoint)
    const supabase = createAdminClient();

    // Check if objekt exists
    const { data: objekt, error: objektError } = await supabase
      .from('objekte')
      .select('id, strasse, plz, ort, mandant_id')
      .eq('id', objekt_id)
      .single();

    if (objektError || !objekt) {
      return NextResponse.json(
        { error: 'Objekt nicht gefunden' },
        { status: 404 }
      );
    }

    // Check if mandant (buyer) exists
    const { data: kaeufer, error: kaeuferError } = await supabase
      .from('mandanten')
      .select('id, name, email')
      .eq('id', mandant_id)
      .single();

    if (kaeuferError || !kaeufer) {
      return NextResponse.json(
        { error: 'Käufer nicht gefunden' },
        { status: 404 }
      );
    }

    // Check if interest already exists
    const { data: existingInteresse } = await supabase
      .from('interessen')
      .select('id')
      .eq('objekt_id', objekt_id)
      .eq('kaeufer_mandant_id', mandant_id)
      .single();

    if (existingInteresse) {
      return NextResponse.json({
        success: true,
        already_exists: true,
        message: 'Sie haben bereits Interesse an diesem Objekt bekundet.',
      });
    }

    // Create interest entry
    const { data: interesse, error: insertError } = await supabase
      .from('interessen')
      .insert({
        objekt_id,
        kaeufer_mandant_id: mandant_id,
        ankaufsprofil_id: ankaufsprofil_id || null,
        status: 'neu',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Interest creation error:', insertError);
      throw new Error('Fehler beim Speichern des Interesses');
    }

    // Get object owner info to notify them
    const { data: verkaeufer } = await supabase
      .from('mandanten')
      .select('name, email')
      .eq('id', objekt.mandant_id)
      .single();

    return NextResponse.json({
      success: true,
      interesse_id: interesse.id,
      message: 'Ihr Interesse wurde erfolgreich registriert. Wir werden uns in Kürze bei Ihnen melden.',
      objekt: {
        adresse: `${objekt.strasse}, ${objekt.plz} ${objekt.ort}`,
      },
      verkaeufer_notified: !!verkaeufer?.email,
    });
  } catch (error) {
    console.error('Interesse error:', error);
    return NextResponse.json(
      { error: 'Fehler bei der Interessensbekundung' },
      { status: 500 }
    );
  }
}

// GET: Fetch interests (for admin dashboard)
export async function GET(request: Request) {
  try {
    // SECURITY: Require admin authentication
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    const { data: profile } = await authClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const objekt_id = searchParams.get('objekt_id');

    const supabase = createAdminClient();

    let query = supabase
      .from('interessen')
      .select(`
        *,
        objekt:objekte(id, strasse, plz, ort, kaufpreis, gebaeudetyp, mandant_id),
        kaeufer:mandanten!kaeufer_mandant_id(id, name, email, ansprechpartner, telefon),
        ankaufsprofil:ankaufsprofile(id, name)
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (objekt_id) {
      query = query.eq('objekt_id', objekt_id);
    }

    const { data: interessen, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      interessen: interessen || [],
    });
  } catch (error) {
    console.error('Fetch interessen error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Interessen' },
      { status: 500 }
    );
  }
}

// PATCH: Update interest status
export async function PATCH(request: Request) {
  try {
    // SECURITY: Require admin authentication
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    const { data: authProfile } = await authClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (authProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 });
    }

    const { interesse_id, status, notizen } = await request.json();

    if (!interesse_id) {
      return NextResponse.json(
        { error: 'interesse_id ist erforderlich' },
        { status: 400 }
      );
    }

    // SECURITY: Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(interesse_id)) {
      return NextResponse.json({ error: 'Ungültige Interesse-ID' }, { status: 400 });
    }

    // SECURITY: Whitelist allowed status values
    const VALID_STATUSES = ['neu', 'kontaktiert', 'in_verhandlung', 'abgeschlossen', 'abgelehnt'];
    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Ungültiger Status. Erlaubt: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (status) updateData.status = status;
    if (notizen !== undefined) updateData.notizen = notizen;

    const { data: interesse, error } = await supabase
      .from('interessen')
      .update(updateData)
      .eq('id', interesse_id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      interesse,
    });
  } catch (error) {
    console.error('Update interesse error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren' },
      { status: 500 }
    );
  }
}
