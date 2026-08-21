"use client";

import { useMemo, useState } from "react";
import { MediaField } from "@/components/admin/MediaField";
import { useAdminStore } from "@/components/admin/AdminStoreProvider";
import type { CmsWorkItem } from "@/lib/cms/types";

const blank = (categoryId = ""): Partial<CmsWorkItem> => ({
  title: "",
  categoryId,
  artistId: "",
  image: "",
  video: "",
  bodyPart: "",
  hours: 4,
});

export default function AdminItemsPage() {
  const { store, setStore, loading } = useAdminStore();
  const [draft, setDraft] = useState(blank());
  const [editing, setEditing] = useState<CmsWorkItem | null>(null);
  const [filter, setFilter] = useState("all");
  const [busy, setBusy] = useState(false);

  const items = useMemo(() => {
    if (!store) return [];
    if (filter === "all") return store.items;
    return store.items.filter((i) => i.categoryId === filter);
  }, [store, filter]);

  if (loading || !store) return <p className="text-[#a09b95]">Carregando…</p>;

  async function save() {
    setBusy(true);
    const res = await fetch("/api/admin/items", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing ? { ...editing, ...draft, id: editing.id } : draft),
    });
    setBusy(false);
    if (res.ok) {
      setStore(await res.json());
      setDraft(blank(draft.categoryId));
      setEditing(null);
    }
  }

  async function remove(id: string) {
    if (!confirm("Remover este trabalho?")) return;
    const res = await fetch(`/api/admin/items?id=${id}`, { method: "DELETE" });
    if (res.ok) setStore(await res.json());
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-4xl">Trabalhos</h1>
        <p className="mt-2 text-[#a09b95]">Adicione fotos/vídeos às categorias e vincule a um artista.</p>
      </div>

      <div className="grid gap-6 border border-[#1a1a1a] bg-[#111] p-5 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-3">
          <input
            className="w-full border border-[#1a1a1a] bg-black px-3 py-3"
            placeholder="Título"
            value={draft.title || ""}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          />
          <select
            className="w-full border border-[#1a1a1a] bg-black px-3 py-3"
            value={draft.categoryId || ""}
            onChange={(e) => setDraft((d) => ({ ...d, categoryId: e.target.value }))}
          >
            <option value="">Categoria</option>
            {store.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            className="w-full border border-[#1a1a1a] bg-black px-3 py-3"
            value={draft.artistId || ""}
            onChange={(e) => setDraft((d) => ({ ...d, artistId: e.target.value }))}
          >
            <option value="">Artista (opcional)</option>
            {store.artists.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input
              className="border border-[#1a1a1a] bg-black px-3 py-3"
              placeholder="Parte do corpo"
              value={draft.bodyPart || ""}
              onChange={(e) => setDraft((d) => ({ ...d, bodyPart: e.target.value }))}
            />
            <input
              type="number"
              className="border border-[#1a1a1a] bg-black px-3 py-3"
              placeholder="Horas"
              value={draft.hours ?? 4}
              onChange={(e) => setDraft((d) => ({ ...d, hours: Number(e.target.value) }))}
            />
          </div>
          <button type="button" disabled={busy} onClick={() => void save()} className="bg-[#4c5634] px-4 py-3 text-sm text-white">
            {editing ? "Atualizar" : "Adicionar trabalho"}
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <MediaField label="Foto" value={draft.image} accept="image/*" onChange={(url) => setDraft((d) => ({ ...d, image: url }))} />
          <MediaField label="Vídeo" value={draft.video} accept="video/*" onChange={(url) => setDraft((d) => ({ ...d, video: url }))} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`border px-3 py-1.5 text-sm ${filter === "all" ? "border-[#4c5634] bg-[#4c5634]" : "border-[#1a1a1a]"}`}
        >
          Todos
        </button>
        {store.categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setFilter(c.id)}
            className={`border px-3 py-1.5 text-sm ${filter === c.id ? "border-[#4c5634] bg-[#4c5634]" : "border-[#1a1a1a]"}`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => {
          const cat = store.categories.find((c) => c.id === item.categoryId);
          const artist = store.artists.find((a) => a.id === item.artistId);
          return (
            <article key={item.id} className="overflow-hidden border border-[#1a1a1a] bg-black">
              <div className="aspect-[3/4] bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }} />
              <div className="p-3">
                <p className="font-serif text-lg">{item.title}</p>
                <p className="text-xs text-[#8b9a6b]">
                  {cat?.name}
                  {artist ? ` · ${artist.name}` : ""}
                </p>
                <div className="mt-3 flex gap-3 text-sm">
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
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
