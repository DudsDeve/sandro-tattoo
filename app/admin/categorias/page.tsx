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

  async function save() {
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/admin/categories", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing ? { ...editing, ...draft, id: editing.id } : draft),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setMsg(data.error || "Erro ao salvar");
      return;
    }
    setStore(data);
    setDraft(blank());
    setEditing(null);
    setMsg("Salvo");
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
        <p className="mt-2 text-[#a09b95]">Estilos visuais (blackwork, realismo…). Só nome, texto curto e mídia.</p>
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
        <div className="grid gap-4 sm:grid-cols-2">
          <MediaField label="Imagem" value={draft.image} accept="image/*" onChange={(url) => setDraft((d) => ({ ...d, image: url }))} />
          <MediaField label="Vídeo (opcional)" value={draft.video} accept="video/*" onChange={(url) => setDraft((d) => ({ ...d, video: url }))} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {store.categories
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((c) => (
            <article key={c.id} className="overflow-hidden border border-[#1a1a1a] bg-black">
              <div
                className="aspect-[4/3] bg-cover bg-center"
                style={{ backgroundImage: c.image ? `url(${c.image})` : undefined }}
              />
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
          ))}
      </div>
    </div>
  );
}
