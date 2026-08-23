import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isDatabaseConfigured } from "@/lib/supabase/pg";

let adminClient: SupabaseClient | null = null;

function env(name: string) {
  const value = process.env[name]?.trim();
  return value || undefined;
}

export function supabaseUrl() {
  return env("NEXT_PUBLIC_SUPABASE_URL") || env("SUPABASE_URL");
}

export function supabaseServiceKey() {
  return (
    env("SUPABASE_SERVICE_ROLE_KEY") ||
    env("SUPABASE_SERVICE_KEY") ||
    env("SUPABASE_SECRET_KEY")
  );
}

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl() && supabaseServiceKey());
}

/** Server-only client with service role (full write access to CMS tables). */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (adminClient) return adminClient;

  adminClient = createClient(supabaseUrl()!, supabaseServiceKey()!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return adminClient;
}

export function getSupabaseStatus() {
  const hasKey = Boolean(supabaseServiceKey());
  return {
    configured: isSupabaseConfigured() || isDatabaseConfigured(),
    url: supabaseUrl() || null,
    hasServiceRole: hasKey,
    hasDatabase: isDatabaseConfigured(),
    mediaBucket: env("SUPABASE_MEDIA_BUCKET") || "media",
  };
}
