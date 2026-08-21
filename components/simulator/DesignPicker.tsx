"use client";

import { MediaImage } from "@/components/ui/MediaImage";
import { flashDesigns } from "@/lib/data/content";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

export function DesignPicker({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (src: string) => void;
}) {
  const t = useT();
  return (
    <div>
      <p className="label-mono mb-3">{t.simulator.designs}</p>
      {!flashDesigns.length ? (
        <p className="mb-3 text-xs text-ink-muted">Nenhum flash no catalogo — use o upload abaixo.</p>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {flashDesigns.map((d) => (
            <button
              key={d.id}
              onClick={() => onSelect(d.image)}
              className={cn(
                "relative aspect-square overflow-hidden border",
                selected === d.image ? "border-line-accent" : "border-line",
              )}
            >
              <MediaImage src={d.image} alt={d.name} fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}
      <label className="mt-3 block text-sm text-moss underline">
        {t.simulator.uploadOwn}
        <input
          type="file"
          accept="image/png,image/jpeg"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onSelect(URL.createObjectURL(file));
          }}
        />
      </label>
    </div>
  );
}
