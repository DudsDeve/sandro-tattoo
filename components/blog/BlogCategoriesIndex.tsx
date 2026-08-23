"use client";

import { CategoryIcon } from "@/components/blog/blog-ui";
import { CursorLink } from "@/components/ui/CursorLink";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { labelForCategory, type PublicBlogCategory } from "@/lib/blog/category-label";

export function BlogCategoriesIndex({ categories }: { categories: PublicBlogCategory[] }) {
  const { t, locale } = useLanguage();
  return (
    <div className="page-shell mx-auto max-w-4xl px-4 py-16 sm:px-5 md:px-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#c4b07a]">{t.pages.blogLabel}</p>
      <h1 className="font-display mt-4 text-4xl sm:text-5xl">{t.pages.blogCatsTitle}</h1>
      <CursorLink href="/blog" className="mt-4 inline-block text-sm text-[#c4b07a]">
        ← {t.pages.blogBack}
      </CursorLink>
      <ul className="mt-10 divide-y divide-line border-y border-line">
        {categories.map((c) => (
          <li key={c.slug}>
            <CursorLink
              href={`/blog/categories/${c.slug}`}
              className="flex items-center gap-4 py-5 text-ink-secondary transition hover:text-ink"
            >
              <span className="text-[#c4b07a]">
                <CategoryIcon slug={c.slug} />
              </span>
              <span className="flex-1 text-lg">
                {labelForCategory(c.slug, locale, t.blogCats as Record<string, string>, c)}
              </span>
              <span className="font-mono text-sm text-ink-muted">
                {c.count} {t.pages.blogPostsCount}
              </span>
            </CursorLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
