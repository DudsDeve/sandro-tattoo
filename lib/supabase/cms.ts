import type { CmsStore } from "@/lib/cms/types";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";

const STORE_ID = "main";

export async function readCmsFromSupabase(): Promise<CmsStore | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("cms_store")
    .select("payload")
    .eq("id", STORE_ID)
    .maybeSingle();

  if (error) {
    console.error("[supabase] read cms_store:", error.message);
    return null;
  }

  const payload = data?.payload as CmsStore | null | undefined;
  if (!payload || typeof payload !== "object") return null;
  if (!Array.isArray(payload.categories)) return null;
  return {
    ...payload,
    siteContent: payload.siteContent || {},
  };
}

export async function writeCmsToSupabase(store: CmsStore): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  const { error } = await supabase.from("cms_store").upsert(
    {
      id: STORE_ID,
      payload: store,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error) {
    console.error("[supabase] write cms_store:", error.message);
    return false;
  }

  // Keep site_content flat table in sync for SQL / future queries
  const entries = Object.entries(store.siteContent || {});
  if (entries.length) {
    const rows = entries.map(([field_id, value]) => ({
      field_id,
      value,
      updated_at: new Date().toISOString(),
    }));
    const { error: siteErr } = await supabase.from("site_content").upsert(rows, {
      onConflict: "field_id",
    });
    if (siteErr) {
      console.error("[supabase] sync site_content:", siteErr.message);
    }
  }

  return true;
}

export async function uploadMediaToSupabase(
  bytes: Buffer,
  filename: string,
  contentType: string,
): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const bucket = process.env.SUPABASE_MEDIA_BUCKET || "media";
  const path = `uploads/${filename}`;

  const { error } = await supabase.storage.from(bucket).upload(path, bytes, {
    contentType,
    upsert: true,
  });

  if (error) {
    console.error("[supabase] upload media:", error.message);
    return null;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
