"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Lightbox } from "@/components/ui/Lightbox";
import { specialties } from "@/lib/data/content";
import type { SpecialtySlug, TattooWork } from "@/lib/types";

export function GalleryExperience({ works }: { works: TattooWork[] }) {
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
    { slug: "todos", name: "Todos" },
    ...specialties.map((s) => ({ slug: s.slug, name: s.name })),
  ];

  return (
    <div>
      <div className="mb-10 flex flex-wrap gap-2">
        {chips.map((chip) => (
          <button
            key={chip.slug}
            onClick={() => setFilter(chip.slug)}
            className={`label-mono border px-4 py-2 ${
              filter === chip.slug ? "border-line-accent bg-bg-accent text-ink" : "border-line text-ink-secondary"
            }`}
          >
            {chip.name}
          </button>
        ))}
      </div>
      <motion.div
        className="flex cursor-grab gap-4 overflow-x-auto pb-8"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((work, i) => (
            <motion.button
              layout
              key={work.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group relative h-[70vh] w-[min(70vw,420px)] shrink-0 overflow-hidden"
              onClick={() => setIndex(i)}
            >
              <Image src={work.image} alt={work.title} fill className="object-cover" sizes="420px" />
              <div className="absolute inset-0 flex flex-col justify-end bg-black/0 p-6 opacity-0 transition group-hover:bg-black/55 group-hover:opacity-100">
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
