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
          className="fixed inset-0 z-[95] flex flex-col items-center justify-center bg-black/80 px-3 py-[max(1rem,env(safe-area-inset-top))] backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-10 text-ink sm:right-6"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X />
          </button>
          <button
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 text-ink sm:left-8"
            onClick={() => onIndex((index - 1 + items.length) % items.length)}
            aria-label="Anterior"
          >
            <ChevronLeft size={32} />
          </button>
          <button
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 text-ink sm:right-8"
            onClick={() => onIndex((index + 1) % items.length)}
            aria-label="Próxima"
          >
            <ChevronRight size={32} />
          </button>
          <div className="relative mx-10 aspect-[3/4] h-[min(68svh,calc(100vw-4rem))] w-auto max-w-[min(92vw,28rem)] overflow-hidden md:aspect-[4/5]">
            <Image src={item.image} alt={item.title} fill className="object-cover" />
          </div>
          <div className="mt-4 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-center">
            <p className="font-display text-xl sm:text-2xl">{item.title}</p>
            <p className="label-mono mt-2">
              {item.artistName} · {item.style} · ~{item.hours}h · {item.bodyPart}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
