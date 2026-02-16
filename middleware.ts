import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const { pathname } = request.nextUrl;

  // Stripe webhook and public marktdaten must bypass auth
  const isStripeWebhook = pathname === '/api/stripe/webhook';
  const isPublicMarktdaten = pathname === '/api/marktdaten/public';
  if (isStripeWebhook || isPublicMarktdaten) {
    return NextResponse.next();
  }

  // Define route categories
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/mandanten') ||
    pathname.startsWith('/objekte') ||
    pathname.startsWith('/auswertungen') ||
    pathname.startsWith('/ankaufsprofile') ||
    pathname.startsWith('/anfragen') ||
    pathname.startsWith('/meine-anfragen');

  const isProtectedApi =
    pathname.startsWith('/api/mandanten') ||
    pathname.startsWith('/api/auswertung') ||
    pathname.startsWith('/api/anfragen') ||
    pathname.startsWith('/api/matching') ||
    pathname.startsWith('/api/marktdaten') ||
    pathname.startsWith('/api/pdf') ||
    pathname.startsWith('/api/email') ||
    pathname.startsWith('/api/seed') ||
    pathname.startsWith('/api/stripe/checkout');

  const isAuthRoute =
    pathname.startsWith('/login') ||
    pathname.startsWith('/reset-password');

  // If Supabase is not configured, block all protected routes
  if (!supabaseUrl || !supabaseAnonKey) {
    if (isProtectedRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    if (isProtectedApi) {
      return NextResponse.json({ error: 'Service nicht verfügbar' }, { status: 503 });
    }
    return NextResponse.next();
  }

  try {
    const { createServerClient } = await import('@supabase/ssr');

    let supabaseResponse = NextResponse.next({
      request,
    });

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Block unauthenticated access to protected dashboard routes
    if (isProtectedRoute && !user) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    // Block unauthenticated access to protected API routes
    if (isProtectedApi && !user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    // Redirect authenticated users away from auth routes
    if (isAuthRoute && user) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    // Add security headers to all responses
    supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff');
    supabaseResponse.headers.set('X-Frame-Options', 'DENY');
    supabaseResponse.headers.set('X-XSS-Protection', '1; mode=block');
    supabaseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    supabaseResponse.headers.set(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=()'
    );

    return supabaseResponse;
  } catch {
    // On auth failure, block protected routes (fail-closed)
    if (isProtectedRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    if (isProtectedApi) {
      return NextResponse.json(
        { error: 'Authentifizierungsfehler' },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
