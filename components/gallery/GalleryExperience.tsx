"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Lightbox } from "@/components/ui/Lightbox";
import { useT } from "@/lib/i18n/LanguageProvider";
import type { SpecialtySlug, TattooWork } from "@/lib/types";

export function GalleryExperience({
  works,
  specialties,
}: {
  works: TattooWork[];
  specialties: Array<{ slug: SpecialtySlug; name: string }>;
}) {
  const t = useT();
  const params = useSearchParams();
  const initial = (params.get("estilo") as SpecialtySlug | null) ?? "todos";
  const [filter, setFilter] = useState<SpecialtySlug | "todos">(
    specialties.some((s) => s.slug === initial) ? initial : "todos",
  );
  const [index, setIndex] = useState<number | null>(null);

  const filtered = useMemo(
    () => (filter === "todos" ? works : works.filter((w) => w.style === filter)),
    [filter, works],
  );

  const chips: Array<{ slug: SpecialtySlug | "todos"; name: string }> = [
    { slug: "todos", name: t.gallery.all },
    ...specialties.map((s) => ({ slug: s.slug, name: s.name })),
  ];

  return (
    <div>
      <div className="mb-10 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {chips.map((chip) => (
          <button
            key={chip.slug}
            onClick={() => setFilter(chip.slug)}
            className={`label-mono shrink-0 border px-4 py-2 ${
              filter === chip.slug ? "border-line-accent bg-bg-accent text-ink" : "border-line text-ink-secondary"
            }`}
          >
            {chip.name}
          </button>
        ))}
      </div>
      <motion.div className="snap-x-row pb-8">
        <AnimatePresence mode="popLayout">
          {filtered.map((work, i) => (
            <motion.button
              layout
              key={work.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group relative h-[min(62vh,32rem)] w-[min(78vw,22rem)] shrink-0 overflow-hidden sm:h-[70vh] sm:w-[min(70vw,420px)]"
              onClick={() => setIndex(i)}
            >
              <Image src={work.image} alt={work.title} fill className="object-cover" sizes="420px" />
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/75 via-black/20 to-transparent p-4 opacity-100 sm:p-6 md:bg-black/0 md:opacity-0 md:transition md:group-hover:bg-black/55 md:group-hover:opacity-100">
                <p className="font-display text-2xl">{work.artistName}</p>
                <p className="label-mono mt-1">
                  {work.style} · ~{work.hours}h · {work.bodyPart}
                </p>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>
      <Lightbox items={filtered} index={index} onClose={() => setIndex(null)} onIndex={setIndex} />
    </div>
  );
}
