"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/LanguageProvider";

export type PinterestPinResult = {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string;
};

export function PinterestSearch({
  selected,
  onToggle,
  max = 5,
}: {
  selected: string[];
  onToggle: (pin: PinterestPinResult) => void;
  max?: number;
}) {
  const t = useT();
  const [q, setQ] = useState("");
  const [pins, setPins] = useState<PinterestPinResult[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function search(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    if (term.length < 2) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/pinterest/search?q=${encodeURIComponent(term)}`);
      const data = (await res.json()) as { pins?: PinterestPinResult[]; error?: string };
      if (!res.ok) throw new Error(data.error || "Pinterest");
      setPins(data.pins ?? []);
      if (!(data.pins ?? []).length) setError(t.booking.pinterestEmpty);
    } catch (err) {
      setPins([]);
      setError(err instanceof Error ? err.message : t.booking.pinterestError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6 border border-line p-4">
      <p className="label-mono text-moss">{t.booking.pinterestSearch}</p>
      <form onSubmit={(e) => void search(e)} className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.booking.pinterestPlaceholder}
          className="min-h-11 flex-1 px-3 py-2"
        />
        <button
          type="submit"
          disabled={busy || q.trim().length < 2}
          className="min-h-11 border border-line-accent px-4 text-sm disabled:opacity-40"
        >
          {busy ? t.booking.pinterestSearching : t.booking.pinterestGo}
        </button>
      </form>
      {error ? <p className="mt-2 text-sm text-error">{error}</p> : null}
      {pins.length > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {pins.map((pin) => {
            const on = selected.includes(pin.imageUrl);
            return (
              <button
                type="button"
                key={pin.id}
                disabled={!on && selected.length >= max}
                onClick={() => onToggle(pin)}
                className={cn(
                  "relative aspect-square overflow-hidden border text-left disabled:opacity-40",
                  on ? "border-line-accent ring-1 ring-moss" : "border-line",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={pin.imageUrl} alt={pin.title} className="h-full w-full object-cover" />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
