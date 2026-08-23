"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { labelForCategory, type PublicBlogCategory } from "@/lib/blog/category-label";

export function BlogCategoryLabel({
  category,
  categories = [],
}: {
  category: string;
  categories?: PublicBlogCategory[];
}) {
  const { t, locale } = useLanguage();
  const cat = categories.find((c) => c.slug === category);
  return <>{labelForCategory(category, locale, t.blogCats as Record<string, string>, cat)}</>;
}
