"use client";

import { CursorLink } from "@/components/ui/CursorLink";
import { LocalizedDate } from "@/components/ui/LocalizedDate";
import { MediaImage } from "@/components/ui/MediaImage";
import { CategoryIcon, IconCal, IconClock, minutesOf } from "@/components/blog/blog-ui";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { labelForCategory, type PublicBlogCategory } from "@/lib/blog/category-label";
import type { BlogPost } from "@/lib/types";
import { cn } from "@/lib/utils";

export function BlogPostCard({
  post,
  list,
  categories = [],
}: {
  post: BlogPost;
  list?: boolean;
  categories?: PublicBlogCategory[];
}) {
  const { t, locale } = useLanguage();
  const cat = categories.find((c) => c.slug === post.category);
  const label = labelForCategory(post.category, locale, t.blogCats as Record<string, string>, cat);

  return (
    <CursorLink href={`/blog/${post.slug}`} className={cn("group block", list && "grid gap-5 sm:grid-cols-[220px_1fr]")}>
      <div className={cn("relative overflow-hidden bg-[#121410]", list ? "aspect-[16/11] sm:aspect-[4/3]" : "aspect-[16/11]")}>
        <MediaImage
          src={post.cover}
          alt={post.title}
          fill
          className="object-cover transition duration-700 group-hover:scale-[1.04]"
          sizes={list ? "40vw" : "25vw"}
        />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-[#c4b07a]">
          <CategoryIcon slug={post.category} />
          <span className="hidden sm:inline">{label}</span>
        </span>
      </div>
      <div className={cn(list ? "flex flex-col justify-center" : "pt-4")}>
        <p className="flex flex-wrap items-center gap-3 text-[11px] text-ink-muted">
          <span className="inline-flex items-center gap-1">
            <IconClock /> {minutesOf(post.readTime)} {t.pages.blogMinRead}
          </span>
          {post.date ? (
            <span className="inline-flex items-center gap-1">
              <IconCal /> <LocalizedDate iso={post.date} />
            </span>
          ) : null}
        </p>
        <h3 className="font-display mt-3 text-[1.35rem] leading-tight text-ink transition group-hover:text-[#c4b07a] sm:text-[1.5rem]">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-secondary">{post.excerpt}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="flex items-center gap-2 text-xs text-ink-muted">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#4c5634] font-mono text-[10px] text-[#e8e4dc]">
              V
            </span>
            {t.pages.blogBy} {t.pages.blogAuthor}
          </span>
          <span className="text-ink-muted" aria-hidden>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M7 4h10v16l-5-3-5 3Z" />
            </svg>
          </span>
        </div>
      </div>
    </CursorLink>
  );
}
