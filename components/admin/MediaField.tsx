"use client";

import { useState } from "react";

async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  if (typeof createImageBitmap !== "function") return file;

  const bitmap = await createImageBitmap(file);
  const max = 1800;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.84));
  if (!blob) return file;
  return new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" });
}

async function readUploadResponse(res: Response): Promise<{ url?: string; error?: string }> {
  const text = await res.text();
  if (!text.trim()) {
    throw new Error(
      res.status === 413 || res.status === 0
        ? "Arquivo grande demais para o servidor. Use uma foto menor."
        : `Upload falhou (HTTP ${res.status || "rede"}). Sem resposta JSON — em produção é preciso Vercel Blob ou Supabase Storage.`,
    );
  }
  try {
    return JSON.parse(text) as { url?: string; error?: string };
  } catch {
    throw new Error("O servidor não devolveu JSON. Tente uma imagem menor (até ~4MB).");
  }
}

export function MediaField({
  label,
  value,
  accept = "image/*,video/*",
  folder = "uploads",
  onChange,
}: {
  label: string;
  value?: string;
  accept?: string;
  folder?: string;
  onChange: (url: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onFile(file?: File | null) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const prepared = file.type.startsWith("image/") ? await compressImage(file) : file;
      const fd = new FormData();
      fd.set("file", prepared);
      fd.set("folder", folder);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await readUploadResponse(res);
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
            <img src={value} alt="" className="absolute inset-0 h-full w-full object-cover" />
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
