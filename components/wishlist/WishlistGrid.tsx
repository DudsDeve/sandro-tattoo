"use client";

import { useMemo, useState } from "react";
import { CtaLink } from "@/components/ui/CursorLink";
import { MediaImage } from "@/components/ui/MediaImage";
import { useT } from "@/lib/i18n/LanguageProvider";
import type { PublicWishlistItem } from "@/lib/content";
import type { Artist } from "@/lib/types";

export function WishlistGrid({
  items,
  artists,
}: {
  items: PublicWishlistItem[];
  artists: Artist[];
}) {
  const t = useT();
  const [artistFilter, setArtistFilter] = useState("todos");

  const artistChips = useMemo(() => {
    const fromStudio = artists.map((a) => ({ slug: a.slug, name: a.name }));
    const extra = new Map<string, string>();
    for (const item of items) {
      if (item.artistSlug && !fromStudio.some((a) => a.slug === item.artistSlug)) {
        extra.set(item.artistSlug, item.artistName || item.artistSlug);
      }
    }
    return [
      { slug: "todos", name: t.gallery.allArtists },
      ...fromStudio,
      ...Array.from(extra, ([slug, name]) => ({ slug, name })),
    ];
  }, [artists, items, t.gallery.allArtists]);

  const filtered = useMemo(() => {
    if (artistFilter === "todos") return items;
    return items.filter((item) => item.artistSlug === artistFilter);
  }, [artistFilter, items]);

  if (!items.length) {
    return <p className="text-ink-secondary">{t.pages.wishlistEmpty}</p>;
  }

  return (
    <div>
      {artistChips.length > 1 ? (
        <div className="mb-10">
          <p className="label-mono mb-3 text-ink-muted">{t.gallery.byArtist}</p>
          <div className="flex flex-wrap gap-2">
            {artistChips.map((chip) => (
              <button
                key={chip.slug}
                type="button"
                onClick={() => setArtistFilter(chip.slug)}
                className={`label-mono min-h-10 shrink-0 border px-3 py-2 sm:px-4 ${
                  artistFilter === chip.slug
                    ? "border-line-accent bg-bg-accent text-ink"
                    : "border-line text-ink-secondary"
                }`}
              >
                {chip.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {!filtered.length ? (
        <p className="text-ink-secondary">{t.pages.wishlistEmptyFilter}</p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <article key={item.id} className="group">
              <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-[#141414] shadow-[0_10px_28px_rgba(0,0,0,0.55),0_0_0_1px_rgba(76,86,52,0.22)]">
                <MediaImage
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute right-2 top-2 z-10 bg-[#4c5634] px-3 py-2 shadow-[-6px_6px_16px_rgba(0,0,0,0.35)]">
                  <p className="font-mono text-lg font-semibold leading-none tracking-tight text-white sm:text-xl">
                    −{item.discountPercent}%
                  </p>
                </div>
              </div>
              <h2 className="mt-3 truncate font-display text-xl text-ink">{item.title}</h2>
              {item.note ? <p className="mt-1 line-clamp-2 text-sm text-ink-secondary">{item.note}</p> : null}
              {item.artistName ? (
                <p className="mt-1 text-sm text-[#8b9a6b]">
                  {t.pages.wishlistArtist}: {item.artistName}
                </p>
              ) : null}
              <div className="mt-4">
                <CtaLink
                  href={item.artistSlug ? `/agendar?artista=${item.artistSlug}` : "/agendar"}
                  variant="outline"
                >
                  {t.pages.wishlistBook}
                </CtaLink>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
