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
      ? supabase.hasServiceRole
        ? "Salvamentos e uploads vão para o Supabase."
        : "CMS no Postgres. Para fotos/vídeos, cole SUPABASE_SERVICE_ROLE_KEY (Settings → API)."
      : "Configure DATABASE_URL ou SUPABASE_SERVICE_ROLE_KEY.",
  });
}
