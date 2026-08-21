"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { MediaImage } from "@/components/ui/MediaImage";
import { cn } from "@/lib/utils";

export function ParallaxImage({
  src,
  alt,
  className,
  speed = 0.2,
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  speed?: number;
  priority?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [`-${speed * 20}%`, `${speed * 20}%`]);

  if (!src?.trim()) {
    return (
      <div className={cn("relative overflow-hidden bg-[#141414]", className)}>
        <div className="flex h-full min-h-[12rem] items-center justify-center font-mono text-[10px] tracking-[0.16em] text-[#5c5955]">
          SEM MÍDIA
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div style={{ y }} className="absolute inset-[-18%] h-[136%] w-full">
        <MediaImage src={src} alt={alt} fill className="object-cover" sizes="100vw" priority={priority} />
      </motion.div>
    </div>
  );
}
