"use client";

import Image from "next/image";
import { CursorLink, CtaLink } from "@/components/ui/CursorLink";
import type { Artist } from "@/lib/types";
import { useT } from "@/lib/i18n/LanguageProvider";

export function ArtistsCarousel({ artists }: { artists: Artist[] }) {
  const t = useT();
  return (
    <section className="bg-bg-secondary py-20 md:py-28">
      <div className="mb-10 flex items-end justify-between gap-4 px-4 sm:px-5 md:px-12">
        <div className="min-w-0">
          <p className="label-mono mb-3">{t.artists.label}</p>
          <h2 className="display-section">{t.artists.title}</h2>
        </div>
        <CtaLink href="/artistas" variant="outline" className="hidden shrink-0 md:inline-block">
          {t.artists.seeAll}
        </CtaLink>
      </div>
      <div className="snap-x-row px-4 pb-6 sm:px-5 md:px-12">
        {artists.map((artist) => (
          <CursorLink
            key={artist.slug}
            href={`/artistas/${artist.slug}`}
            className="group w-[min(78vw,22rem)] md:w-[420px]"
          >
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image
                src={artist.image}
                alt={artist.name}
                fill
                className="object-cover grayscale transition duration-700 group-hover:scale-105 group-hover:grayscale-0"
                sizes="(max-width: 768px) 78vw, 420px"
                unoptimized={artist.image.startsWith("/uploads/")}
              />
            </div>
            <div className="mt-4">
              <h3 className="font-display text-2xl sm:text-3xl">{artist.name}</h3>
              <p className="label-mono mt-1">{artist.specialty}</p>
              <div className="mt-4 flex gap-2">
                {artist.works.slice(0, 3).map((src) => (
                  <div key={src} className="relative h-14 w-14 overflow-hidden sm:h-16 sm:w-16">
                    <Image
                      src={src}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="64px"
                      unoptimized={src.startsWith("/uploads/")}
                    />
                  </div>
                ))}
              </div>
            </div>
          </CursorLink>
        ))}
      </div>
      <div className="mt-2 px-4 md:hidden">
        <CtaLink href="/artistas" variant="outline" className="w-full">
          {t.artists.seeAll}
        </CtaLink>
      </div>
    </section>
  );
}
