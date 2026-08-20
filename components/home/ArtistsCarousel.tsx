"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { CursorLink, CtaLink } from "@/components/ui/CursorLink";
import { artists } from "@/lib/data/content";

export function ArtistsCarousel() {
  return (
    <section className="bg-bg-secondary py-28">
      <div className="mb-10 flex items-end justify-between px-5 md:px-12">
        <div>
          <p className="label-mono mb-3">Artistas</p>
          <h2 className="display-section">Quem segura a agulha.</h2>
        </div>
        <CtaLink href="/artistas" variant="outline" className="hidden md:inline-block">
          Ver todos
        </CtaLink>
      </div>
      <motion.div
        className="flex cursor-grab gap-6 overflow-x-auto px-5 pb-6 md:px-12"
        drag="x"
        dragConstraints={{ left: -900, right: 0 }}
      >
        {artists.map((artist) => (
          <CursorLink
            key={artist.slug}
            href={`/artistas/${artist.slug}`}
            className="group w-[78vw] shrink-0 md:w-[420px]"
          >
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image
                src={artist.image}
                alt={artist.name}
                fill
                className="object-cover grayscale transition duration-700 group-hover:scale-105 group-hover:grayscale-0"
                sizes="420px"
              />
            </div>
            <div className="mt-4">
              <h3 className="font-display text-3xl">{artist.name}</h3>
              <p className="label-mono mt-1">{artist.specialty}</p>
              <div className="mt-4 flex gap-2">
                {artist.works.slice(0, 3).map((src) => (
                  <div key={src} className="relative h-16 w-16 overflow-hidden">
                    <Image src={src} alt="" fill className="object-cover" sizes="64px" />
                  </div>
                ))}
              </div>
            </div>
          </CursorLink>
        ))}
      </motion.div>
    </section>
  );
}
