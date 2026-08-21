import { NextResponse } from "next/server";
import { getCmsPersistenceMode } from "@/lib/cms/store";
import { getSupabaseStatus } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = getSupabaseStatus();
  return NextResponse.json({
    persistence: getCmsPersistenceMode(),
    supabase,
    ready: supabase.configured,
    hint: supabase.configured
      ? "Salvamentos do admin vão para o Supabase."
      : "Configure NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY e rode supabase/migrations/001_cms.sql",
  });
}
