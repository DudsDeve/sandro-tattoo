import type { CmsPost } from "@/lib/cms/types";

export type ExistingPost = {
  title: string;
  slug: string;
  tags: string[];
  category: string;
  seoKeyword: string;
};

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function postsToExisting(posts: CmsPost[]): ExistingPost[] {
  return posts.map((p) => ({
    title: p.title,
    slug: p.slug,
    tags: p.tags || [],
    category: p.category,
    seoKeyword: p.seoKeyword || "",
  }));
}

export function isDuplicate(
  newTitle: string,
  newKeyword: string,
  existingPosts: ExistingPost[],
): { duplicate: boolean; reason: string } {
  const newNorm = normalize(newTitle);
  const newWords = new Set(newNorm.split(" ").filter((w) => w.length > 3));
  const newKw = normalize(newKeyword);

  for (const post of existingPosts) {
    const existNorm = normalize(post.title);
    const existWords = new Set(existNorm.split(" ").filter((w) => w.length > 3));

    const intersection = [...newWords].filter((w) => existWords.has(w));
    const denom = Math.max(newWords.size, existWords.size);
    const overlap = denom ? intersection.length / denom : 0;
    if (overlap > 0.4) {
      return {
        duplicate: true,
        reason: `Word overlap ${Math.round(overlap * 100)}% with "${post.title}"`,
      };
    }

    if (newKw && post.seoKeyword && newKw === normalize(post.seoKeyword)) {
      return { duplicate: true, reason: `Same SEO keyword as "${post.title}"` };
    }

    if (newNorm.length > 12 && existNorm.length > 12) {
      if (newNorm.includes(existNorm) || existNorm.includes(newNorm)) {
        return { duplicate: true, reason: `Title contained in "${post.title}"` };
      }
    }
  }

  return { duplicate: false, reason: "" };
}

export function leastUsedCmsCategory(posts: CmsPost[]): CmsPost["category"] {
  const order = ["tendencias", "estilo", "cuidados", "bastidores"] as const;
  const counts = Object.fromEntries(order.map((c) => [c, 0])) as Record<(typeof order)[number], number>;
  for (const p of posts) {
    if (p.category in counts) counts[p.category as keyof typeof counts]++;
  }
  return order.reduce((a, b) => (counts[a] <= counts[b] ? a : b));
}

export function mapCategoryToCms(raw?: string): CmsPost["category"] {
  const v = (raw || "").toLowerCase();
  if (/aftercare|cuidado|heal|first.?time|pain|cost|question/.test(v)) return "cuidados";
  if (/technique|style|estilo|fine.?line|blackwork|guide|placement|geometric|minimal|watercolor/.test(v))
    return "estilo";
  if (/artist|culture|bastidor|studio|behind|dublin/.test(v)) return "bastidores";
  if (/meaning|ideas|placement|cover/.test(v)) return "tendencias";
  return "tendencias";
}
