import { NextResponse } from 'next/server';
import { createAdminClient, generatePassword } from '@/lib/supabase/admin';

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
                Vielen Dank für Ihre Anfrage! Ihr exklusiver Zugang zum Imperoyal Immobilien Portal wurde erfolgreich eingerichtet.
                Wir werden Ihr Objekt analysieren und Sie benachrichtigen, sobald Ihre Auswertung bereit ist.
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

interface Einheit {
  nutzung: 'Wohnen' | 'Gewerbe' | 'Stellplatz';
  flaeche: string;
  kaltmiete: string;
  vergleichsmiete: string;
  mietvertragsart: 'Standard' | 'Index' | 'Staffel';
}

interface OnboardingData {
  // Mandanteninformationen
  name: string;
  ansprechpartner: string;
  position: string;
  email: string;
  telefon: string;
  // Objektdaten
  objekt_strasse: string;
  objekt_plz: string;
  objekt_ort: string;
  gebaeudetyp: string;
  baujahr: string;
  kaufpreis: string;
  kaufdatum: string;
  // Finanzierung
  eigenkapital_prozent: string;
  zinssatz: string;
  tilgung: string;
  // Kosten
  instandhaltung: string;
  verwaltung: string;
  // Einheiten
  einheiten: Einheit[];
}

export async function POST(request: Request) {
  try {
    const data: OnboardingData = await request.json();

    // Validate required fields
    if (!data.name || !data.email || !data.ansprechpartner) {
      return NextResponse.json(
        { error: 'Name, E-Mail und Ansprechpartner sind erforderlich' },
        { status: 400 }
      );
    }

    if (!data.objekt_strasse || !data.objekt_plz || !data.kaufpreis) {
      return NextResponse.json(
        { error: 'Objektadresse und Kaufpreis sind erforderlich' },
        { status: 400 }
      );
    }

    // Use admin client to bypass RLS
    const supabase = createAdminClient();

    // Check if mandant with this email already exists
    const { data: existingMandant } = await supabase
      .from('mandanten')
      .select('id')
      .eq('email', data.email)
      .single();

    if (existingMandant) {
      return NextResponse.json(
        { error: 'Ein Mandant mit dieser E-Mail existiert bereits' },
        { status: 409 }
      );
    }

    // Also check if auth user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingAuthUser = existingUsers?.users?.find(u => u.email === data.email);
    if (existingAuthUser) {
      return NextResponse.json(
        { error: 'Ein Benutzer mit dieser E-Mail existiert bereits im System' },
        { status: 409 }
      );
    }

    // 1. Create Mandant
    const { data: mandant, error: mandantError } = await supabase
      .from('mandanten')
      .insert({
        name: data.name,
        ansprechpartner: data.ansprechpartner,
        position: data.position || null,
        email: data.email,
        telefon: data.telefon || null,
      })
      .select()
      .single();

    if (mandantError) {
      console.error('Mandant creation error:', mandantError);
      throw new Error('Fehler beim Erstellen des Mandanten');
    }

    // 1b. Create Auth user and send welcome email
    const password = generatePassword(10);
    let emailSent = false;

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: data.email,
        password,
        email_confirm: true,
        user_metadata: {
          name: data.ansprechpartner || data.name,
        },
      });

      if (authError) {
        console.error('Auth user creation error:', authError);
      } else {
        // Update profile with mandant_id
        await supabase
          .from('profiles')
          .update({
            mandant_id: mandant.id,
            name: data.ansprechpartner || data.name,
            role: 'mandant',
          })
          .eq('id', authData.user.id);

        // Send welcome email via Make.com webhook
        const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://imperoyal-app.vercel.app'}/login`;
        const htmlContent = generateWelcomeEmailHtml(data.ansprechpartner || data.name, data.email, password, loginUrl);

        const webhookResponse = await fetch(MAKE_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'welcome',
            to: data.email,
            subject: 'Willkommen bei Imperoyal Immobilien - Ihre Zugangsdaten',
            html: htmlContent,
          }),
        });
        emailSent = webhookResponse.ok;
      }
    } catch (authErr) {
      console.error('Auth/Email error:', authErr);
    }

    // Calculate totals from einheiten
    const wohneinheiten = data.einheiten.filter(e => e.nutzung === 'Wohnen').length;
    const gewerbeeinheiten = data.einheiten.filter(e => e.nutzung === 'Gewerbe').length;
    const wohnflaeche = data.einheiten
      .filter(e => e.nutzung === 'Wohnen')
      .reduce((sum, e) => sum + (parseFloat(e.flaeche) || 0), 0);
    const gewerbeflaeche = data.einheiten
      .filter(e => e.nutzung === 'Gewerbe')
      .reduce((sum, e) => sum + (parseFloat(e.flaeche) || 0), 0);

    // 2. Create Objekt
    const { data: objekt, error: objektError } = await supabase
      .from('objekte')
      .insert({
        mandant_id: mandant.id,
        strasse: data.objekt_strasse,
        plz: data.objekt_plz,
        ort: data.objekt_ort || null,
        gebaeudetyp: data.gebaeudetyp || null,
        baujahr: data.baujahr ? parseInt(data.baujahr) : null,
        kaufpreis: parseFloat(data.kaufpreis),
        kaufdatum: data.kaufdatum || null,
        eigenkapital_prozent: data.eigenkapital_prozent ? parseFloat(data.eigenkapital_prozent) : 30,
        zinssatz: data.zinssatz ? parseFloat(data.zinssatz) : 3.8,
        tilgung: data.tilgung ? parseFloat(data.tilgung) : 2,
        instandhaltung: data.instandhaltung ? parseFloat(data.instandhaltung) : null,
        verwaltung: data.verwaltung ? parseFloat(data.verwaltung) : null,
        wohneinheiten,
        gewerbeeinheiten,
        wohnflaeche: wohnflaeche || null,
        gewerbeflaeche: gewerbeflaeche || null,
      })
      .select()
      .single();

    if (objektError) {
      console.error('Objekt creation error:', objektError);
      throw new Error('Fehler beim Erstellen des Objekts');
    }

    // 3. Create Einheiten
    if (data.einheiten && data.einheiten.length > 0) {
      const einheitenToInsert = data.einheiten.map((e, index) => ({
        objekt_id: objekt.id,
        position: index + 1,
        nutzung: e.nutzung,
        flaeche: e.flaeche ? parseFloat(e.flaeche) : null,
        kaltmiete: e.kaltmiete ? parseFloat(e.kaltmiete) : null,
        vergleichsmiete: e.vergleichsmiete ? parseFloat(e.vergleichsmiete) : 12,
        mietvertragsart: e.mietvertragsart || 'Standard',
      }));

      const { error: einheitenError } = await supabase
        .from('einheiten')
        .insert(einheitenToInsert);

      if (einheitenError) {
        console.error('Einheiten creation error:', einheitenError);
        // Don't fail completely, mandant and objekt were created
      }
    }

    // 4. Optionally send notification via Make.com webhook
    // NOTE: No automatic Anfrage creation - customer must explicitly request an Auswertung
    const webhookUrl = process.env.MAKE_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            actionId: 3,
            type: 'onboarding',
            mandant_name: data.name,
            mandant_email: data.email,
            ansprechpartner: data.ansprechpartner,
            telefon: data.telefon,
            objekt_adresse: `${data.objekt_strasse}, ${data.objekt_plz} ${data.objekt_ort}`,
            kaufpreis: data.kaufpreis,
            einheiten_anzahl: data.einheiten.length,
          }),
        });
      } catch (webhookError) {
        console.error('Webhook error:', webhookError);
      }
    }

    return NextResponse.json({
      success: true,
      mandant_id: mandant.id,
      objekt_id: objekt.id,
      emailSent,
      message: emailSent
        ? 'Onboarding erfolgreich! Zugangsdaten wurden per E-Mail versendet.'
        : 'Onboarding erfolgreich! Bitte kontaktieren Sie uns für Ihre Zugangsdaten.',
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Fehler beim Onboarding' },
      { status: 500 }
    );
  }
}
