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

  const skipOptimizer =
    unoptimized ??
    (src.startsWith("/uploads/") || src.includes("supabase") || src.includes("blob.vercel-storage"));

  if (skipOptimizer) {
    return (
      // User CMS uploads: avoid next/image remote-pattern errors that blank the card.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={cn(fill && "absolute inset-0 h-full w-full object-cover object-center", className)}
      />
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
      unoptimized={unoptimized}
    />
  );
}
