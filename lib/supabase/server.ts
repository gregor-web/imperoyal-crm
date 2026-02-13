import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Create a Supabase client for use in Server Components, Server Actions, and Route Handlers.
 * Uses the anon key - access is controlled via RLS policies.
 * Handles cookie management for session persistence.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  );
}

/**
 * Get the currently authenticated user.
 * Returns null if not authenticated.
 */
export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// NOTE: getSession() was removed for security reasons.
// Always use getUser() which validates the session server-side.
// getSession() only reads from cookies without verification and is unsafe.
