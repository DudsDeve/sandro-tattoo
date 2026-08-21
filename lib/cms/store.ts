import { promises as fs } from "fs";
import path from "path";
import { put, list, del } from "@vercel/blob";
import {
  type CmsStore,
} from "@/lib/cms/types";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import {
  readCmsFromSupabase,
  uploadMediaToSupabase,
  writeCmsToSupabase,
} from "@/lib/supabase/cms";

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
  return {
    ...store,
    siteContent: store.siteContent || {},
  };
}

function isValidStore(store: CmsStore | null | undefined): store is CmsStore {
  return Boolean(store && store.version === 1 && Array.isArray(store.categories));
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
  if (isValidStore(fromSupabase)) {
    memoryCache = normalizeStore(fromSupabase);
    return memoryCache;
  }

  const fromBlob = await readBlob();
  if (isValidStore(fromBlob)) {
    const normalized = normalizeStore(fromBlob);
    memoryCache = normalized;
    if (isSupabaseConfigured()) {
      await writeCmsToSupabase(normalized);
    }
    return normalized;
  }

  const fromLocal = await readLocal();
  if (isValidStore(fromLocal)) {
    const normalized = normalizeStore(fromLocal);
    memoryCache = normalized;
    if (isSupabaseConfigured()) {
      await writeCmsToSupabase(normalized);
    }
    return normalized;
  }

  const seeded = seedFromLocal();
  await saveCmsStore(seeded);
  return seeded;
}

export async function saveCmsStore(store: CmsStore) {
  const next = normalizeStore({ ...store, updatedAt: new Date().toISOString() });
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

export function getCmsPersistenceMode(): "supabase" | "blob" | "local" {
  if (isSupabaseConfigured()) return "supabase";
  if (process.env.BLOB_READ_WRITE_TOKEN) return "blob";
  return "local";
}

export async function uploadMedia(file: File): Promise<string> {
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const safe = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const contentType = file.type || "application/octet-stream";

  const fromSupabase = await uploadMediaToSupabase(bytes, safe, contentType);
  if (fromSupabase) return fromSupabase;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`uploads/${safe}`, bytes, {
      access: "public",
      contentType,
    });
    return blob.url;
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, safe), bytes);
  return `/uploads/${safe}`;
}

export async function removeMedia(url: string) {
  if (!url) return;
  if (url.includes("vercel-storage.com") && process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      await del(url);
    } catch {
      /* ignore */
    }
  }
  // Supabase Storage delete can be added when needed (keep file history for now)
}
