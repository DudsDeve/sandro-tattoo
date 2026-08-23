"use client";

import { useEffect, useMemo, useState } from "react";
import { CursorLink } from "@/components/ui/CursorLink";
import { LocalizedDate } from "@/components/ui/LocalizedDate";
import { MediaImage } from "@/components/ui/MediaImage";
import {
  bulletLines,
  isBulletBlock,
  parseArticle,
  splitBlocks,
  type ArticleSection,
} from "@/lib/blog/parse-article";
import { useT } from "@/lib/i18n/LanguageProvider";
import type { BlogPost } from "@/lib/types";
import { cn, whatsappLink } from "@/lib/utils";

const ICONS = [
  "M12 3c2 4 4 6 8 7-4 1-6 3-8 7-2-4-4-6-8-7 4-1 6-3 8-7Z",
  "M4 12h16M12 4v16M7 7l10 10M17 7 7 17",
  "M12 5c4 3 6 6 6 9a6 6 0 1 1-12 0c0-3 2-6 6-9Z",
  "M6 18c4-8 8-8 12 0M8 8c2 1 6 1 8 0",
];

function GoldIcon({ i }: { i: number }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c4b07a" strokeWidth="1.4">
      <path d={ICONS[i % ICONS.length]} />
    </svg>
  );
}

function ShareRow({ title }: { title: string }) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  const url = typeof window === "undefined" ? "" : window.location.href;
  const tweet = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const pin = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(title)}`;

  return (
    <div className="flex items-center gap-2" aria-label={t.pages.blogShare}>
      <a href={tweet} target="_blank" rel="noreferrer" className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-[#c4b07a]">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>
      <a href={pin} target="_blank" rel="noreferrer" className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-[#c4b07a]">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.5 2 2 6.2 2 11.4c0 3.7 2.2 6.9 5.4 8.2-.1-.7-.2-1.8 0-2.6.2-.7 1.3-5.4 1.3-5.4s-.3-.7-.3-1.6c0-1.5.9-2.6 2-2.6.9 0 1.4.7 1.4 1.5 0 .9-.6 2.3-.9 3.5-.3 1.1.5 1.9 1.6 1.9 1.9 0 3.2-2.4 3.2-5.3 0-2.2-1.5-3.8-4.2-3.8-3.1 0-5 2.3-5 4.8 0 .9.3 1.8.7 2.4.1.1.1.2.1.3l-.3 1.1c0 .2-.1.3-.3.2-1.2-.5-1.8-1.9-1.8-3.5 0-2.9 2.5-6.4 7.4-6.4 3.9 0 6.5 2.8 6.5 5.8 0 4-2.2 7-5.5 7-1.1 0-2.1-.6-2.5-1.3l-.7 2.6c-.2.9-.8 2-1.2 2.7 1 .3 2.1.4 3.2.4 5.5 0 10-4.5 10-10S17.5 2 12 2z" />
        </svg>
      </a>
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(window.location.href);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        }}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-[#c4b07a]"
        aria-label={copied ? "ok" : t.pages.blogShare}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M10 13a5 5 0 0 0 7.5.5l1.4-1.4a5 5 0 0 0-7-7L10.4 7" />
          <path d="M14 11a5 5 0 0 0-7.5-.5L5 12a5 5 0 0 0 7 7l1.5-1.5" />
        </svg>
      </button>
    </div>
  );
}

function BodyBlocks({ body }: { body: string }) {
  return (
    <div className="space-y-5 text-[15px] leading-[1.85] text-ink-secondary sm:text-base">
      {splitBlocks(body).map((block, i) => {
        if (isListBlock(block)) {
          const items = listItems(block);
          if (items.length >= 3) {
            return (
              <div key={i} className="rounded-xl border border-line bg-[#0f0f0d] px-5 py-5">
                <ul className="space-y-3">
                  {items.map((item) => (
                    <li key={item} className="flex gap-3 text-sm text-ink-secondary">
                      <span className="mt-0.5 text-[#c4b07a]">✦</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          }
          return (
            <ul key={i} className="list-disc space-y-2 pl-5">
              {items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }
        if (block.startsWith("### ")) {
          return (
            <h3 key={i} className="font-display pt-2 text-2xl text-ink">
              {block.replace(/^###\s+/, "")}
            </h3>
          );
        }
        return <p key={i}>{block}</p>;
      })}
    </div>
  );
}

function ArticleSectionView({ section, index, asCard }: { section: ArticleSection; index: number; asCard?: boolean }) {
  if (asCard) {
    return (
      <article id={section.id} className="scroll-mt-28 rounded-xl border border-line bg-[#0c0c0a] p-5">
        <GoldIcon i={index} />
        <h3 className="font-display mt-4 text-xl text-ink">{section.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{section.body.replace(/\n/g, " ")}</p>
      </article>
    );
  }
  return (
    <section id={section.id} className="scroll-mt-28">
      <h2 className="font-display mb-5 text-[1.85rem] text-ink sm:text-3xl">{section.title}</h2>
      <BodyBlocks body={section.body} />
    </section>
  );
}

export function BlogArticle({
  post,
  related,
  prev,
  next,
}: {
  post: BlogPost;
  related: BlogPost[];
  prev: BlogPost | null;
  next: BlogPost | null;
}) {
  const t = useT();
  const { intro, sections } = useMemo(() => parseArticle(post.content || ""), [post.content]);
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const bookHref = whatsappLink(`I read “${post.title}” on the blog and would like to book a session.`);
  const shortCards = sections.filter((s) => s.body.length > 0 && s.body.length < 260);
  const longSections = sections.filter((s) => !(s.body.length > 0 && s.body.length < 260));
  const cardRow = shortCards.slice(0, 4);
  const restShort = shortCards.slice(4);
  const useGrid = cardRow.length >= 3;
  const toc = sections.slice(0, 6);

  useEffect(() => {
    const ids = sections.map((s) => s.id);
    if (!ids.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (vis?.target.id) setActive(vis.target.id);
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0.1, 0.4] },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [sections]);

  return (
    <article className="page-shell">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-16">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#c4b07a]">
            {t.pages.blogLabel} · {t.blogCats[post.category]}
          </p>
          <h1 className="font-display mt-4 max-w-3xl text-[clamp(2rem,5vw,3.4rem)] leading-[1.05] tracking-[-0.03em]">
            {post.title}
          </h1>
          {post.excerpt ? (
            <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-ink-secondary sm:text-base">{post.excerpt}</p>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#4c5634] font-mono text-sm text-[#e8e4dc]">
                V
              </span>
              <div className="text-sm">
                <p className="text-ink">
                  {t.pages.blogBy} {t.pages.blogAuthor}
                </p>
                <p className="text-xs text-ink-muted">
                  {post.date ? <LocalizedDate iso={post.date} /> : null}
                  {post.date ? " · " : ""}
                  {post.readTime}
                </p>
              </div>
            </div>
            <ShareRow title={post.title} />
          </div>

          <div className="relative my-8 aspect-[16/8] overflow-hidden rounded-xl bg-[#121410] sm:aspect-[21/9]">
            <MediaImage src={post.cover} alt="" fill className="object-cover" priority />
          </div>

          {intro ? <div className="mb-12"><BodyBlocks body={intro} /></div> : null}

          {useGrid ? (
            <div className="mb-12 grid gap-4 sm:grid-cols-2">
              {cardRow.map((s, i) => (
                <ArticleSectionView key={s.id} section={s} index={i} asCard />
              ))}
            </div>
          ) : (
            cardRow.map((s, i) => (
              <div key={s.id} className="mb-10">
                <ArticleSectionView section={s} index={i} />
              </div>
            ))
          )}

          {[...restShort, ...longSections].map((s, i) => (
            <div key={s.id} className="mb-12">
              <ArticleSectionView section={s} index={i + 4} />
            </div>
          ))}

          <div className="my-12 flex flex-col items-start justify-between gap-4 rounded-lg border border-line px-5 py-4 sm:flex-row sm:items-center">
            <p className="flex items-start gap-3 text-sm text-ink-secondary">
              <span className="mt-0.5 text-[#c4b07a]">✦</span>
              <span>{t.pages.blogQuote}</span>
            </p>
            <a
              href={bookHref}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 rounded-md bg-[#c4b07a] px-4 py-2 text-sm text-[#14140f]"
            >
              {t.pages.blogBook}
            </a>
          </div>

          <nav className="flex flex-col justify-between gap-6 border-t border-line pt-8 sm:flex-row">
            {prev ? (
              <CursorLink href={`/blog/${prev.slug}`} className="max-w-xs">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c4b07a]">{t.pages.blogPrev}</p>
                <p className="font-display mt-2 text-xl">{prev.title}</p>
              </CursorLink>
            ) : (
              <span />
            )}
            {next ? (
              <CursorLink href={`/blog/${next.slug}`} className="max-w-xs sm:text-right">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c4b07a]">{t.pages.blogNext}</p>
                <p className="font-display mt-2 text-xl">{next.title}</p>
              </CursorLink>
            ) : null}
          </nav>
        </div>

        <aside className="space-y-10 lg:sticky lg:top-28 lg:self-start">
          {toc.length > 0 ? (
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#c4b07a]">{t.pages.blogOnThisPage}</p>
              <ol className="mt-4 space-y-3">
                {toc.map((s, i) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className={cn(
                        "flex gap-3 text-sm transition",
                        active === s.id ? "text-ink" : "text-ink-muted hover:text-ink-secondary",
                      )}
                    >
                      <span className="font-mono text-[11px] text-[#c4b07a]">{String(i + 1).padStart(2, "0")}</span>
                      <span>{s.title}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          {related.length > 0 ? (
            <div>
              <p className="font-display text-2xl">{t.pages.blogRelated}</p>
              <ul className="mt-5 space-y-5">
                {related.map((r) => (
                  <li key={r.slug}>
                    <CursorLink href={`/blog/${r.slug}`} className="grid grid-cols-[72px_1fr] gap-3">
                      <span className="relative h-[72px] w-[72px] overflow-hidden rounded-md bg-[#121410]">
                        <MediaImage src={r.cover} alt="" fill className="object-cover" sizes="72px" />
                      </span>
                      <span>
                        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#c4b07a]">
                          {t.blogCats[r.category]}
                        </span>
                        <span className="font-display mt-1 block text-[15px] leading-snug">{r.title}</span>
                        <span className="mt-1 block text-[11px] text-ink-muted">{r.readTime}</span>
                      </span>
                    </CursorLink>
                  </li>
                ))}
              </ul>
              <CursorLink href="/blog" className="mt-5 inline-flex items-center gap-1 text-sm text-[#c4b07a]">
                {t.pages.blogViewAll} →
              </CursorLink>
            </div>
          ) : null}

          <div className="relative overflow-hidden rounded-xl border border-line bg-[#12140f] p-6">
            <p className="font-display relative z-[1] text-2xl leading-tight">{t.pages.blogReady}</p>
            <a
              href={bookHref}
              target="_blank"
              rel="noreferrer"
              className="relative z-[1] mt-5 inline-block rounded-md bg-[#c4b07a] px-4 py-2 text-sm text-[#14140f]"
            >
              {t.pages.blogBook}
            </a>
            <svg className="pointer-events-none absolute -bottom-4 -right-4 h-28 w-28 text-[#c4b07a]/20" viewBox="0 0 80 80" fill="none" aria-hidden>
              <path d="M40 8c8 14 18 22 32 26-14 4-24 12-32 26-8-14-18-22-32-26 14-4 24-12 32-26Z" stroke="currentColor" />
            </svg>
          </div>
        </aside>
      </div>
    </article>
  );
}
