"use client";

import { useState } from "react";
import Image from "next/image";

export function MediaField({
  label,
  value,
  accept = "image/*,video/*",
  onChange,
}: {
  label: string;
  value?: string;
  accept?: string;
  onChange: (url: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onFile(file?: File | null) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || "Falha no upload");
      onChange(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro no upload");
    } finally {
      setBusy(false);
    }
  }

  const isVideo = Boolean(value && /\.(mp4|webm|mov)(\?|$)/i.test(value));

  return (
    <div className="space-y-2">
      <p className="font-mono text-[0.65rem] tracking-[0.18em] text-[#8b9a6b]">{label}</p>
      <div className="relative aspect-video overflow-hidden border border-[#1a1a1a] bg-[#111]">
        {value ? (
          isVideo ? (
            <video src={value} className="h-full w-full object-cover" controls muted />
          ) : (
            <Image src={value} alt="" fill className="object-cover" unoptimized sizes="400px" />
          )
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[#5c5955]">Sem mídia</div>
        )}
      </div>
      <label className="inline-flex cursor-pointer items-center border border-[#4c5634] px-3 py-2 text-sm text-[#8b9a6b]">
        {busy ? "Enviando…" : "Trocar arquivo"}
        <input
          type="file"
          accept={accept}
          className="hidden"
          disabled={busy}
          onChange={(e) => void onFile(e.target.files?.[0])}
        />
      </label>
      {value && (
        <button type="button" className="ml-2 text-xs text-[#a09b95]" onClick={() => onChange("")}>
          Remover
        </button>
      )}
      {error && <p className="text-sm text-[#8f4a4a]">{error}</p>}
    </div>
  );
}
