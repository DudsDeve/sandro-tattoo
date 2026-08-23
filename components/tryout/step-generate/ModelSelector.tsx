"use client";

import { useT } from "@/lib/i18n/LanguageProvider";

export function GeneratingAnimation() {
  const t = useT();
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center">
      <div className="h-16 w-16 animate-pulse rounded-full border border-[#4C5634]" />
      <p className="label-mono mt-6">{t.tryout.applying}</p>
      <p className="mt-2 text-sm text-ink-muted">{t.tryout.applyingHint}</p>
    </div>
  );
}
