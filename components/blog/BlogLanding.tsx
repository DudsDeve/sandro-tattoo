"use client";

import { useMemo, useState } from "react";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { CategoryIcon } from "@/components/blog/blog-ui";
import { CursorLink } from "@/components/ui/CursorLink";
import { MediaImage } from "@/components/ui/MediaImage";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { labelForCategory, type PublicBlogCategory } from "@/lib/blog/category-label";
import type { BlogPost } from "@/lib/types";
import { cn } from "@/lib/utils";

function minutesOf(readTime: string) {
  const n = parseInt(readTime.replace(/\D/g, ""), 10);
  return Number.isFinite(n) && n > 0 ? n : 8;
}

export function BlogLanding({
  posts,
  heroCover,
  categories,
}: {
  posts: BlogPost[];
  heroCover?: string;
  categories: PublicBlogCategory[];
}) {
  const { t, locale } = useLanguage();
  const [cat, setCat] = useState<"all" | string>("all");
  const [time, setTime] = useState<"all" | "short" | "long">("all");
  const [list, setList] = useState(false);

  const previewCats = categories.slice(0, 5);
  const featured = posts.slice(0, 4);
  const filtered = useMemo(() => {
    return posts.filter((p) => {
      if (cat !== "all" && p.category !== cat) return false;
      const m = minutesOf(p.readTime);
      if (time === "short" && m > 8) return false;
      if (time === "long" && m <= 8) return false;
      return true;
    });
  }, [posts, cat, time]);

  return (
    <div className="-mx-4 sm:-mx-5 md:-mx-8">
      <section className="relative overflow-hidden border-b border-line px-4 py-10 sm:px-5 sm:py-14 md:px-8 md:py-16">
        {heroCover ? (
          <div className="pointer-events-none absolute inset-0">
            <MediaImage
              src={heroCover}
              alt=""
              fill
              priority
              className="object-cover object-center opacity-[0.28] grayscale-[0.35]"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/55" />
            <div className="absolute inset-0 bg-black/25" />
          </div>
        ) : (
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-[58%] opacity-[0.22]"
            style={{
              backgroundImage:
                "radial-gradient(ellipse at 70% 45%, rgba(76,86,52,0.55), transparent 62%), linear-gradient(90deg, #0a0a0a 0%, transparent 28%)",
            }}
          />
        )}
        <svg
          className="pointer-events-none absolute -right-16 top-0 hidden h-full w-[52%] text-[#4c5634] opacity-40 md:block"
          viewBox="0 0 400 520"
          fill="none"
          aria-hidden
        >
          <ellipse cx="250" cy="270" rx="90" ry="210" stroke="currentColor" strokeWidth="1.2" />
          <path d="M220 80c40 40 70 90 55 160-20 90-10 150 40 210" stroke="currentColor" strokeWidth="1" />
          <path
            d="M260 120c30 20 40 70 10 110M240 200c45 15 50 80 8 130M200 240c50 40 80 70 70 140"
            stroke="currentColor"
            strokeWidth="0.8"
          />
          <circle cx="248" cy="168" r="14" stroke="currentColor" />
          <path d="M248 154c10 8 12 22 0 28-12-6-10-20 0-28Z" stroke="currentColor" />
        </svg>

        <div className="relative mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-[1fr_280px] lg:gap-16">
          <div className="max-w-xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#c4b07a]">{t.pages.blogLabel}</p>
            <h1 className="font-display mt-5 text-[clamp(2.4rem,6vw,4.4rem)] leading-[0.98] tracking-[-0.03em] text-ink">
              {t.pages.blogTitleBefore} <em className="italic text-ink">{t.pages.blogTitleEmph}</em>
            </h1>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-ink-secondary">{t.pages.blogLead}</p>
            <a
              href="#destaques"
              className="mt-8 inline-flex items-center gap-2 border border-[#c4b07a]/50 px-5 py-2.5 text-sm text-[#c4b07a] transition hover:bg-[#c4b07a]/10"
            >
              {t.pages.blogExplore}
              <span aria-hidden>→</span>
            </a>
          </div>

          <aside>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#c4b07a]">{t.pages.blogCatsTitle}</p>
            <ul className="mt-5 space-y-1">
              {previewCats.map((c) => (
                <li key={c.slug}>
                  <CursorLink
                    href={`/blog/categories/${c.slug}`}
                    className="flex w-full items-center gap-3 py-2.5 text-left text-sm text-ink-secondary transition hover:text-ink"
                  >
                    <span className="text-[#c4b07a]">
                      <CategoryIcon slug={c.slug} />
                    </span>
                    <span className="flex-1">
                      {labelForCategory(c.slug, locale, t.blogCats as Record<string, string>, c)}
                    </span>
                    <span className="font-mono text-xs text-ink-muted">{c.count}</span>
                  </CursorLink>
                </li>
              ))}
            </ul>
            <CursorLink href="/blog/categories" className="mt-4 inline-flex items-center gap-1 text-sm text-[#c4b07a]">
              {t.pages.blogAllCats} →
            </CursorLink>
          </aside>
        </div>
      </section>

      <section id="destaques" className="mx-auto max-w-6xl px-4 py-14 sm:px-5 md:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl">{t.pages.blogFeatured}</h2>
            <p className="mt-2 text-sm text-ink-muted">{t.pages.blogFeaturedLead}</p>
          </div>
          <a href="#recentes" className="text-sm text-[#c4b07a]">
            {t.pages.blogSeeAll} →
          </a>
        </div>
        {!featured.length ? (
          <p className="text-sm text-ink-muted">{t.pages.blogEmpty}</p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <BlogPostCard key={p.slug} post={p} categories={categories} />
            ))}
          </div>
        )}
      </section>

      <section id="recentes" className="mx-auto max-w-6xl px-4 pb-8 sm:px-5 md:px-8">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="font-display text-3xl sm:text-4xl">{t.pages.blogRecent}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setCat("all")}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm",
                cat === "all" ? "bg-[#c4b07a] text-[#14140f]" : "border border-line text-ink-secondary",
              )}
            >
              {t.pages.blogAll}
            </button>
            <select
              value={cat === "all" ? "" : cat}
              onChange={(e) => setCat(e.target.value || "all")}
              className="rounded-full border border-line bg-transparent px-3 py-1.5 text-sm text-ink-secondary"
            >
              <option value="">{t.pages.blogFilterCat}</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {labelForCategory(c.slug, locale, t.blogCats as Record<string, string>, c)}
                </option>
              ))}
            </select>
            <select
              value={time}
              onChange={(e) => setTime(e.target.value as typeof time)}
              className="rounded-full border border-line bg-transparent px-3 py-1.5 text-sm text-ink-secondary"
            >
              <option value="all">{t.pages.blogFilterTime}</option>
              <option value="short">≤ 8 min</option>
              <option value="long">8+ min</option>
            </select>
            <div className="ml-1 flex overflow-hidden rounded-full border border-line">
              <button
                type="button"
                aria-label="grid"
                onClick={() => setList(false)}
                className={cn("px-2.5 py-1.5", !list ? "bg-[#c4b07a] text-[#14140f]" : "text-ink-muted")}
              >
                ▦
              </button>
              <button
                type="button"
                aria-label="list"
                onClick={() => setList(true)}
                className={cn("px-2.5 py-1.5", list ? "bg-[#c4b07a] text-[#14140f]" : "text-ink-muted")}
              >
                ☰
              </button>
            </div>
          </div>
        </div>
        {!filtered.length ? (
          <p className="text-sm text-ink-muted">{t.pages.blogEmpty}</p>
        ) : (
          <div className={cn("gap-8", list ? "flex flex-col" : "grid sm:grid-cols-2 lg:grid-cols-4")}>
            {filtered.map((p) => (
              <BlogPostCard key={`r-${p.slug}`} post={p} list={list} categories={categories} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
