export type PublicBlogCategory = {
  slug: string;
  name: string;
  namePt: string;
  count: number;
};

export function labelForCategory(
  slug: string,
  locale: "en" | "pt",
  dict: Record<string, string>,
  cat?: Pick<PublicBlogCategory, "name" | "namePt">,
) {
  if (dict[slug]) return dict[slug];
  if (cat) return locale === "pt" ? cat.namePt || cat.name : cat.name;
  return slug.replace(/-/g, " ");
}
