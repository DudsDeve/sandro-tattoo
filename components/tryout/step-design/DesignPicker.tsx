"use client";

import { useRef, useState } from "react";
import { fileToDataUrl } from "@/lib/tryout/image-utils";
import { useT } from "@/lib/i18n/LanguageProvider";

export function DesignPicker({
  onCustom,
}: {
  onCustom: (dataUrl: string, name: string) => void;
}) {
  const t = useT();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

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
    <div className="flex flex-col items-center gap-3 border border-dashed border-[#4C5634] px-4 py-8">
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
  );
}
