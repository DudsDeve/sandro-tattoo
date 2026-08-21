"use client";

import { useT } from "@/lib/i18n/LanguageProvider";
import type { BlogPost } from "@/lib/types";

export function BlogCategoryLabel({ category }: { category: BlogPost["category"] }) {
  const t = useT();
  return <>{t.blogCats[category]}</>;
}
