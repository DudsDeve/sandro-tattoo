import { getSupabaseAdmin } from "@/lib/supabase/admin";

export function getTryonSupabase() {
  const client = getSupabaseAdmin();
  if (!client) {
    throw new Error("Supabase is not configured (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY).");
  }
  return client;
}
