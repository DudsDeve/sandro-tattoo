"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

/** Safe image: shows a dark placeholder when src is empty (no mock Unsplash). */
export function MediaImage({
  src,
  alt,
  fill,
  className,
  sizes,
  priority,
  unoptimized,
}: {
  src?: string | null;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  unoptimized?: boolean;
}) {
  if (!src?.trim()) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-[#141414] font-mono text-[10px] tracking-[0.16em] text-[#5c5955]",
          fill && "absolute inset-0",
          className,
        )}
        aria-hidden
      >
        SEM MÍDIA
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      priority={priority}
      unoptimized={unoptimized ?? (src.startsWith("/uploads/") || src.includes("supabase"))}
    />
  );
}
