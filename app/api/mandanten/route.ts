import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient, generatePassword } from '@/lib/supabase/admin';
import { mandantSchema } from '@/lib/validators';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = mandantSchema.parse(body);

    // Create mandant in database
    const { data: mandant, error: mandantError } = await supabase
      .from('mandanten')
      .insert(validatedData)
      .select()
      .single();

    if (mandantError) {
      throw mandantError;
    }

    // Generate password for new user
    const password = generatePassword(10);

    // Create auth user with admin client
    const adminClient = createAdminClient();
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: validatedData.email,
      password,
      email_confirm: true,
      user_metadata: {
        name: validatedData.ansprechpartner || validatedData.name,
      },
    });

    if (authError) {
      // Rollback: delete mandant if user creation fails
      await supabase.from('mandanten').delete().eq('id', mandant.id);
      throw authError;
    }

    // Update profile with mandant_id
    const { error: profileError } = await adminClient
      .from('profiles')
      .update({
        mandant_id: mandant.id,
        name: validatedData.ansprechpartner || validatedData.name,
        role: 'mandant',
      })
      .eq('id', authData.user.id);

    if (profileError) {
      console.error('Profile update error:', profileError);
    }

    return NextResponse.json({
      mandant,
      password, // Return password so it can be shown once
      message: 'Mandant erfolgreich erstellt',
    });
  } catch (error) {
    console.error('Mandant creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Fehler beim Erstellen des Mandanten' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('mandanten')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Fehler beim Laden' },
      { status: 500 }
    );
  }
}
