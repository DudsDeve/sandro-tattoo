"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { formatBRL } from "@/lib/utils";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { MediaImage } from "@/components/ui/MediaImage";
import { useT } from "@/lib/i18n/LanguageProvider";
import type { Product } from "@/lib/types";

export function ShopGrid({ products }: { products: Product[] }) {
  const t = useT();
  const [active, setActive] = useState<Product | null>(null);
  const [tilt, setTilt] = useState<Record<string, string>>({});

  if (!products.length) {
    return <p className="mt-16 text-sm text-ink-muted">Loja vazia por enquanto.</p>;
  }

  return (
    <>
      <div className="mt-16 grid gap-4 md:grid-cols-4">
        {products.map((p, i) => (
          <button
            key={p.slug}
            onClick={() => setActive(p)}
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              const x = (e.clientX - r.left) / r.width - 0.5;
              const y = (e.clientY - r.top) / r.height - 0.5;
              setTilt((prev) => ({
                ...prev,
                [p.slug]: `perspective(800px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg)`,
              }));
            }}
            onMouseLeave={() => setTilt((prev) => ({ ...prev, [p.slug]: "none" }))}
            className={`group relative overflow-hidden border border-line bg-bg-secondary text-left ${
              i === 0 ? "md:col-span-2 md:row-span-2" : ""
            }`}
            style={{ transform: tilt[p.slug] ?? "none", transformStyle: "preserve-3d" }}
          >
            <div className={`relative ${i === 0 ? "aspect-square md:aspect-auto md:h-full" : "aspect-[4/5]"}`}>
              <MediaImage src={p.image} alt={p.name} fill className="object-cover" sizes="50vw" />
              <div className="absolute inset-0 bg-black/0 backdrop-blur-0 transition group-hover:bg-black/30 group-hover:backdrop-blur-[2px]" />
            </div>
            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="font-display text-2xl">{p.name}</p>
              <p className="label-mono mt-1">{formatBRL(p.price)}</p>
            </div>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-5 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
          >
            <motion.div
              className="grid max-h-[90svh] w-full max-w-3xl gap-6 overflow-y-auto border border-line bg-bg-tertiary p-5 md:grid-cols-2 md:p-6"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-[4/5]">
                <MediaImage src={active.image} alt={active.name} fill className="object-cover" />
              </div>
              <div>
                <h2 className="font-display text-3xl sm:text-4xl">{active.name}</h2>
                <p className="mt-2 text-moss">{formatBRL(active.price)}</p>
                <p className="mt-4 text-sm text-ink-secondary">{active.description}</p>
                {active.sizes && (
                  <div className="mt-6 flex gap-2">
                    {active.sizes.map((s) => (
                      <span key={s} className="border border-line px-3 py-1 text-sm">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-8">
                  <MagneticButton>{t.shop.buySoon}</MagneticButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
