import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client (server actions, server components, API routes).
 *
 * Uses the service-role key when it's configured, so server code keeps working
 * once Row Level Security is enabled — authorization is enforced in code
 * (requireAdminSession, per-action validation), and the browser's public key
 * has no direct access to private tables. The service-role key is not a
 * NEXT_PUBLIC_ variable, so it can never reach a browser bundle.
 *
 * Falls back to the public key only when the service-role key is absent
 * (e.g. a fresh local setup before RLS has been enabled).
 */
export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const key = serviceKey || publicKey;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY environment variables"
    );
  }

  if (!serviceKey && process.env.NODE_ENV === "production") {
    console.warn(
      "[supabase] SUPABASE_SERVICE_ROLE_KEY is not set — server code is using the public key and will fail once RLS is enabled."
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
