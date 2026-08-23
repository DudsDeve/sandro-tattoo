"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { fileToDataUrl } from "@/lib/tryout/image-utils";
import type { TryoutDesign } from "@/lib/tryout/types";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/LanguageProvider";

export function DesignPicker({
  selectedId,
  onSelect,
  onCustom,
}: {
  selectedId?: string;
  onSelect: (d: TryoutDesign) => void;
  onCustom: (dataUrl: string, name: string) => void;
}) {
  const t = useT();
  const inputRef = useRef<HTMLInputElement>(null);
  const [designs, setDesigns] = useState<TryoutDesign[]>([]);
  const [filter, setFilter] = useState("all");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetch("/api/tryout/designs")
      .then((r) => r.json())
      .then((d: { designs?: TryoutDesign[] }) => setDesigns(d.designs ?? []));
  }, []);

  const styles = useMemo(() => ["all", ...Array.from(new Set(designs.map((d) => d.style).filter(Boolean)))], [designs]);
  const list = filter === "all" ? designs : designs.filter((d) => d.style === filter);

  async function pickFile(file?: File | null) {
    if (!file) return;
    setError("");
    const ok = file.type.startsWith("image/") || /\.(jpe?g|png|webp|gif)$/i.test(file.name);
    if (!ok) {
      setError(t.tryout.errType);
      return;
    }
    setBusy(true);
    try {
      onCustom(await fileToDataUrl(file), file.name.replace(/\.[^.]+$/, "") || "Design");
    } catch {
      setError(t.tryout.errRead);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {styles.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={cn(
              "label-mono border px-3 py-1.5",
              filter === s ? "border-line-accent bg-bg-accent" : "border-line text-ink-secondary",
            )}
          >
            {s === "all" ? t.tryout.all : s}
          </button>
        ))}
      </div>
      <div className="mb-6 flex flex-col items-center gap-3 border border-dashed border-[#4C5634] px-4 py-8">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/*"
          className="sr-only"
          onChange={(e) => void pickFile(e.target.files?.[0])}
        />
        <p className="text-sm text-ink-secondary">{t.tryout.uploadDesign}</p>
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="bg-bg-accent px-5 py-2 text-sm text-white disabled:opacity-50"
        >
          {busy ? t.tryout.reading : t.tryout.chooseFile}
        </button>
        {error && <p className="text-sm text-error">{error}</p>}
      </div>
      {!list.length ? (
        <p className="text-sm text-ink-muted">{t.tryout.emptyDesigns}</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => onSelect(d)}
              className={cn(
                "overflow-hidden border text-left",
                selectedId === d.id ? "border-line-accent ring-1 ring-moss" : "border-line",
              )}
            >
              <div
                className="aspect-square bg-[#1a1a1a] bg-cover bg-center"
                style={{
                  backgroundImage: `url(${d.imageUrl})`,
                  backgroundColor: "#222",
                }}
              />
              <div className="p-3">
                <p className="font-display text-lg">{d.name}</p>
                <p className="label-mono mt-1 text-[10px]">
                  {d.style}
                  {d.artistName ? ` · ${d.artistName}` : ""}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
