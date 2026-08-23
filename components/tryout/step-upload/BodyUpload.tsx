"use client";

import { useCallback, useRef, useState } from "react";
import { fileToDataUrl, resizeImage } from "@/lib/tryout/image-utils";
import { useT } from "@/lib/i18n/LanguageProvider";

function isAllowedImage(file: File) {
  if (file.type.startsWith("image/")) return true;
  return /\.(jpe?g|png|webp|gif)$/i.test(file.name);
}

export function BodyUpload({ onReady }: { onReady: (dataUrl: string) => void }) {
  const t = useT();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handle = useCallback(
    async (file?: File | null) => {
      if (!file) return;
      setError("");
      if (!isAllowedImage(file)) {
        setError(t.tryout.errType);
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        setError(t.tryout.errSize);
        return;
      }
      setBusy(true);
      try {
        const raw = await fileToDataUrl(file);
        onReady(await resizeImage(raw, 2048));
      } catch (e) {
        setError(e instanceof Error ? e.message : t.tryout.errUpload);
      } finally {
        setBusy(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [onReady, t],
  );

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        void handle(e.dataTransfer.files[0]);
      }}
      className="flex min-h-[280px] flex-col items-center justify-center border border-dashed border-[#4C5634] bg-bg-secondary px-6 py-16 text-center"
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/*"
        className="sr-only"
        onChange={(e) => void handle(e.target.files?.[0])}
      />
      <p className="font-display text-3xl">{t.tryout.uploadTitle}</p>
      <p className="mt-3 max-w-sm text-sm text-ink-secondary">{t.tryout.uploadHint}</p>
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="mt-8 bg-bg-accent px-6 py-3 text-sm text-white disabled:opacity-50"
      >
        {busy ? t.tryout.preparing : t.tryout.choosePhoto}
      </button>
      <p className="label-mono mt-6">{t.tryout.formats}</p>
      {error && <p className="mt-4 text-sm text-error">{error}</p>}
    </div>
  );
}
