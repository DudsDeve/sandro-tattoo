"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n/LanguageProvider";

export function CompareSlider({ before, after }: { before: string; after: string }) {
  const t = useT();
  const [pct, setPct] = useState(52);
  return (
    <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] border border-line bg-black">
      <img src={before} alt={t.tryout.before} className="absolute inset-0 h-full w-full object-cover object-center" />
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}>
        <img src={after} alt={t.tryout.after} className="h-full w-full object-cover object-center" />
      </div>
      <input
        type="range"
        min={2}
        max={98}
        value={pct}
        onChange={(e) => setPct(Number(e.target.value))}
        className="absolute inset-x-4 bottom-4 accent-[#4C5634]"
      />
    </div>
  );
}
