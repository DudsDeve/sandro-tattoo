import { persistMediaBytes } from "@/lib/media/storage";
import type { CmsStore } from "@/lib/cms/types";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { getPgPool, isDatabaseConfigured } from "@/lib/supabase/pg";

const STORE_ID = "main";

function normalizePayload(payload: unknown): CmsStore | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  const data = payload as Partial<CmsStore>;
  const hasShape =
    data.version === 1 ||
    Array.isArray(data.categories) ||
    Array.isArray(data.artists) ||
    Array.isArray(data.items);
  if (!hasShape) return null;
  return {
    version: 1,
    updatedAt: data.updatedAt || new Date().toISOString(),
    categories: Array.isArray(data.categories) ? data.categories : [],
    items: Array.isArray(data.items) ? data.items : [],
    artists: Array.isArray(data.artists) ? data.artists : [],
    posts: Array.isArray(data.posts) ? data.posts : [],
    blogCategories: Array.isArray(data.blogCategories) ? data.blogCategories : [],
    testimonials: Array.isArray(data.testimonials) ? data.testimonials : [],
    clients: Array.isArray(data.clients) ? data.clients : [],
    wishlistItems: Array.isArray(data.wishlistItems) ? data.wishlistItems : [],
    waitingVideos: Array.isArray(data.waitingVideos) ? data.waitingVideos : [],
    siteContent: data.siteContent || {},
  };
}

async function readCmsFromPg(): Promise<CmsStore | null> {
  const pool = getPgPool();
  if (!pool) return null;
  try {
    const { rows } = await pool.query<{ payload: CmsStore }>(
      "select payload from public.cms_store where id = $1",
      [STORE_ID],
    );
    return normalizePayload(rows[0]?.payload);
  } catch (e) {
    console.error("[postgres] read cms_store:", e instanceof Error ? e.message : e);
    return null;
  }
}

async function writeCmsToPg(store: CmsStore): Promise<boolean> {
  const pool = getPgPool();
  if (!pool) return false;
  try {
    await pool.query(
      `insert into public.cms_store (id, payload, updated_at)
       values ($1, $2::jsonb, now())
       on conflict (id) do update set payload = excluded.payload, updated_at = now()`,
      [STORE_ID, JSON.stringify(store)],
    );
    const entries = Object.entries(store.siteContent || {});
    for (const [field_id, value] of entries) {
      await pool.query(
        `insert into public.site_content (field_id, value, updated_at)
         values ($1, $2, now())
         on conflict (field_id) do update set value = excluded.value, updated_at = now()`,
        [field_id, value],
      );
    }
    return true;
  } catch (e) {
    console.error("[postgres] write cms_store:", e instanceof Error ? e.message : e);
    return false;
  }
}

export async function readCmsFromSupabase(): Promise<CmsStore | null> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { data, error } = await supabase
        .from("cms_store")
        .select("payload")
        .eq("id", STORE_ID)
        .maybeSingle();

      if (error) {
        console.error("[supabase] read cms_store:", error.message);
      } else {
        const parsed = normalizePayload(data?.payload);
        if (parsed) return parsed;
      }
    }
  }
  if (isDatabaseConfigured()) return readCmsFromPg();
  return null;
}

export async function writeCmsToSupabase(store: CmsStore): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    if (supabase) {
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
      } else {
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
    }
  }
  if (isDatabaseConfigured()) return writeCmsToPg(store);
  return false;
}

export async function uploadMediaToSupabase(
  bytes: Buffer,
  filename: string,
  contentType: string,
): Promise<{ url: string } | { error: string }> {
  try {
    const url = await persistMediaBytes(bytes, filename, contentType, "uploads");
    return { url };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Falha no upload" };
  }
}
