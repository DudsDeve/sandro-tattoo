"use client";

import { useState } from "react";
import { Lightbox } from "@/components/ui/Lightbox";
import { MediaImage } from "@/components/ui/MediaImage";
import type { TattooWork } from "@/lib/types";

export function ArtistGallery({ works }: { works: TattooWork[] }) {
  const [index, setIndex] = useState<number | null>(null);
  if (!works.length) {
    return (
      <section className="mt-24 px-5 md:px-12">
        <p className="label-mono mb-8">Trabalhos</p>
        <p className="text-sm text-ink-muted">Nenhum trabalho cadastrado ainda.</p>
      </section>
    );
  }
  return (
    <section className="mt-24 px-5 md:px-12">
      <p className="label-mono mb-8">Trabalhos</p>
      <div className="columns-1 gap-4 md:columns-3">
        {works.map((work, i) => (
          <button
            key={work.id}
            className="relative mb-4 block w-full break-inside-avoid"
            onClick={() => setIndex(i)}
          >
            <span className="relative block aspect-[3/4] overflow-hidden">
              <MediaImage src={work.image} alt={work.title} fill className="object-cover" sizes="33vw" />
            </span>
          </button>
        ))}
      </div>
      <Lightbox items={works} index={index} onClose={() => setIndex(null)} onIndex={setIndex} />
    </section>
  );
}
