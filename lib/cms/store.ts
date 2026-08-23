import { promises as fs } from "fs";
import path from "path";
import { put, list } from "@vercel/blob";
import {
  type CmsStore,
} from "@/lib/cms/types";
import { ensureBlogCategories } from "@/lib/cms/blog-categories";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { isDatabaseConfigured } from "@/lib/supabase/pg";
import {
  readCmsFromSupabase,
  writeCmsToSupabase,
} from "@/lib/supabase/cms";
import { persistMediaFile, deleteStoredMedia, type MediaFolder } from "@/lib/media/storage";
import { hydrateCmsMedia } from "@/lib/media/hydrate-cms";

const LOCAL_PATH = path.join(process.cwd(), "content", "cms.json");
const BLOB_KEY = "cms/store.json";

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function seedFromLocal(): CmsStore {
  // Sem conteúdo mock — o admin preenche categorias, artistas, trabalhos e posts.
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    categories: [],
    items: [],
    artists: [],
    posts: [],
    blogCategories: [],
    testimonials: [],
    clients: [],
    wishlistItems: [],
    siteContent: {},
  };
}

async function readLocal(): Promise<CmsStore | null> {
  try {
    const raw = await fs.readFile(LOCAL_PATH, "utf8");
    return JSON.parse(raw) as CmsStore;
  } catch {
    return null;
  }
}

async function writeLocal(store: CmsStore) {
  await fs.mkdir(path.dirname(LOCAL_PATH), { recursive: true });
  await fs.writeFile(LOCAL_PATH, JSON.stringify(store, null, 2), "utf8");
}

async function readBlob(): Promise<CmsStore | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  try {
    const { blobs } = await list({ prefix: BLOB_KEY, limit: 1 });
    const hit = blobs.find((b) => b.pathname === BLOB_KEY) ?? blobs[0];
    if (!hit) return null;
    const res = await fetch(hit.url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as CmsStore;
  } catch {
    return null;
  }
}

async function writeBlob(store: CmsStore) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;
  await put(BLOB_KEY, JSON.stringify(store, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

let memoryCache: CmsStore | null = null;

function normalizeStore(store: CmsStore): CmsStore {
  return ensureBlogCategories({
    version: 1,
    updatedAt: store.updatedAt || new Date().toISOString(),
    categories: Array.isArray(store.categories) ? store.categories : [],
    items: Array.isArray(store.items) ? store.items : [],
    artists: Array.isArray(store.artists) ? store.artists : [],
    posts: Array.isArray(store.posts) ? store.posts : [],
    blogCategories: Array.isArray(store.blogCategories) ? store.blogCategories : [],
    testimonials: Array.isArray(store.testimonials) ? store.testimonials : [],
    clients: Array.isArray(store.clients) ? store.clients : [],
    wishlistItems: Array.isArray(store.wishlistItems) ? store.wishlistItems : [],
    siteContent: store.siteContent && typeof store.siteContent === "object" ? store.siteContent : {},
  });
}

function isValidStore(store: CmsStore | null | undefined): store is CmsStore {
  return Boolean(store && Array.isArray(store.categories));
}

/**
 * Persistence order:
 * 1. Supabase (when configured) — source of truth in production
 * 2. Vercel Blob
 * 3. Local content/cms.json
 * 4. Empty seed (no mock media)
 */
export async function getCmsStore(): Promise<CmsStore> {
  if (memoryCache) return memoryCache;

  const fromSupabase = await readCmsFromSupabase();
  const fromLocal = await readLocal();
  const remote = isValidStore(fromSupabase) ? normalizeStore(fromSupabase) : null;
  const local = isValidStore(fromLocal) ? normalizeStore(fromLocal) : null;

  const pick =
    remote && local
      ? new Date(local.updatedAt).getTime() > new Date(remote.updatedAt).getTime()
        ? local
        : remote
      : remote || local;

  if (pick) {
    memoryCache = pick;
    if ((isSupabaseConfigured() || isDatabaseConfigured()) && pick === local && remote !== local) {
      await writeCmsToSupabase(pick);
    }
    return memoryCache;
  }

  const fromBlob = await readBlob();
  if (isValidStore(fromBlob)) {
    const normalized = normalizeStore(fromBlob);
    memoryCache = normalized;
    if (isSupabaseConfigured() || isDatabaseConfigured()) {
      await writeCmsToSupabase(normalized);
    }
    return normalized;
  }

  const seeded = seedFromLocal();
  await saveCmsStore(seeded);
  return seeded;
}

export async function saveCmsStore(store: CmsStore) {
  const next = await hydrateCmsMedia(normalizeStore({ ...store, updatedAt: new Date().toISOString() }));
  memoryCache = next;

  const wroteSupabase = await writeCmsToSupabase(next);
  // Keep local/blob as backup when Supabase is off or write failed
  if (!wroteSupabase) {
    await writeLocal(next);
    await writeBlob(next);
  } else {
    // Mirror locally for offline/dev convenience (best-effort)
    try {
      await writeLocal(next);
    } catch {
      /* ignore on serverless without writable FS */
    }
  }

  return next;
}

export async function mutateCmsStore(fn: (store: CmsStore) => CmsStore | Promise<CmsStore>) {
  const current = await getCmsStore();
  const next = await fn(structuredClone(current));
  return saveCmsStore(next);
}

export function newId(prefix: string) {
  return id(prefix);
}

export function getCmsPersistenceMode(): "supabase" | "postgres" | "blob" | "local" {
  if (isSupabaseConfigured()) return "supabase";
  if (isDatabaseConfigured()) return "postgres";
  if (process.env.BLOB_READ_WRITE_TOKEN) return "blob";
  return "local";
}

export async function uploadMedia(file: File, folder: MediaFolder = "uploads"): Promise<string> {
  return persistMediaFile(file, folder);
}

export async function removeMedia(url: string) {
  await deleteStoredMedia(url);
}
