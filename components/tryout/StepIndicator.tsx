"use client";

import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/LanguageProvider";

export function StepIndicator({ current }: { current: number }) {
  const t = useT();
  return (
    <ol className="mb-10 flex gap-2">
      {t.tryout.steps.map((label, i) => (
        <li key={`${i}-${label}`} className="flex-1">
          <p className={cn("label-mono mb-2 text-[10px]", i <= current ? "text-moss" : "text-ink-muted")}>
            {String(i + 1).padStart(2, "0")} {label}
          </p>
          <div className="h-[2px] bg-line">
            <div className={cn("h-full bg-bg-accent-light transition-all", i <= current ? "w-full" : "w-0")} />
          </div>
        </li>
      ))}
    </ol>
  );
}
