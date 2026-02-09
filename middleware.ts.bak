import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Skip middleware completely if Supabase is not configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  try {
    // Dynamic import to avoid edge runtime issues
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

    const { pathname } = request.nextUrl;

    // Protected routes - require authentication
    const isProtectedRoute = pathname.startsWith('/dashboard') ||
      pathname.startsWith('/mandanten') ||
      pathname.startsWith('/objekte') ||
      pathname.startsWith('/auswertungen') ||
      pathname.startsWith('/ankaufsprofile') ||
      pathname.startsWith('/anfragen');

    // Auth routes - redirect to dashboard if already logged in
    const isAuthRoute = pathname.startsWith('/login') ||
      pathname.startsWith('/reset-password');

    if (isProtectedRoute && !user) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    if (isAuthRoute && user) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  } catch {
    // If anything fails, allow the request to continue
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
