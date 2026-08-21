import type { BlogCronState } from "@/lib/cms/blog-cron";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";

const CRON_ID = "state";

export async function readBlogCronFromSupabase(): Promise<BlogCronState | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("cms_blog_cron")
    .select("payload")
    .eq("id", CRON_ID)
    .maybeSingle();

  if (error) {
    console.error("[supabase] read cms_blog_cron:", error.message);
    return null;
  }

  const payload = data?.payload as BlogCronState | null | undefined;
  if (!payload?.date || !payload.slots) return null;
  return payload;
}

export async function writeBlogCronToSupabase(state: BlogCronState): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  const { error } = await supabase.from("cms_blog_cron").upsert(
    {
      id: CRON_ID,
      payload: state,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error) {
    console.error("[supabase] write cms_blog_cron:", error.message);
    return false;
  }
  return true;
}
