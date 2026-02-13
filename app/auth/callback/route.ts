import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// SECURITY: Whitelist of allowed redirect paths to prevent Open Redirect attacks
const ALLOWED_REDIRECTS = [
  '/dashboard',
  '/mandanten',
  '/objekte',
  '/auswertungen',
  '/ankaufsprofile',
  '/anfragen',
  '/meine-anfragen',
];

function getSafeRedirect(next: string | null): string {
  if (!next) return '/dashboard';
  // Only allow relative paths that start with /
  if (!next.startsWith('/')) return '/dashboard';
  // Block protocol-relative URLs (e.g. //evil.com)
  if (next.startsWith('//')) return '/dashboard';
  // Check if the path starts with an allowed prefix
  const isAllowed = ALLOWED_REDIRECTS.some(prefix => next.startsWith(prefix));
  return isAllowed ? next : '/dashboard';
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const type = searchParams.get('type');
  const next = searchParams.get('next');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/update-password`);
      }
      const safeRedirect = getSafeRedirect(next);
      return NextResponse.redirect(`${origin}${safeRedirect}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
