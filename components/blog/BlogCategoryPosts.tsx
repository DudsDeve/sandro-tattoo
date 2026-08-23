"use client";

import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { CursorLink } from "@/components/ui/CursorLink";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { labelForCategory, type PublicBlogCategory } from "@/lib/blog/category-label";
import type { BlogPost } from "@/lib/types";

export function BlogCategoryPosts({
  category,
  categories,
  posts,
}: {
  category: PublicBlogCategory;
  categories: PublicBlogCategory[];
  posts: BlogPost[];
}) {
  const { t, locale } = useLanguage();
  const label = labelForCategory(category.slug, locale, t.blogCats as Record<string, string>, category);

  return (
    <div className="page-shell mx-auto max-w-6xl px-4 py-16 sm:px-5 md:px-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#c4b07a]">{t.pages.blogCatsTitle}</p>
      <h1 className="font-display mt-4 text-4xl sm:text-5xl">{label}</h1>
      <p className="mt-3 text-sm text-ink-muted">
        {posts.length} {t.pages.blogPostsCount}
      </p>
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-[#c4b07a]">
        <CursorLink href="/blog">← {t.pages.blogBack}</CursorLink>
        <CursorLink href="/blog/categories">{t.pages.blogAllCats} →</CursorLink>
      </div>
      {!posts.length ? (
        <p className="mt-12 text-sm text-ink-muted">{t.pages.blogCatEmpty}</p>
      ) : (
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <BlogPostCard key={p.slug} post={p} categories={categories} />
          ))}
        </div>
      )}
    </div>
  );
}
