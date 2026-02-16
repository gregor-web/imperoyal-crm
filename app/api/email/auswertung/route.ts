import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

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

interface AuswertungEmailParams {
  anrede: string;
  name: string;
  objektAdresse: string;
  empfehlung: string;
  viewUrl: string;
}

function generateAuswertungEmailHtml(params: AuswertungEmailParams): string {
  const { anrede, name, objektAdresse, empfehlung, viewUrl } = params;
  const safeName = escapeHtml(name);
  const safeAnrede = escapeHtml(anrede);
  const safeAdresse = escapeHtml(objektAdresse);
  const safeEmpfehlung = escapeHtml(empfehlung);
  const safeViewUrl = encodeURI(viewUrl);

  const empfehlungColors: Record<string, { bg: string; text: string }> = {
    HALTEN: { bg: 'rgba(34, 197, 94, 0.2)', text: '#22c55e' },
    OPTIMIEREN: { bg: 'rgba(93, 122, 153, 0.3)', text: '#5d7a99' },
    RESTRUKTURIEREN: { bg: 'rgba(234, 179, 8, 0.2)', text: '#eab308' },
    VERKAUFEN: { bg: 'rgba(239, 68, 68, 0.2)', text: '#ef4444' },
  };

  const colors = empfehlungColors[empfehlung] || empfehlungColors.OPTIMIEREN;

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
                Ihre Auswertung
              </h1>
              <p style="margin: 0; color: #b8c5d4; font-size: 18px; font-style: italic;">
                ist fertig
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px; background-color: #1e3a5f;">
              <p style="margin: 0 0 25px; color: #ffffff; font-size: 16px; line-height: 1.8;">
                ${safeAnrede} <span style="color: #b8c5d4;">${safeName}</span>,
              </p>

              <p style="margin: 0 0 30px; color: #b8c5d4; font-size: 15px; line-height: 1.8;">
                Ihre Immobilienauswertung für <strong style="color: #ffffff;">${safeAdresse}</strong> wurde erfolgreich erstellt und steht Ihnen ab sofort zur Verfügung.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0; background: linear-gradient(135deg, #2a4a6e 0%, #1e3a5f 100%); border: 1px solid rgba(184, 197, 212, 0.3); border-radius: 8px;">
                <tr>
                  <td style="padding: 30px; text-align: center;">
                    <p style="margin: 0 0 15px; color: #b8c5d4; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">
                      Unsere Empfehlung
                    </p>
                    <p style="margin: 0; display: inline-block; background: ${colors.bg}; color: ${colors.text}; font-size: 24px; font-weight: 700; padding: 12px 30px; border-radius: 6px; letter-spacing: 3px;">
                      ${safeEmpfehlung}
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 35px; color: #b8c5d4; font-size: 15px; line-height: 1.8;">
                In Ihrem persönlichen Dashboard finden Sie die vollständige Analyse mit detaillierten Kennzahlen, Optimierungspotenzialen und konkreten Handlungsempfehlungen. Das PDF mit allen Details ist dieser E-Mail angehängt.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${safeViewUrl}" style="display: inline-block; background: linear-gradient(135deg, #5d7a99 0%, #4a6580 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 4px; font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;">
                      Auswertung ansehen
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

export async function POST(request: Request) {
  try {
    const { auswertung_id } = await request.json();

    if (!auswertung_id) {
      return NextResponse.json(
        { error: 'auswertung_id ist erforderlich' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    // Verify user is admin
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

    // Fetch auswertung with related data
    const { data: auswertung, error: fetchError } = await supabase
      .from('auswertungen')
      .select(`
        *,
        objekte (id, strasse, plz, ort),
        mandanten (id, name, ansprechpartner, email, anrede)
      `)
      .eq('id', auswertung_id)
      .single();

    if (fetchError || !auswertung) {
      return NextResponse.json({ error: 'Auswertung nicht gefunden' }, { status: 404 });
    }

    const mandant = auswertung.mandanten as {
      id: string;
      name: string;
      ansprechpartner: string;
      email: string;
      anrede?: string | null;
    } | null;
    const objekt = auswertung.objekte as {
      id: string;
      strasse: string;
      plz: string;
      ort: string;
    } | null;

    if (!mandant?.email) {
      return NextResponse.json({ error: 'Mandant hat keine E-Mail-Adresse' }, { status: 400 });
    }

    if (!objekt) {
      return NextResponse.json({ error: 'Objekt nicht gefunden' }, { status: 404 });
    }

    // Check if PDF exists
    if (!auswertung.pdf_url) {
      return NextResponse.json({ error: 'PDF nicht vorhanden - bitte zuerst Auswertung erstellen' }, { status: 400 });
    }

    console.log('[EMAIL] Sending email with existing PDF:', auswertung.pdf_url);

    // Generate HTML email content
    const recipientName = mandant.ansprechpartner || mandant.name;
    const anrede = mandant.anrede === 'Frau' ? 'Sehr geehrte Frau' : mandant.anrede === 'Herr' ? 'Sehr geehrter Herr' : 'Sehr geehrte(r)';
    const viewUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://imperoyal-system.vercel.app'}/auswertungen/${auswertung_id}`;

    const htmlContent = generateAuswertungEmailHtml({
      anrede,
      name: recipientName,
      objektAdresse: `${objekt.strasse}, ${objekt.plz} ${objekt.ort}`,
      empfehlung: auswertung.empfehlung || 'OPTIMIEREN',
      viewUrl,
    });

    // Create attachment filename - format: Imperoyal_Auswertung_Strasse_Ort_Datum.pdf
    const cleanText = (text: string) => text
      .replace(/[äÄ]/g, 'ae')
      .replace(/[öÖ]/g, 'oe')
      .replace(/[üÜ]/g, 'ue')
      .replace(/ß/g, 'ss')
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
    const dateStr = new Date(auswertung.created_at).toISOString().split('T')[0];
    const attachmentFilename = `Imperoyal_Auswertung_${cleanText(objekt.strasse)}_${cleanText(objekt.ort)}_${dateStr}.pdf`;

    // Send to Make.com webhook - PDF URL instead of base64
    const webhookPayload = {
      actionId: 2,
      to: mandant.email,
      subject: `Ihre Immobilienauswertung: ${objekt.strasse}`,
      html: htmlContent,
      // PDF from bucket URL - Make.com will download and attach it
      attachment_filename: attachmentFilename,
      attachment_url: auswertung.pdf_url,
    };

    console.log('[EMAIL] Webhook payload:', {
      ...webhookPayload,
      html: '[HTML content]',
    });

    const response = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookPayload),
    });

    if (!response.ok) {
      throw new Error(`Webhook returned ${response.status}`);
    }

    // Update auswertung status to 'abgeschlossen'
    await adminSupabase
      .from('auswertungen')
      .update({ status: 'abgeschlossen' })
      .eq('id', auswertung_id);

    // Update anfrage status to 'versendet' (email sent to mandant)
    await adminSupabase
      .from('anfragen')
      .update({ status: 'versendet' })
      .eq('objekt_id', objekt.id);

    return NextResponse.json({
      success: true,
      message: 'Auswertungs-E-Mail wurde versendet',
      pdf_url: auswertung.pdf_url,
    });
  } catch (error) {
    console.error('Auswertung email error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Versenden der Auswertungs-E-Mail' },
      { status: 500 }
    );
  }
}
