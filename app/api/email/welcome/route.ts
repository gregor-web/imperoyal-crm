import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateWelcomeEmailHtml } from '@/lib/email-templates';

export async function POST(request: Request) {
  try {
    const { mandant_id, email, name, password } = await request.json();

    if (!mandant_id || !email || !name) {
      return NextResponse.json(
        { error: 'mandant_id, email und name sind erforderlich' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

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

    // Check if webhook URL is configured
    const webhookUrl = process.env.MAKE_WEBHOOK_URL;
    if (!webhookUrl) {
      console.warn('MAKE_WEBHOOK_URL not configured, skipping email');
      return NextResponse.json({
        success: true,
        message: 'E-Mail-Versand nicht konfiguriert (MAKE_WEBHOOK_URL fehlt)',
        skipped: true,
      });
    }

    // Generate HTML and send to Make.com webhook
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://imperoyal-system.vercel.app'}/login`;
    const htmlContent = generateWelcomeEmailHtml(
      name,
      email,
      password || '[Passwort wurde manuell mitgeteilt]',
      loginUrl
    );

    const webhookPayload = {
      actionId: 1,
      to: email,
      subject: 'Willkommen bei Imperoyal Immobilien - Ihre Zugangsdaten',
      html: htmlContent,
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookPayload),
    });

    if (!response.ok) {
      throw new Error(`Webhook returned ${response.status}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Welcome-E-Mail wurde versendet',
    });
  } catch (error) {
    console.error('Welcome email error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Versenden der Welcome-E-Mail' },
      { status: 500 }
    );
  }
}
