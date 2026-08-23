import type { CmsBlogCategory, CmsStore } from "@/lib/cms/types";

export type { CmsBlogCategory };

export const DEFAULT_BLOG_CATEGORIES: CmsBlogCategory[] = [
  { id: "bcat_tendencias", slug: "tendencias", name: "Trends", namePt: "Tendências", order: 0 },
  { id: "bcat_estilo", slug: "estilo", name: "Style", namePt: "Estilo", order: 1 },
  { id: "bcat_cuidados", slug: "cuidados", name: "Aftercare", namePt: "Cuidados", order: 2 },
  { id: "bcat_bastidores", slug: "bastidores", name: "Behind the scenes", namePt: "Bastidores", order: 3 },
  { id: "bcat_ideias", slug: "ideias", name: "Ideas", namePt: "Ideias", order: 4 },
];

const ALIASES: Record<string, string> = {
  ideas: "ideias",
  ideia: "ideias",
  ideias: "ideias",
  inspiration: "ideias",
  inspiracao: "ideias",
  tendencias: "tendencias",
  trends: "tendencias",
  trend: "tendencias",
  estilo: "estilo",
  style: "estilo",
  "style-guide": "estilo",
  "style guide": "estilo",
  cuidados: "cuidados",
  aftercare: "cuidados",
  care: "cuidados",
  "first-time": "primeira-tattoo",
  "first time": "primeira-tattoo",
  primeira: "primeira-tattoo",
  "primeira-tattoo": "primeira-tattoo",
  meanings: "significados",
  meaning: "significados",
  significados: "significados",
  culture: "cultura",
  cultural: "cultura",
  cultura: "cultura",
  placement: "localizacao",
  localizacao: "localizacao",
  location: "localizacao",
  bastidores: "bastidores",
  "behind-the-scenes": "bastidores",
  behind: "bastidores",
  studio: "bastidores",
};

export function slugifyCategory(raw: string) {
  return raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

function titleCase(value: string) {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function resolveCategorySlug(raw?: string) {
  const text = (raw || "").trim();
  if (!text) return "tendencias";
  const lower = text.toLowerCase();
  const slug = slugifyCategory(text);
  return ALIASES[lower] || ALIASES[slug] || slug || "tendencias";
}

export function ensureBlogCategories(store: CmsStore) {
  if (!Array.isArray(store.blogCategories)) store.blogCategories = [];
  for (const def of DEFAULT_BLOG_CATEGORIES) {
    if (!store.blogCategories.some((c) => c.slug === def.slug)) {
      store.blogCategories.push({ ...def });
    }
  }
  for (const post of store.posts || []) {
    const slug = resolveCategorySlug(post.category);
    post.category = slug;
    if (!store.blogCategories.some((c) => c.slug === slug)) {
      const label = titleCase(post.category || slug);
      store.blogCategories.push({
        id: `bcat_${slug}`,
        slug,
        name: label,
        namePt: label,
        order: store.blogCategories.length,
      });
    }
  }
  store.blogCategories.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
  return store;
}

export function upsertBlogCategory(store: CmsStore, raw?: string): CmsBlogCategory {
  ensureBlogCategories(store);
  const slug = resolveCategorySlug(raw);
  const existing = store.blogCategories.find((c) => c.slug === slug);
  if (existing) return existing;
  const label = titleCase((raw || slug).replace(/[-_]+/g, " "));
  const created: CmsBlogCategory = {
    id: `bcat_${slug}`,
    slug,
    name: label,
    namePt: label,
    order: store.blogCategories.length,
  };
  store.blogCategories.push(created);
  return created;
}
