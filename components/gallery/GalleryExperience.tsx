"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Lightbox } from "@/components/ui/Lightbox";
import { MediaImage } from "@/components/ui/MediaImage";
import { PortfolioWorkCard } from "@/components/gallery/PortfolioWorkCard";
import { useT } from "@/lib/i18n/LanguageProvider";
import type { Artist, SpecialtySlug, TattooWork } from "@/lib/types";

export function GalleryExperience({
  works,
  specialties,
  artists,
}: {
  works: TattooWork[];
  specialties: Array<{ slug: SpecialtySlug; name: string; image?: string }>;
  artists: Artist[];
}) {
  const t = useT();
  const params = useSearchParams();
  const initialStyle = (params.get("estilo") as SpecialtySlug | null) ?? "todos";
  const initialArtist = params.get("artista") ?? "todos";

  const artistOptions = useMemo(() => {
    const bySlug = new Map<string, string>();
    for (const a of artists) bySlug.set(a.slug, a.name);
    for (const w of works) {
      if (w.artistSlug && !bySlug.has(w.artistSlug)) bySlug.set(w.artistSlug, w.artistName || w.artistSlug);
    }
    return Array.from(bySlug, ([slug, name]) => ({ slug, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [artists, works]);

  const [styleFilter, setStyleFilter] = useState<SpecialtySlug | "todos">(
    specialties.some((s) => s.slug === initialStyle) ? initialStyle : "todos",
  );
  const [artistFilter, setArtistFilter] = useState(
    artistOptions.some((a) => a.slug === initialArtist) ? initialArtist : "todos",
  );
  const [index, setIndex] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return works.filter((w) => {
      const styleOk = styleFilter === "todos" || w.style === styleFilter || w.style === String(styleFilter);
      const artistOk = artistFilter === "todos" || w.artistSlug === artistFilter;
      return styleOk && artistOk;
    });
  }, [artistFilter, styleFilter, works]);

  const activeSpecialty = specialties.find((s) => s.slug === styleFilter);

  const styleChips: Array<{ slug: SpecialtySlug | "todos"; name: string }> = [
    { slug: "todos", name: t.gallery.all },
    ...specialties.map((s) => ({ slug: s.slug, name: s.name })),
  ];

  const artistChips: Array<{ slug: string; name: string }> = [
    { slug: "todos", name: t.gallery.allArtists },
    ...artistOptions,
  ];

  return (
    <div>
      <div className="mb-8 space-y-6">
        <div>
          <p className="label-mono mb-3 text-ink-muted">{t.gallery.byStyle}</p>
          <div className="flex flex-wrap gap-2">
            {styleChips.map((chip) => (
              <button
                key={`style-${chip.slug}`}
                type="button"
                onClick={() => setStyleFilter(chip.slug)}
                className={`label-mono min-h-10 shrink-0 border px-3 py-2 sm:px-4 ${
                  styleFilter === chip.slug ? "border-line-accent bg-bg-accent text-ink" : "border-line text-ink-secondary"
                }`}
              >
                {chip.name}
              </button>
            ))}
          </div>
        </div>
        {artistOptions.length > 0 ? (
          <div>
            <p className="label-mono mb-3 text-ink-muted">{t.gallery.byArtist}</p>
            <div className="flex flex-wrap gap-2">
              {artistChips.map((chip) => (
                <button
                  key={`artist-${chip.slug}`}
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
      </div>
      {styleFilter !== "todos" && activeSpecialty?.image ? (
        <div className="relative mb-10 aspect-[21/9] max-h-64 overflow-hidden">
          <MediaImage src={activeSpecialty.image} alt={activeSpecialty.name} fill className="object-cover" sizes="100vw" />
        </div>
      ) : null}
      <motion.div className="grid grid-cols-2 gap-x-3 gap-y-8 pb-8 sm:grid-cols-3 lg:grid-cols-5">
        {!filtered.length && <p className="col-span-full text-sm text-ink-muted">{t.gallery.empty}</p>}
        <AnimatePresence mode="popLayout">
          {filtered.map((work, i) => (
            <motion.div
              layout
              key={work.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <PortfolioWorkCard
                work={work}
                categoryLabel={specialties.find((s) => s.slug === work.style)?.name || work.style}
                onClick={() => setIndex(i)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      <Lightbox items={filtered} index={index} onClose={() => setIndex(null)} onIndex={setIndex} />
    </div>
  );
}
