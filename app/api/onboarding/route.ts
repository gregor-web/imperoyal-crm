import { NextResponse } from 'next/server';
import { createAdminClient, generatePassword } from '@/lib/supabase/admin';

const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL || '';

/** Escape HTML special characters to prevent XSS in email templates */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function generateWelcomeEmailHtml(name: string, email: string, password: string, loginUrl: string): string {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safePassword = escapeHtml(password);
  const safeLoginUrl = encodeURI(loginUrl);
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
                Sehr geehrte(r) <span style="color: #b8c5d4;">${safeName}</span>,
              </p>

              <p style="margin: 0 0 30px; color: #b8c5d4; font-size: 15px; line-height: 1.8;">
                Vielen Dank für Ihre Anfrage! Ihr exklusiver Zugang zum Imperoyal Immobilien Portal wurde erfolgreich eingerichtet.
                Wir werden Ihre Objekte analysieren und Sie benachrichtigen, sobald Ihre Auswertungen bereit sind.
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
                        <td style="padding: 12px 0; color: #ffffff; font-size: 15px; font-weight: 500;">${safeEmail}</td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding: 8px 0;">
                          <div style="border-top: 1px solid rgba(184, 197, 212, 0.2);"></div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; color: #8a9bb0; font-size: 14px;">Passwort:</td>
                        <td style="padding: 12px 0;">
                          <code style="background: rgba(93, 122, 153, 0.3); padding: 8px 16px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 18px; color: #ffffff; font-weight: 700; letter-spacing: 1px;">${safePassword}</code>
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
                    <a href="${safeLoginUrl}" style="display: inline-block; background: linear-gradient(135deg, #5d7a99 0%, #4a6580 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 4px; font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;">
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

// =====================================================
// TYPES
// =====================================================

interface Einheit {
  nutzung: 'Wohnen' | 'Gewerbe' | 'Stellplatz';
  flaeche: string;
  kaltmiete: string;
  vergleichsmiete: string;
  mietvertragsart: 'Standard' | 'Index' | 'Staffel';
  vertragsbeginn: string;
  letzte_mieterhoehung: string;
  hoehe_mieterhoehung: string;
  datum_558: string;
  hoehe_558: string;
  datum_559: string;
  art_modernisierung_559: string;
  hoehe_559: string;
}

interface Objekt {
  strasse: string;
  plz: string;
  ort: string;
  gebaeudetyp: string;
  baujahr: string;
  kaufpreis: string;
  kaufdatum: string;
  eigenkapital_prozent: string;
  zinssatz: string;
  tilgung: string;
  instandhaltung: string;
  verwaltung: string;
  einheiten: Einheit[];
}

interface Ankaufsprofil {
  name: string;
  kaufinteresse_aktiv: boolean;
  assetklassen: string[];
  regionen: string;
  lagepraeferenz: string[];
  min_volumen: string;
  max_volumen: string;
  kaufpreisfaktor: string;
  rendite_min: string;
  rendite_soll: string;
  finanzierungsform: string;
  zustand: string[];
  baujahr_von: string;
  baujahr_bis: string;
  min_wohnflaeche: string;
  min_gewerbeflaeche: string;
  min_wohneinheiten: string;
  min_gewerbeeinheiten: string;
  min_grundstueck: string;
  ausgeschlossene_partner: boolean;
  ausgeschlossene_partner_liste: string;
  sonstiges: string;
  weitere_projektarten: string;
}

interface OnboardingData {
  // Mandanteninformationen
  name: string;
  ansprechpartner?: string; // Legacy: einzelnes Feld
  vorname?: string; // Neu: getrennte Felder
  nachname?: string;
  anrede: string;
  position?: string;
  email: string;
  telefon: string;
  // Ankaufsprofil (optional)
  createAnkaufsprofil: boolean;
  ankaufsprofil?: Ankaufsprofil;
  // Objekte mit ihren Einheiten
  objekte: Objekt[];
}

// =====================================================
// API HANDLER
// =====================================================

export async function POST(request: Request) {
  try {
    // SECURITY: Verify Content-Type to prevent CSRF via form submission
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 415 }
      );
    }

    const data: OnboardingData = await request.json();

    // Build ansprechpartner from vorname/nachname if not provided
    const ansprechpartner = data.ansprechpartner ||
      (data.vorname && data.nachname ? `${data.vorname} ${data.nachname}` : data.vorname || data.nachname || '');

    // SECURITY: Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: 'Ungültige E-Mail-Adresse' },
        { status: 400 }
      );
    }

    // SECURITY: Limit number of objects to prevent abuse
    if (data.objekte && data.objekte.length > 20) {
      return NextResponse.json(
        { error: 'Maximal 20 Objekte pro Onboarding erlaubt' },
        { status: 400 }
      );
    }

    // SECURITY: Sanitize text inputs
    data.name = data.name.trim().slice(0, 200);
    data.email = data.email.trim().toLowerCase();
    if (data.telefon) data.telefon = data.telefon.trim().slice(0, 30);

    // Validate required fields
    if (!data.name || !data.email || !ansprechpartner) {
      return NextResponse.json(
        { error: 'Name, E-Mail und Ansprechpartner (Vorname/Nachname) sind erforderlich' },
        { status: 400 }
      );
    }

    if (!data.objekte || data.objekte.length === 0) {
      return NextResponse.json(
        { error: 'Mindestens ein Objekt ist erforderlich' },
        { status: 400 }
      );
    }

    // Validate each object has required fields
    for (let i = 0; i < data.objekte.length; i++) {
      const obj = data.objekte[i];
      if (!obj.strasse || !obj.plz || !obj.kaufpreis) {
        return NextResponse.json(
          { error: `Objekt ${i + 1}: Straße, PLZ und Kaufpreis sind erforderlich` },
          { status: 400 }
        );
      }
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
        ansprechpartner,
        anrede: data.anrede || null,
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

    // 1b. Create Ankaufsprofil if requested
    let ankaufsprofilId: string | null = null;
    if (data.createAnkaufsprofil && data.ankaufsprofil) {
      const ap = data.ankaufsprofil;
      const { data: ankaufsprofil, error: apError } = await supabase
        .from('ankaufsprofile')
        .insert({
          mandant_id: mandant.id,
          name: ap.name || `${data.name} - Ankaufsprofil`,
          kaufinteresse_aktiv: ap.kaufinteresse_aktiv ?? true,
          assetklassen: ap.assetklassen || [],
          regionen: ap.regionen || null,
          lagepraeferenz: ap.lagepraeferenz || [],
          min_volumen: ap.min_volumen ? parseFloat(ap.min_volumen) : null,
          max_volumen: ap.max_volumen ? parseFloat(ap.max_volumen) : null,
          kaufpreisfaktor: ap.kaufpreisfaktor ? parseFloat(ap.kaufpreisfaktor) : null,
          rendite_min: ap.rendite_min ? parseFloat(ap.rendite_min) : null,
          rendite_soll: ap.rendite_soll ? parseFloat(ap.rendite_soll) : null,
          finanzierungsform: ap.finanzierungsform || null,
          zustand: ap.zustand || [],
          baujahr_von: ap.baujahr_von ? parseInt(ap.baujahr_von) : null,
          baujahr_bis: ap.baujahr_bis ? parseInt(ap.baujahr_bis) : null,
          min_wohnflaeche: ap.min_wohnflaeche ? parseFloat(ap.min_wohnflaeche) : null,
          min_gewerbeflaeche: ap.min_gewerbeflaeche ? parseFloat(ap.min_gewerbeflaeche) : null,
          min_wohneinheiten: ap.min_wohneinheiten ? parseInt(ap.min_wohneinheiten) : null,
          min_gewerbeeinheiten: ap.min_gewerbeeinheiten ? parseInt(ap.min_gewerbeeinheiten) : null,
          min_grundstueck: ap.min_grundstueck ? parseFloat(ap.min_grundstueck) : null,
          ausgeschlossene_partner: ap.ausgeschlossene_partner ?? false,
          ausgeschlossene_partner_liste: ap.ausgeschlossene_partner_liste || null,
          sonstiges: ap.sonstiges || null,
          weitere_projektarten: ap.weitere_projektarten || null,
        })
        .select('id')
        .single();

      if (apError) {
        console.error('Ankaufsprofil creation error:', apError);
        // Don't fail the whole onboarding, just log the error
      } else {
        ankaufsprofilId = ankaufsprofil.id;
      }
    }

    // 2. Create Auth user and send welcome email
    const password = generatePassword(10);
    let emailSent = false;

    try {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: data.email,
        password,
        email_confirm: true,
        user_metadata: {
          name: ansprechpartner || data.name,
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
            name: ansprechpartner || data.name,
            role: 'mandant',
          })
          .eq('id', authData.user.id);

        // Send welcome email via Make.com webhook
        const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://imperoyal-system.vercel.app'}/login`;
        const htmlContent = generateWelcomeEmailHtml(ansprechpartner || data.name, data.email, password, loginUrl);

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

    // 3. Create Objekte and their Einheiten
    const createdObjektIds: string[] = [];

    for (const objektData of data.objekte) {
      // Calculate totals from einheiten
      const wohneinheiten = objektData.einheiten.filter(e => e.nutzung === 'Wohnen').length;
      const gewerbeeinheiten = objektData.einheiten.filter(e => e.nutzung === 'Gewerbe').length;
      const wohnflaeche = objektData.einheiten
        .filter(e => e.nutzung === 'Wohnen')
        .reduce((sum, e) => sum + (parseFloat(e.flaeche) || 0), 0);
      const gewerbeflaeche = objektData.einheiten
        .filter(e => e.nutzung === 'Gewerbe')
        .reduce((sum, e) => sum + (parseFloat(e.flaeche) || 0), 0);

      // Create Objekt
      const { data: objekt, error: objektError } = await supabase
        .from('objekte')
        .insert({
          mandant_id: mandant.id,
          strasse: objektData.strasse,
          plz: objektData.plz,
          ort: objektData.ort || null,
          gebaeudetyp: objektData.gebaeudetyp || null,
          baujahr: objektData.baujahr ? parseInt(objektData.baujahr) : null,
          kaufpreis: parseFloat(objektData.kaufpreis),
          kaufdatum: objektData.kaufdatum || null,
          eigenkapital_prozent: objektData.eigenkapital_prozent ? parseFloat(objektData.eigenkapital_prozent) : 30,
          zinssatz: objektData.zinssatz ? parseFloat(objektData.zinssatz) : 3.8,
          tilgung: objektData.tilgung ? parseFloat(objektData.tilgung) : 2,
          instandhaltung: objektData.instandhaltung ? parseFloat(objektData.instandhaltung) : null,
          verwaltung: objektData.verwaltung ? parseFloat(objektData.verwaltung) : null,
          wohneinheiten,
          gewerbeeinheiten,
          wohnflaeche: wohnflaeche || null,
          gewerbeflaeche: gewerbeflaeche || null,
        })
        .select()
        .single();

      if (objektError) {
        console.error('Objekt creation error:', objektError);
        continue; // Continue with other objects
      }

      createdObjektIds.push(objekt.id);

      // Create Einheiten for this Objekt
      if (objektData.einheiten && objektData.einheiten.length > 0) {
        const einheitenToInsert = objektData.einheiten.map((e, index) => ({
          objekt_id: objekt.id,
          position: index + 1,
          nutzung: e.nutzung,
          flaeche: e.flaeche ? parseFloat(e.flaeche) : null,
          kaltmiete: e.kaltmiete ? parseFloat(e.kaltmiete) : null,
          vergleichsmiete: e.vergleichsmiete ? parseFloat(e.vergleichsmiete) : 12,
          mietvertragsart: e.mietvertragsart || 'Standard',
          vertragsbeginn: e.vertragsbeginn || null,
          letzte_mieterhoehung: e.letzte_mieterhoehung || null,
          hoehe_mieterhoehung: e.hoehe_mieterhoehung ? parseFloat(e.hoehe_mieterhoehung) : null,
          datum_558: e.datum_558 || null,
          hoehe_558: e.hoehe_558 ? parseFloat(e.hoehe_558) : null,
          datum_559: e.datum_559 || null,
          art_modernisierung_559: e.art_modernisierung_559 || null,
          hoehe_559: e.hoehe_559 ? parseFloat(e.hoehe_559) : null,
        }));

        const { error: einheitenError } = await supabase
          .from('einheiten')
          .insert(einheitenToInsert);

        if (einheitenError) {
          console.error('Einheiten creation error:', einheitenError);
        }
      }
    }

    // 4. Send notification via Make.com webhook
    const webhookUrl = process.env.MAKE_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        // Calculate total stats for notification
        const totalEinheiten = data.objekte.reduce((sum, o) => sum + o.einheiten.length, 0);
        const totalKaufpreis = data.objekte.reduce((sum, o) => sum + (parseFloat(o.kaufpreis) || 0), 0);

        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            actionId: 3,
            type: 'onboarding',
            mandant_name: data.name,
            mandant_email: data.email,
            ansprechpartner,
            telefon: data.telefon,
            objekte_anzahl: data.objekte.length,
            einheiten_gesamt: totalEinheiten,
            gesamtvolumen: totalKaufpreis,
            objekt_adressen: data.objekte.map(o => `${o.strasse}, ${o.plz} ${o.ort}`).join(' | '),
          }),
        });
      } catch (webhookError) {
        console.error('Webhook error:', webhookError);
      }
    }

    // Build success message
    let successMessage = `Onboarding erfolgreich! ${createdObjektIds.length} Objekte wurden erstellt.`;
    if (ankaufsprofilId) {
      successMessage += ' Ankaufsprofil wurde erstellt.';
    }
    if (emailSent) {
      successMessage += ' Zugangsdaten wurden per E-Mail versendet.';
    } else {
      successMessage += ' Bitte kontaktieren Sie uns für Ihre Zugangsdaten.';
    }

    return NextResponse.json({
      success: true,
      mandant_id: mandant.id,
      objekt_ids: createdObjektIds,
      objekte_count: createdObjektIds.length,
      ankaufsprofil_id: ankaufsprofilId,
      emailSent,
      message: successMessage,
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Onboarding' },
      { status: 500 }
    );
  }
}
