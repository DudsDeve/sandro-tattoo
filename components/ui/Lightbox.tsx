"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect } from "react";
import type { TattooWork } from "@/lib/types";

export function Lightbox({
  items,
  index,
  onClose,
  onIndex,
}: {
  items: TattooWork[];
  index: number | null;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const item = index !== null ? items[index] : null;

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndex((index + 1) % items.length);
      if (e.key === "ArrowLeft") onIndex((index - 1 + items.length) % items.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, items.length, onClose, onIndex]);

  return (
    <AnimatePresence>
      {item && index !== null && (
        <motion.div
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/80 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button className="absolute right-6 top-6 text-ink" onClick={onClose} aria-label="Fechar">
            <X />
          </button>
          <button
            className="absolute left-4 text-ink md:left-8"
            onClick={() => onIndex((index - 1 + items.length) % items.length)}
            aria-label="Anterior"
          >
            <ChevronLeft size={36} />
          </button>
          <button
            className="absolute right-4 text-ink md:right-8"
            onClick={() => onIndex((index + 1) % items.length)}
            aria-label="Próxima"
          >
            <ChevronRight size={36} />
          </button>
          <div className="relative mx-12 aspect-[3/4] w-full max-w-lg overflow-hidden md:aspect-[4/5]">
            <Image src={item.image} alt={item.title} fill className="object-cover" />
          </div>
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <p className="font-display text-2xl">{item.title}</p>
            <p className="label-mono mt-2">
              {item.artistName} · {item.style} · ~{item.hours}h · {item.bodyPart}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
