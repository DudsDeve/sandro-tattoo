"use client";

import { useState } from "react";
import Link from "next/link";
import { useAdminStore } from "@/components/admin/AdminStoreProvider";
import type { CmsWaitingVideo } from "@/lib/cms/types";

export default function AdminWaitingPage() {
  const { store, setStore, loading } = useAdminStore();
  const [title, setTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  if (loading || !store) return <p className="text-[#a09b95]">Carregando…</p>;

  async function save() {
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/admin/waiting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, youtubeUrl }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setMsg(data.error || "Erro ao salvar");
      return;
    }
    setStore(data);
    setTitle("");
    setYoutubeUrl("");
    setMsg("Vídeo adicionado à espera");
  }

  async function remove(id: string) {
    if (!confirm("Remover este YouTube da espera?")) return;
    const res = await fetch(`/api/admin/waiting?id=${id}`, { method: "DELETE" });
    if (res.ok) setStore(await res.json());
  }

  const clips = [...(store.waitingVideos || [])].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl">Modo de espera</h1>
          <p className="mt-2 max-w-xl text-[#a09b95]">
            Tela cheia para TV: fotos e vídeos dos trabalhos, mais os YouTube que você colar aqui.
            Transições leves, sem menu.
          </p>
        </div>
        <Link
          href="/admin/espera/tv"
          className="bg-[#4c5634] px-5 py-3 text-sm text-white"
        >
          Iniciar na TV
        </Link>
      </div>

      <div className="grid gap-3 border border-[#1a1a1a] bg-[#111] p-5 lg:grid-cols-[1fr_2fr_auto]">
        <input
          className="border border-[#1a1a1a] bg-black px-3 py-3"
          placeholder="Título (opcional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="border border-[#1a1a1a] bg-black px-3 py-3"
          placeholder="https://youtube.com/watch?v=…"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => void save()}
          className="bg-[#4c5634] px-4 py-3 text-sm text-white disabled:opacity-40"
        >
          Adicionar YouTube
        </button>
      </div>
      {msg ? <p className="text-sm text-[#8b9a6b]">{msg}</p> : null}

      <ul className="space-y-2">
        {clips.map((clip: CmsWaitingVideo) => (
          <li
            key={clip.id}
            className="flex flex-wrap items-center justify-between gap-3 border border-[#1a1a1a] bg-black px-4 py-3"
          >
            <div>
              <p className="text-[#e8e4df]">{clip.title}</p>
              <p className="mt-1 break-all text-xs text-[#a09b95]">{clip.youtubeUrl}</p>
            </div>
            <button type="button" className="text-sm text-[#8f4a4a]" onClick={() => void remove(clip.id)}>
              Excluir
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
