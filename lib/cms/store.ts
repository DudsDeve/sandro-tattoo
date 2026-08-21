import { promises as fs } from "fs";
import path from "path";
import { put, list, del } from "@vercel/blob";
import { artists, gallery, posts, specialties } from "@/lib/data/content";
import {
  emptyStore,
  type CmsArtist,
  type CmsCategory,
  type CmsPost,
  type CmsStore,
  type CmsWorkItem,
} from "@/lib/cms/types";

const LOCAL_PATH = path.join(process.cwd(), "content", "cms.json");
const BLOB_KEY = "cms/store.json";

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function seedFromLocal(): CmsStore {
  const categories: CmsCategory[] = specialties.map((s, i) => ({
    id: id("cat"),
    slug: s.slug,
    name: s.name,
    description: s.description,
    image: s.image,
    order: i,
  }));

  const cmsArtists: CmsArtist[] = artists.map((a) => ({
    id: id("art"),
    slug: a.slug,
    name: a.name,
    role: a.role,
    specialty: a.specialty,
    specialtyIds: a.specialties,
    years: a.years,
    bio: a.bio,
    bioLong: a.bioLong,
    instagram: a.instagram,
    image: a.image,
    available: a.available,
    works: a.works.map((image, i) => ({
      id: id("aw"),
      title: `Trabalho ${i + 1}`,
      image,
    })),
  }));

  const items: CmsWorkItem[] = gallery.map((g) => {
    const category = categories.find((c) => c.slug === g.style);
    const artist = cmsArtists.find((a) => a.slug === g.artistSlug);
    return {
      id: g.id || id("item"),
      title: g.title,
      categoryId: category?.id ?? categories[0]?.id ?? "",
      artistId: artist?.id,
      image: g.image,
      hours: g.hours,
      bodyPart: g.bodyPart,
    };
  });

  const cmsPosts: CmsPost[] = posts.map((p) => ({
    ...p,
    id: id("post"),
    seoTitle: p.title,
    seoDescription: p.excerpt,
    published: true,
  }));

  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    categories,
    items,
    artists: cmsArtists,
    posts: cmsPosts,
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

export async function getCmsStore(): Promise<CmsStore> {
  if (memoryCache) return memoryCache;

  const fromBlob = await readBlob();
  if (fromBlob?.categories?.length) {
    memoryCache = fromBlob;
    return fromBlob;
  }

  const fromLocal = await readLocal();
  if (fromLocal?.categories?.length) {
    memoryCache = fromLocal;
    return fromLocal;
  }

  const seeded = seedFromLocal();
  await saveCmsStore(seeded);
  return seeded;
}

export async function saveCmsStore(store: CmsStore) {
  const next = { ...store, updatedAt: new Date().toISOString() };
  memoryCache = next;
  await writeLocal(next);
  await writeBlob(next);
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

export async function uploadMedia(file: File): Promise<string> {
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const safe = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`uploads/${safe}`, bytes, {
      access: "public",
      contentType: file.type || "application/octet-stream",
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
}
