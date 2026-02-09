import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Create a Supabase admin client with SERVICE_ROLE_KEY.
 *
 * CRITICAL: This client bypasses RLS! Only use in:
 * - Server-side API routes (app/api/)
 * - Server Actions
 * - Background jobs
 *
 * NEVER import this file in:
 * - Client Components ("use client")
 * - Any file that could be bundled for the browser
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables'
    );
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Create a new user via admin API.
 * Used when admin creates a new mandant.
 *
 * @param email - User's email
 * @param password - User's password
 * @param metadata - Optional user metadata
 */
export async function createUser(
  email: string,
  password: string,
  metadata?: Record<string, unknown>
) {
  const supabase = createAdminClient();

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm email
    user_metadata: metadata,
  });

  if (error) {
    throw error;
  }

  return data.user;
}

/**
 * Delete a user via admin API.
 *
 * @param userId - The user's UUID
 */
export async function deleteUser(userId: string) {
  const supabase = createAdminClient();

  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (error) {
    throw error;
  }

  return true;
}

/**
 * Update a user's password via admin API.
 *
 * @param userId - The user's UUID
 * @param password - New password
 */
export async function updateUserPassword(userId: string, password: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase.auth.admin.updateUserById(userId, {
    password,
  });

  if (error) {
    throw error;
  }

  return data.user;
}

/**
 * Generate a random alphanumeric password.
 *
 * @param length - Password length (default: 10)
 */
export function generatePassword(length = 10): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
