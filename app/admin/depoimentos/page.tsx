"use client";

import { useEffect, useState } from "react";
import { MediaField } from "@/components/admin/MediaField";
import { useAdminStore } from "@/components/admin/AdminStoreProvider";
import type { CmsTestimonial } from "@/lib/cms/types";
import { youtubeEmbedUrl } from "@/lib/utils";

const blank = (artistId = ""): Partial<CmsTestimonial> => ({
  title: "",
  description: "",
  name: "",
  artistId,
  image: "",
  video: "",
  youtubeUrl: "",
});

export default function AdminTestimonialsPage() {
  const { store, setStore, loading } = useAdminStore();
  const [draft, setDraft] = useState(blank());
  const [editing, setEditing] = useState<CmsTestimonial | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const firstArtistId = store?.artists[0]?.id ?? "";

  useEffect(() => {
    if (!firstArtistId) return;
    setDraft((d) => (d.artistId ? d : { ...d, artistId: firstArtistId }));
  }, [firstArtistId]);

  if (loading || !store) return <p className="text-[#a09b95]">Carregando…</p>;

  const yt = youtubeEmbedUrl(draft.youtubeUrl || "");
  const artistId = draft.artistId || firstArtistId;

  async function save() {
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/admin/testimonials", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing ? { ...editing, ...draft, artistId, id: editing.id } : { ...draft, artistId }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setMsg(data.error || "Erro ao salvar");
      return;
    }
    setStore(data);
    setDraft(blank(firstArtistId));
    setEditing(null);
    setMsg("Salvo");
  }

  async function remove(id: string) {
    if (!confirm("Remover este depoimento?")) return;
    const res = await fetch(`/api/admin/testimonials?id=${id}`, { method: "DELETE" });
    if (res.ok) setStore(await res.json());
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-4xl">Depoimentos</h1>
        <p className="mt-2 text-[#a09b95]">
          Título, texto, nome da pessoa e artista. Foto e vídeo opcionais — dá para enviar um arquivo ou colar um link do YouTube.
        </p>
      </div>

      <div className="grid gap-6 border border-[#1a1a1a] bg-[#111] p-5 lg:grid-cols-2">
        <div className="space-y-3">
          <input
            className="w-full border border-[#1a1a1a] bg-black px-3 py-3"
            placeholder="Título"
            value={draft.title || ""}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          />
          <input
            className="w-full border border-[#1a1a1a] bg-black px-3 py-3"
            placeholder="Nome da pessoa"
            value={draft.name || ""}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          />
          <select
            className="w-full border border-[#1a1a1a] bg-black px-3 py-3"
            value={artistId}
            onChange={(e) => setDraft((d) => ({ ...d, artistId: e.target.value }))}
            disabled={store.artists.length === 0}
          >
            {store.artists.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <textarea
            className="w-full border border-[#1a1a1a] bg-black px-3 py-3"
            rows={5}
            placeholder="Descrição / depoimento"
            value={draft.description || ""}
            onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
          />
          <input
            className="w-full border border-[#1a1a1a] bg-black px-3 py-3"
            placeholder="Link do YouTube (opcional)"
            value={draft.youtubeUrl || ""}
            onChange={(e) => setDraft((d) => ({ ...d, youtubeUrl: e.target.value }))}
          />
          {yt && (
            <div className="aspect-video overflow-hidden border border-[#1a1a1a]">
              <iframe title="YouTube" src={yt} className="h-full w-full" allowFullScreen />
            </div>
          )}
          <button
            type="button"
            disabled={busy || !artistId}
            onClick={() => void save()}
            className="bg-[#4c5634] px-4 py-3 text-sm text-white disabled:opacity-40"
          >
            {editing ? "Atualizar" : "Criar depoimento"}
          </button>
          {editing && (
            <button
              type="button"
              className="ml-2 text-sm text-[#a09b95]"
              onClick={() => {
                setEditing(null);
                setDraft(blank(firstArtistId));
              }}
            >
              Cancelar
            </button>
          )}
          {msg && <p className="text-sm text-[#8b9a6b]">{msg}</p>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <MediaField label="Foto (opcional)" value={draft.image} accept="image/*" folder="testimonials" onChange={(url) => setDraft((d) => ({ ...d, image: url }))} />
          <MediaField label="Vídeo arquivo (opcional)" value={draft.video} accept="video/*" folder="testimonials" onChange={(url) => setDraft((d) => ({ ...d, video: url }))} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(store.testimonials || [])
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((item) => {
            const artist = store.artists.find((a) => a.id === item.artistId);
            return (
              <article key={item.id} className="border border-[#1a1a1a] bg-black p-4">
                <p className="font-serif text-2xl">{item.title}</p>
                <p className="mt-1 text-sm text-[#8b9a6b]">{item.name}</p>
                <p className="mt-1 text-xs text-[#a09b95]">{artist?.name ?? "Sem artista"}</p>
                <p className="mt-2 line-clamp-3 text-sm text-[#a09b95]">{item.description}</p>
                <p className="mt-2 text-[10px] tracking-wider text-[#5c5955]">
                  {item.image ? "FOTO " : ""}
                  {item.video ? "VÍDEO " : ""}
                  {item.youtubeUrl ? "YOUTUBE" : ""}
                </p>
                <div className="mt-4 flex gap-3 text-sm">
                  <button
                    type="button"
                    className="text-[#8b9a6b]"
                    onClick={() => {
                      setEditing(item);
                      setDraft(item);
                    }}
                  >
                    Editar
                  </button>
                  <button type="button" className="text-[#8f4a4a]" onClick={() => void remove(item.id)}>
                    Excluir
                  </button>
                </div>
              </article>
            );
          })}
      </div>
    </div>
  );
}
