"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { CursorLink } from "@/components/ui/CursorLink";
import type { Artist } from "@/lib/types";

export function ArtistsGrid({ artists }: { artists: Artist[] }) {
  return (
    <div className="mt-16 columns-1 gap-6 md:columns-2 lg:columns-3">
      {artists.map((artist, i) => (
        <motion.article
          key={artist.slug}
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08 }}
          className={`mb-6 break-inside-avoid ${i % 3 === 1 ? "md:mt-12" : ""}`}
        >
          <CursorLink href={`/artistas/${artist.slug}`} className="group block">
            <div className={`relative overflow-hidden ${i % 2 === 0 ? "aspect-[3/4]" : "aspect-[4/5]"}`}>
              <Image
                src={artist.image}
                alt={artist.name}
                fill
                className="object-cover grayscale transition duration-700 group-hover:grayscale-0"
                sizes="40vw"
              />
              <div className="absolute inset-0 opacity-0 transition group-hover:opacity-40">
                <div className="grid h-full grid-cols-2">
                  {artist.works.slice(0, 4).map((w) => (
                    <div key={w} className="relative">
                      <Image src={w} alt="" fill className="object-cover" sizes="20vw" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <h2 className="font-display mt-4 text-3xl">{artist.name}</h2>
            <p className="label-mono mt-1">{artist.specialty} · {artist.years} anos</p>
            <p className="mt-2 text-sm text-ink-secondary">@{artist.instagram}</p>
          </CursorLink>
        </motion.article>
      ))}
    </div>
  );
}
