"use client";

import { MediaImage } from "@/components/ui/MediaImage";
import type { TattooWork } from "@/lib/types";

export function PortfolioWorkCard({
  work,
  categoryLabel,
  onClick,
}: {
  work: TattooWork;
  categoryLabel: string;
  onClick: () => void;
}) {
  return (
    <button type="button" className="group w-full text-left" onClick={onClick}>
      <span className="relative block aspect-[3/4] overflow-hidden rounded-lg bg-[#141414] shadow-[0_10px_28px_rgba(0,0,0,0.55),0_0_0_1px_rgba(76,86,52,0.22)]">
        <MediaImage
          src={work.image}
          alt={work.title}
          fill
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />
      </span>
      <span className="mt-2.5 block min-w-0">
        <span className="block truncate font-display text-lg leading-tight text-ink">{work.title}</span>
        <span className="mt-0.5 block truncate text-sm text-ink-secondary">{work.artistName}</span>
        <span className="label-mono mt-1 block truncate text-[#8b9a6b]">{categoryLabel}</span>
      </span>
    </button>
  );
}
