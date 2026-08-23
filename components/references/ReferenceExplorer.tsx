"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/auth/UserProvider";
import { useT } from "@/lib/i18n/LanguageProvider";
import { addBookingReference } from "@/lib/references/booking-session";
import type { SavedPin } from "@/lib/auth/types";
import type { PinterestPin } from "@/lib/pinterest/search";
import { cn } from "@/lib/utils";

type Pin = Pick<PinterestPin, "id" | "title" | "url" | "imageUrl">;

export function ReferenceExplorer() {
  const t = useT();
  const router = useRouter();
  const { user, loading } = useUser();
  const [q, setQ] = useState("");
  const [pins, setPins] = useState<Pin[]>([]);
  const [saved, setSaved] = useState<SavedPin[]>([]);
  const [busy, setBusy] = useState(false);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const loadSaved = useCallback(async () => {
    if (!user) {
      setSaved([]);
      return;
    }
    const res = await fetch("/api/auth/references", { cache: "no-store" });
    const data = (await res.json()) as { pins?: SavedPin[] };
    if (res.ok) setSaved(data.pins ?? []);
  }, [user]);

  useEffect(() => {
    void loadSaved();
  }, [loadSaved]);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    if (term.length < 2) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/pinterest/search?q=${encodeURIComponent(term)}`);
      const data = (await res.json()) as { pins?: Pin[]; error?: string };
      if (!res.ok) throw new Error(data.error || t.pages.refError);
      setPins(data.pins ?? []);
      if (!(data.pins ?? []).length) setError(t.pages.refEmpty);
    } catch (err) {
      setPins([]);
      setError(err instanceof Error ? err.message : t.pages.refError);
    } finally {
      setBusy(false);
    }
  }

  function bookPin(pin: Pin) {
    addBookingReference({ imageUrl: pin.imageUrl, url: pin.url, title: pin.title });
    router.push("/agendar");
  }

  async function savePin(pin: Pin) {
    if (loading) return;
    if (!user) {
      router.push(`/entrar?next=${encodeURIComponent("/referencias")}`);
      return;
    }
    setSavingId(pin.id);
    setToast("");
    const res = await fetch("/api/auth/references", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinId: pin.id, title: pin.title, url: pin.url, imageUrl: pin.imageUrl }),
    });
    const data = (await res.json()) as { pins?: SavedPin[]; error?: string };
    setSavingId("");
    if (!res.ok) {
      setToast(data.error || t.pages.refError);
      return;
    }
    setSaved(data.pins ?? []);
    setToast(t.pages.refSaved);
  }

  async function unsave(id: string) {
    const res = await fetch(`/api/auth/references?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    const data = (await res.json()) as { pins?: SavedPin[] };
    if (res.ok) setSaved(data.pins ?? []);
  }

  const savedIds = new Set(saved.map((p) => p.id).concat(saved.map((p) => p.imageUrl)));

  return (
    <div>
      <form onSubmit={(e) => void search(e)} className="flex max-w-2xl flex-col gap-2 sm:flex-row">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.pages.refPlaceholder}
          className="min-h-12 flex-1 border border-line bg-black px-4 py-3"
        />
        <button
          type="submit"
          disabled={busy || q.trim().length < 2}
          className="min-h-12 bg-[#4c5634] px-6 text-sm text-white disabled:opacity-40"
        >
          {busy ? t.pages.refSearching : t.pages.refSearch}
        </button>
      </form>
      {error ? <p className="mt-4 text-sm text-error">{error}</p> : null}
      {toast ? <p className="mt-4 text-sm text-[#8b9a6b]">{toast}</p> : null}

      {pins.length > 0 ? (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {pins.map((pin) => {
            const isSaved = savedIds.has(pin.id) || savedIds.has(pin.imageUrl);
            return (
              <article key={pin.id} className="group">
                <button
                  type="button"
                  onClick={() => bookPin(pin)}
                  className="relative block aspect-[3/4] w-full overflow-hidden rounded-lg bg-[#141414]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={pin.imageUrl}
                    alt={pin.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-black/70 px-3 py-2 text-left text-xs text-white opacity-0 transition group-hover:opacity-100">
                    {t.pages.refBookHint}
                  </span>
                </button>
                <p className="mt-2 line-clamp-1 text-sm text-ink">{pin.title}</p>
                <button
                  type="button"
                  disabled={savingId === pin.id || isSaved}
                  onClick={() => void savePin(pin)}
                  className={cn(
                    "mt-2 text-xs tracking-wide",
                    isSaved ? "text-[#8b9a6b]" : "text-ink-secondary hover:text-ink",
                  )}
                >
                  {isSaved ? t.pages.refSaved : savingId === pin.id ? t.pages.refSaving : t.pages.refSave}
                </button>
              </article>
            );
          })}
        </div>
      ) : null}

      {user && saved.length > 0 ? (
        <section className="mt-16">
          <h2 className="font-display text-2xl">{t.pages.refMine}</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {saved.map((pin) => (
              <article key={pin.id}>
                <button
                  type="button"
                  onClick={() => bookPin(pin)}
                  className="relative block aspect-[3/4] w-full overflow-hidden rounded-lg bg-[#141414]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={pin.imageUrl} alt={pin.title} className="h-full w-full object-cover" />
                </button>
                <p className="mt-2 line-clamp-1 text-sm">{pin.title}</p>
                <button
                  type="button"
                  className="mt-1 text-xs text-[#8f4a4a]"
                  onClick={() => void unsave(pin.id)}
                >
                  {t.pages.refRemove}
                </button>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
