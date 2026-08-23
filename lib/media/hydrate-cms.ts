import type { CmsStore } from "@/lib/cms/types";
import { persistGeneratedImage, type MediaFolder } from "@/lib/media/storage";

async function hydrate(value: string | undefined, folder: MediaFolder): Promise<string> {
  if (!value) return "";
  if (value.startsWith("data:") || value.startsWith("/uploads/")) {
    try {
      return await persistGeneratedImage(value, folder);
    } catch (e) {
      console.error("[media] hydrate:", e instanceof Error ? e.message : e);
      return value;
    }
  }
  return value;
}

/** Garante que o JSON do CMS só tenha URLs, nunca bytes/base64. */
export async function hydrateCmsMedia(store: CmsStore): Promise<CmsStore> {
  const next = structuredClone(store);

  for (const c of next.categories) {
    c.image = await hydrate(c.image, "categories");
    if (c.video) c.video = await hydrate(c.video, "categories");
  }
  for (const item of next.items) {
    item.image = await hydrate(item.image, "gallery");
    if (item.video) item.video = await hydrate(item.video, "gallery");
  }
  for (const a of next.artists) {
    a.image = await hydrate(a.image, "artists");
    for (const w of a.works) {
      w.image = await hydrate(w.image, "gallery");
      if (w.video) w.video = await hydrate(w.video, "gallery");
    }
  }
  for (const p of next.posts) {
    p.cover = await hydrate(p.cover, "blog");
  }
  for (const t of next.testimonials) {
    if (t.image) t.image = await hydrate(t.image, "testimonials");
    if (t.video) t.video = await hydrate(t.video, "testimonials");
  }
  for (const c of next.clients) {
    c.ideaImages = await Promise.all(c.ideaImages.map((url) => hydrate(url, "booking")));
  }
  if (next.siteContent) {
    for (const [key, value] of Object.entries(next.siteContent)) {
      next.siteContent[key] = await hydrate(value, "site");
    }
  }
  return next;
}
