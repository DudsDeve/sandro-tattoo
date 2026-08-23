"use client";

import { CtaLink } from "@/components/ui/CursorLink";
import { MediaImage } from "@/components/ui/MediaImage";
import { useT } from "@/lib/i18n/LanguageProvider";
import type { CmsWishlistItem } from "@/lib/cms/types";

export function WishlistGrid({ items }: { items: CmsWishlistItem[] }) {
  const t = useT();

  if (!items.length) {
    return <p className="text-ink-secondary">{t.pages.wishlistEmpty}</p>;
  }

  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <article key={item.id} className="group">
          <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-[#141414] shadow-[0_10px_28px_rgba(0,0,0,0.55),0_0_0_1px_rgba(76,86,52,0.22)]">
            <MediaImage
              src={item.image}
              alt={item.title}
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <span className="absolute left-3 top-3 bg-[#4c5634] px-3 py-1.5 font-mono text-xs tracking-wider text-white">
              −{item.discountPercent}% {t.pages.wishlistOff}
            </span>
          </div>
          <h2 className="mt-3 truncate font-display text-xl text-ink">{item.title}</h2>
          {item.note ? <p className="mt-1 line-clamp-2 text-sm text-ink-secondary">{item.note}</p> : null}
          <div className="mt-4">
            <CtaLink href="/agendar" variant="outline">
              {t.pages.wishlistBook}
            </CtaLink>
          </div>
        </article>
      ))}
    </div>
  );
}
