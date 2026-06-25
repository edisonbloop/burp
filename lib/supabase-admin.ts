import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client for privileged server-side operations
 * (e.g. reading a member's email via auth.admin). Returns null when the
 * SUPABASE_SERVICE_ROLE_KEY env var isn't configured, so callers can treat
 * admin-only features (like sending emails) as best-effort.
 */
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
