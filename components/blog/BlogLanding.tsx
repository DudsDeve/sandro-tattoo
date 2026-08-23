"use client";

import { useMemo, useState } from "react";
import { CursorLink } from "@/components/ui/CursorLink";
import { LocalizedDate } from "@/components/ui/LocalizedDate";
import { MediaImage } from "@/components/ui/MediaImage";
import { useT } from "@/lib/i18n/LanguageProvider";
import type { BlogPost } from "@/lib/types";
import { cn } from "@/lib/utils";

const CATS: BlogPost["category"][] = ["tendencias", "estilo", "cuidados", "bastidores"];

function minutesOf(readTime: string) {
  const n = parseInt(readTime.replace(/\D/g, ""), 10);
  return Number.isFinite(n) && n > 0 ? n : 8;
}

function IconSpark() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
    </svg>
  );
}
function IconPen() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}
function IconGem() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M6 3h12l4 7-10 11L2 10Z" />
    </svg>
  );
}
function IconHeart() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M20 8.5c0 5-8 11-8 11S4 13.5 4 8.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 8 2.5Z" />
    </svg>
  );
}
function IconClock() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6l4 2" />
    </svg>
  );
}
function IconCal() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </svg>
  );
}

const CAT_ICON: Record<BlogPost["category"], typeof IconSpark> = {
  tendencias: IconSpark,
  estilo: IconGem,
  cuidados: IconHeart,
  bastidores: IconPen,
};

function ArticleCard({ post, list }: { post: BlogPost; list?: boolean }) {
  const t = useT();
  const CatIcon = CAT_ICON[post.category];
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
          <CatIcon />
          <span className="hidden sm:inline">{t.blogCats[post.category]}</span>
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

export function BlogLanding({ posts }: { posts: BlogPost[] }) {
  const t = useT();
  const [cat, setCat] = useState<"all" | BlogPost["category"]>("all");
  const [time, setTime] = useState<"all" | "short" | "long">("all");
  const [list, setList] = useState(false);

  const counts = useMemo(() => {
    const map = Object.fromEntries(CATS.map((c) => [c, 0])) as Record<BlogPost["category"], number>;
    for (const p of posts) map[p.category] = (map[p.category] || 0) + 1;
    return map;
  }, [posts]);

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
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-[58%] opacity-[0.22]"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 70% 45%, rgba(76,86,52,0.55), transparent 62%), linear-gradient(90deg, #0a0a0a 0%, transparent 28%)",
          }}
        />
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
              {CATS.map((c) => {
                const Icon = CAT_ICON[c];
                return (
                  <li key={c}>
                    <button
                      type="button"
                      onClick={() => {
                        setCat(c);
                        document.getElementById("recentes")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="flex w-full items-center gap-3 py-2.5 text-left text-sm text-ink-secondary transition hover:text-ink"
                    >
                      <span className="text-[#c4b07a]">
                        <Icon />
                      </span>
                      <span className="flex-1">{t.blogCats[c]}</span>
                      <span className="font-mono text-xs text-ink-muted">{counts[c]}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              onClick={() => {
                setCat("all");
                document.getElementById("recentes")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="mt-4 inline-flex items-center gap-1 text-sm text-[#c4b07a]"
            >
              {t.pages.blogAllCats} →
            </button>
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
              <ArticleCard key={p.slug} post={p} />
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
              onChange={(e) => setCat((e.target.value || "all") as typeof cat)}
              className="rounded-full border border-line bg-transparent px-3 py-1.5 text-sm text-ink-secondary"
            >
              <option value="">{t.pages.blogFilterCat}</option>
              {CATS.map((c) => (
                <option key={c} value={c}>
                  {t.blogCats[c]}
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
              <ArticleCard key={`r-${p.slug}`} post={p} list={list} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
