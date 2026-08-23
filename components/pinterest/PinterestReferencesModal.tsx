"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/LanguageProvider";
import type { PinterestPinResult } from "@/components/pinterest/PinterestSearch";

export function PinterestReferencesModal({
  open,
  selected,
  onToggle,
  onClose,
  max = 8,
}: {
  open: boolean;
  selected: string[];
  onToggle: (pin: PinterestPinResult) => void;
  onClose: () => void;
  max?: number;
}) {
  const t = useT();
  const [q, setQ] = useState("");
  const [pins, setPins] = useState<PinterestPinResult[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <button type="button" className="absolute inset-0 bg-black/80" aria-label={t.nav.closeMenu} onClick={onClose} />
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col border border-line bg-[#0a0a0a]">
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <p className="label-mono text-moss">{t.booking.searchReferences}</p>
            <h3 className="mt-1 font-display text-2xl">{t.booking.pinterestModalTitle}</h3>
            <p className="mt-1 text-sm text-ink-secondary">{t.booking.pinterestModalLead}</p>
          </div>
          <button type="button" className="text-sm text-ink-secondary" onClick={onClose}>
            {t.booking.pinterestDone}
          </button>
        </div>
        <form onSubmit={(e) => void search(e)} className="flex flex-col gap-2 border-b border-line px-5 py-4 sm:flex-row">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.booking.pinterestPlaceholder}
            className="min-h-11 flex-1 border border-line bg-black px-3 py-2"
            autoFocus
          />
          <button
            type="submit"
            disabled={busy || q.trim().length < 2}
            className="min-h-11 bg-[#4c5634] px-4 text-sm text-white disabled:opacity-40"
          >
            {busy ? t.booking.pinterestSearching : t.booking.pinterestGo}
          </button>
        </form>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {error ? <p className="text-sm text-error">{error}</p> : null}
          {pins.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
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
                    {on ? (
                      <span className="absolute left-2 top-2 bg-[#4c5634] px-2 py-0.5 text-[10px] tracking-wide text-white">
                        {t.booking.pinterestPicked}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-ink-secondary">{t.booking.pinterestModalHint}</p>
          )}
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-4">
          <p className="text-sm text-ink-secondary">
            {t.booking.pinterestCount.replace("{n}", String(selected.length)).replace("{max}", String(max))}
          </p>
          <button type="button" className="bg-[#4c5634] px-5 py-2.5 text-sm text-white" onClick={onClose}>
            {t.booking.pinterestAttach}
          </button>
        </div>
      </div>
    </div>
  );
}
