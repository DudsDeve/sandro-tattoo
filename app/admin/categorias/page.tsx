"use client";

import { useState } from "react";
import { MediaField } from "@/components/admin/MediaField";
import { useAdminStore } from "@/components/admin/AdminStoreProvider";
import type { CmsCategory } from "@/lib/cms/types";

const blank = (): Partial<CmsCategory> => ({
  name: "",
  description: "",
  image: "",
  video: "",
  slug: "",
});

export default function AdminCategoriesPage() {
  const { store, setStore, loading } = useAdminStore();
  const [draft, setDraft] = useState(blank());
  const [editing, setEditing] = useState<CmsCategory | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  if (loading || !store) return <p className="text-[#a09b95]">Carregando…</p>;

  const categoryWorks = editing
    ? store.items.filter((item) => item.image && item.categoryId === editing.id)
    : [];

  async function save(nextDraft = draft, keepEditing = false) {
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/admin/categories", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing ? { ...editing, ...nextDraft, id: editing.id, image: nextDraft.image ?? "" } : nextDraft),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setMsg(data.error || "Erro ao salvar");
      return;
    }
    setStore(data);
    if (keepEditing && editing) {
      const updated = data.categories?.find((c: CmsCategory) => c.id === editing.id);
      if (updated) {
        setEditing(updated);
        setDraft(updated);
      }
      setMsg("Capa salva");
      return;
    }
    setDraft(blank());
    setEditing(null);
    setMsg("Salvo");
  }

  function setCover(url: string) {
    const next = { ...draft, image: url };
    setDraft(next);
    if (editing) void save(next, true);
  }

  async function remove(id: string) {
    if (!confirm("Remover categoria e desvincular itens?")) return;
    const res = await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
    if (res.ok) setStore(await res.json());
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-4xl">Categorias</h1>
        <p className="mt-2 text-[#a09b95]">
          Nome, texto curto e capa. A capa aparece nos cards da home — envie uma foto ou escolha um trabalho da categoria.
        </p>
      </div>

      <div className="grid gap-6 border border-[#1a1a1a] bg-[#111] p-5 lg:grid-cols-2">
        <div className="space-y-3">
          <input
            className="w-full border border-[#1a1a1a] bg-black px-3 py-3"
            placeholder="Nome"
            value={draft.name || ""}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          />
          <textarea
            className="w-full border border-[#1a1a1a] bg-black px-3 py-3"
            rows={3}
            placeholder="Descrição curta"
            value={draft.description || ""}
            onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => void save()}
            className="bg-[#4c5634] px-4 py-3 text-sm text-white"
          >
            {editing ? "Atualizar" : "Criar categoria"}
          </button>
          {editing && (
            <button
              type="button"
              className="ml-2 text-sm text-[#a09b95]"
              onClick={() => {
                setEditing(null);
                setDraft(blank());
              }}
            >
              Cancelar
            </button>
          )}
          {msg && <p className="text-sm text-[#8b9a6b]">{msg}</p>}
        </div>
        <div className="space-y-4">
          <MediaField
            label="Capa"
            value={draft.image}
            accept="image/*"
            folder="categories"
            onChange={setCover}
          />
          {categoryWorks.length > 0 && (
            <div>
              <p className="mb-2 font-mono text-[0.65rem] tracking-[0.18em] text-[#8b9a6b]">
                OU ESCOLHA UM TRABALHO
              </p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {categoryWorks.map((item) => {
                  const selected = draft.image === item.image;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      title={item.title}
                      onClick={() => setCover(item.image)}
                      className={`relative aspect-square overflow-hidden border bg-cover bg-center ${
                        selected ? "border-[#8b9a6b] ring-1 ring-[#8b9a6b]" : "border-[#1a1a1a]"
                      }`}
                      style={{ backgroundImage: `url(${item.image})` }}
                    >
                      {selected && (
                        <span className="absolute inset-x-0 bottom-0 bg-black/70 py-0.5 text-center text-[10px] text-[#8b9a6b]">
                          Capa
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <MediaField
            label="Vídeo (opcional)"
            value={draft.video}
            accept="video/*"
            folder="categories"
            onChange={(url) => setDraft((d) => ({ ...d, video: url }))}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {store.categories
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((c) => {
            const cover = c.image || store.items.find((i) => i.categoryId === c.id && i.image)?.image;
            return (
            <article key={c.id} className="overflow-hidden border border-[#1a1a1a] bg-black">
              <div
                className="relative aspect-[4/3] bg-[#111] bg-cover bg-center"
                style={{ backgroundImage: cover ? `url(${cover})` : undefined }}
              >
                {!cover && (
                  <span className="absolute inset-0 flex items-center justify-center font-mono text-[10px] tracking-[0.16em] text-[#5c5955]">
                    SEM CAPA
                  </span>
                )}
              </div>
              <div className="p-4">
                <h2 className="font-serif text-2xl">{c.name}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-[#a09b95]">{c.description}</p>
                <div className="mt-4 flex gap-3 text-sm">
                  <button
                    type="button"
                    className="text-[#8b9a6b]"
                    onClick={() => {
                      setEditing(c);
                      setDraft(c);
                    }}
                  >
                    Editar
                  </button>
                  <button type="button" className="text-[#8f4a4a]" onClick={() => void remove(c.id)}>
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
