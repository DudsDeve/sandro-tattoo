import type { CmsPost } from "@/lib/cms/types";
import { getCmsStore } from "@/lib/cms/store";

export type ExistingTopics = {
  titles: string[];
  slugs: string[];
  categories: string[];
  topics: string[];
};

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function getExistingTopics(): Promise<ExistingTopics> {
  const store = await getCmsStore();
  const posts = store.posts || [];
  return {
    titles: posts.map((p) => p.title),
    slugs: posts.map((p) => p.slug),
    categories: posts.map((p) => p.category),
    topics: posts.map((p) => `${p.title} — ${p.excerpt}`),
  };
}

export function isDuplicateTitle(newTitle: string, existingTitles: string[]): boolean {
  const newNorm = normalize(newTitle);
  if (!newNorm) return false;

  return existingTitles.some((existing) => {
    const existNorm = normalize(existing);
    if (existNorm === newNorm) return true;
    const newWords = new Set(newNorm.split(" ").filter((w) => w.length > 3));
    const existWords = new Set(existNorm.split(" ").filter((w) => w.length > 3));
    if (!newWords.size || !existWords.size) return false;
    const intersection = [...newWords].filter((w) => existWords.has(w));
    const overlap = intersection.length / Math.max(newWords.size, existWords.size);
    return overlap > 0.6;
  });
}

export function leastUsedCategory(posts: CmsPost[]): string {
  const order = ["tendencias", "estilo", "cuidados", "bastidores"] as const;
  const counts = Object.fromEntries(order.map((c) => [c, 0])) as Record<string, number>;
  for (const p of posts) {
    if (counts[p.category] != null) counts[p.category]++;
  }
  return order.reduce((a, b) => (counts[a] <= counts[b] ? a : b));
}

export function mapCategoryToCms(raw?: string): CmsPost["category"] {
  const v = (raw || "").toLowerCase();
  if (/aftercare|cuidado|heal/.test(v)) return "cuidados";
  if (/technique|style|estilo|fine.?line|blackwork|guide/.test(v)) return "estilo";
  if (/artist|culture|bastidor|studio|behind/.test(v)) return "bastidores";
  return "tendencias";
}
