"use client";

import { useT } from "@/lib/i18n/LanguageProvider";

export function BodyUpload({ onFile }: { onFile: (src: string) => void }) {
  const t = useT();
  return (
    <label className="flex h-full min-h-[60vh] cursor-pointer flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="label-mono">{t.simulator.bodyPhoto}</p>
      <p className="font-display text-3xl">{t.simulator.dropPhoto}</p>
      <p className="max-w-sm text-sm text-ink-secondary">{t.simulator.dropHint}</p>
      <input
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          onFile(URL.createObjectURL(file));
        }}
      />
    </label>
  );
}
