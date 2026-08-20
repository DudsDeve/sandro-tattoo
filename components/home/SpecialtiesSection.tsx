"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { specialties } from "@/lib/data/content";

export function SpecialtiesSection() {
  return (
    <section className="bg-bg-primary px-4 py-20 sm:px-5 md:px-12 md:py-28">
      <p className="label-mono mb-4">Especialidades</p>
      <h2 className="display-section mb-14 max-w-3xl">Linguagens que a gente fala de verdade.</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {specialties.map((s, i) => (
          <motion.div
            key={s.slug}
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link href={`/galeria?estilo=${s.slug}`} className="group relative block aspect-[4/5] overflow-hidden">
              <Image
                src={s.image}
                alt={s.name}
                fill
                className="object-cover grayscale transition duration-700 group-hover:scale-110 group-hover:grayscale-0"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent transition group-hover:bg-bg-accent/25" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <h3 className="font-display text-2xl sm:text-3xl">{s.name}</h3>
                <p className="mt-2 text-sm text-ink-secondary">{s.description}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
