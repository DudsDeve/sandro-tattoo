"use client";

import { useT } from "@/lib/i18n/LanguageProvider";

export function QuickSuggestions({ onPick }: { onPick: (q: string) => void }) {
  const t = useT();
  return (
    <div className="flex flex-wrap gap-2">
      {t.ai.suggestions.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onPick(s)}
          className="label-mono border border-line px-3 py-2 text-[10px] hover:border-line-accent"
        >
          {s}
        </button>
      ))}
    </div>
  );
}
