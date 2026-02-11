import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient, generatePassword } from '@/lib/supabase/admin';
import { mandantSchema } from '@/lib/validators';

const MAKE_WEBHOOK_URL = 'https://hook.eu1.make.com/toy335e81vu4s5sxdlq5p6gf2ou1r3k5';

function generateWelcomeEmailHtml(name: string, email: string, password: string, loginUrl: string): string {
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Georgia', 'Times New Roman', serif; background-color: #1e3a5f;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px; background-color: #1e3a5f;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px;">

          <tr>
            <td style="padding: 50px 40px; text-align: center; background: linear-gradient(180deg, #1e3a5f 0%, #2a4a6e 100%);">
              <h1 style="margin: 0 0 10px; color: #ffffff; font-size: 32px; font-weight: 400; letter-spacing: 2px;">
                Willkommen
              </h1>
              <p style="margin: 0; color: #b8c5d4; font-size: 18px; font-style: italic;">
                bei Imperoyal Immobilien
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px; background-color: #1e3a5f;">
              <p style="margin: 0 0 25px; color: #ffffff; font-size: 16px; line-height: 1.8;">
                Sehr geehrte(r) <span style="color: #b8c5d4;">${name}</span>,
              </p>

              <p style="margin: 0 0 30px; color: #b8c5d4; font-size: 15px; line-height: 1.8;">
                Ihr exklusiver Zugang zum Imperoyal Immobilien Portal wurde erfolgreich eingerichtet.
                Mit unserem System erhalten Sie professionelle Analysen und Optimierungsprotokolle
                für Ihr Immobilienportfolio.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0; background: linear-gradient(135deg, #2a4a6e 0%, #1e3a5f 100%); border: 1px solid rgba(184, 197, 212, 0.3); border-radius: 8px;">
                <tr>
                  <td style="padding: 30px;">
                    <p style="margin: 0 0 20px; color: #5d7a99; font-size: 14px; text-transform: uppercase; letter-spacing: 3px; font-weight: 600;">
                      Ihre Zugangsdaten
                    </p>

                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 12px 0; color: #8a9bb0; font-size: 14px; width: 100px;">E-Mail:</td>
                        <td style="padding: 12px 0; color: #ffffff; font-size: 15px; font-weight: 500;">${email}</td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding: 8px 0;">
                          <div style="border-top: 1px solid rgba(184, 197, 212, 0.2);"></div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; color: #8a9bb0; font-size: 14px;">Passwort:</td>
                        <td style="padding: 12px 0;">
                          <code style="background: rgba(93, 122, 153, 0.3); padding: 8px 16px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 18px; color: #ffffff; font-weight: 700; letter-spacing: 1px;">${password}</code>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 35px; color: #b8c5d4; font-size: 13px; font-style: italic;">
                Bitte ändern Sie Ihr Passwort nach dem ersten Login.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #5d7a99 0%, #4a6580 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 4px; font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;">
                      Zum Portal
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px 40px; text-align: center; border-top: 1px solid rgba(184, 197, 212, 0.3);">
              <p style="margin: 0 0 10px; color: #b8c5d4; font-size: 12px;">
                © 2026 Imperoyal Immobilien. Alle Rechte vorbehalten.
              </p>
              <p style="margin: 0; color: #8a9bb0; font-size: 11px;">
                Für Family Offices, UHNWIs & Institutionelle Vermögensverwalter
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

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

    // Send welcome email with credentials via Make.com webhook
    let emailSent = false;
    try {
      const recipientName = validatedData.ansprechpartner || validatedData.name;
      const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://imperoyal-app.vercel.app'}/login`;
      const htmlContent = generateWelcomeEmailHtml(recipientName, validatedData.email, password, loginUrl);

      const webhookResponse = await fetch(MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'welcome',
          to: validatedData.email,
          subject: 'Willkommen bei Imperoyal Immobilien - Ihre Zugangsdaten',
          html: htmlContent,
        }),
      });
      emailSent = webhookResponse.ok;
    } catch (emailError) {
      console.error('Welcome email webhook error:', emailError);
      // Don't fail the whole request if email fails
    }

    return NextResponse.json({
      mandant,
      password, // Return password so it can be shown once (as backup)
      emailSent,
      message: emailSent
        ? 'Mandant erstellt und Zugangsdaten per E-Mail versendet'
        : 'Mandant erstellt (E-Mail-Versand fehlgeschlagen)',
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
