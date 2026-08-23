"use client";

import { useState } from "react";
import { Lightbox } from "@/components/ui/Lightbox";
import { PortfolioWorkCard } from "@/components/gallery/PortfolioWorkCard";
import type { SpecialtySlug, TattooWork } from "@/lib/types";

export function ArtistGallery({
  works,
  specialties = [],
}: {
  works: TattooWork[];
  specialties?: Array<{ slug: SpecialtySlug; name: string }>;
}) {
  const [index, setIndex] = useState<number | null>(null);
  if (!works.length) {
    return (
      <section className="mt-16">
        <p className="label-mono mb-8">Trabalhos</p>
        <p className="text-sm text-ink-muted">Nenhum trabalho cadastrado ainda.</p>
      </section>
    );
  }
  return (
    <section className="mt-16">
      <p className="label-mono mb-8">Trabalhos</p>
      <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
        {works.map((work, i) => (
          <PortfolioWorkCard
            key={work.id}
            work={work}
            categoryLabel={specialties.find((s) => s.slug === work.style)?.name || work.style}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
      <Lightbox items={works} index={index} onClose={() => setIndex(null)} onIndex={setIndex} />
    </section>
  );
}
