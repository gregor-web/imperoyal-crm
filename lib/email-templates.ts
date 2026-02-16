/** Escape HTML special characters to prevent XSS in email templates */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function generateWelcomeEmailHtml(name: string, email: string, password: string, loginUrl: string): string {
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
