"use client";

import { useState } from "react";
import { MediaField } from "@/components/admin/MediaField";
import { useAdminStore } from "@/components/admin/AdminStoreProvider";
import { MediaImage } from "@/components/ui/MediaImage";
import type { CmsWishlistItem } from "@/lib/cms/types";

const blank = (): Partial<CmsWishlistItem> => ({
  title: "",
  image: "",
  discountPercent: 20,
  note: "",
  visible: true,
});

export default function AdminWishlistPage() {
  const { store, setStore, loading } = useAdminStore();
  const [draft, setDraft] = useState(blank());
  const [editing, setEditing] = useState<CmsWishlistItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  if (loading || !store) return <p className="text-[#a09b95]">Carregando…</p>;

  async function save() {
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/admin/wishlist", {
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
    setMsg("Salvo — aparece em /wishlist no site");
  }

  async function remove(id: string) {
    if (!confirm("Remover este item da wishlist?")) return;
    const res = await fetch(`/api/admin/wishlist?id=${id}`, { method: "DELETE" });
    if (res.ok) setStore(await res.json());
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-4xl">Wishlist</h1>
        <p className="mt-2 text-[#a09b95]">
          Envie a imagem do projeto e a % de desconto. Itens visíveis aparecem na aba Wishlist do menu.
        </p>
      </div>

      <div className="grid gap-6 border border-[#1a1a1a] bg-[#111] p-5 lg:grid-cols-2">
        <div className="space-y-3">
          <input
            className="w-full border border-[#1a1a1a] bg-black px-3 py-3"
            placeholder="Título do projeto"
            value={draft.title || ""}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          />
          <label className="block text-sm text-[#a09b95]">
            Desconto (%)
            <input
              type="number"
              min={1}
              max={90}
              className="mt-1 w-full border border-[#1a1a1a] bg-black px-3 py-3 text-white"
              value={draft.discountPercent ?? 20}
              onChange={(e) => setDraft((d) => ({ ...d, discountPercent: Number(e.target.value) }))}
            />
          </label>
          <textarea
            className="w-full border border-[#1a1a1a] bg-black px-3 py-3"
            rows={3}
            placeholder="Nota opcional (tamanho, estilo…)"
            value={draft.note || ""}
            onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))}
          />
          <label className="flex items-center gap-2 text-sm text-[#a09b95]">
            <input
              type="checkbox"
              checked={draft.visible !== false}
              onChange={(e) => setDraft((d) => ({ ...d, visible: e.target.checked }))}
            />
            Visível no site
          </label>
          <button
            type="button"
            disabled={busy}
            onClick={() => void save()}
            className="bg-[#4c5634] px-4 py-3 text-sm text-white disabled:opacity-40"
          >
            {editing ? "Atualizar" : "Adicionar à wishlist"}
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
        <MediaField
          label="Imagem do projeto"
          value={draft.image}
          accept="image/*"
          folder="wishlist"
          onChange={(url) => setDraft((d) => ({ ...d, image: url }))}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(store.wishlistItems || [])
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((item) => (
            <article key={item.id} className="border border-[#1a1a1a] bg-black p-4">
              {item.image ? (
                <div className="relative mb-3 aspect-[3/4] w-full overflow-hidden">
                  <MediaImage src={item.image} alt="" fill className="object-cover" sizes="33vw" />
                </div>
              ) : null}
              <p className="font-serif text-2xl">{item.title}</p>
              <p className="mt-1 text-sm text-[#8b9a6b]">−{item.discountPercent}%</p>
              {item.note ? <p className="mt-2 line-clamp-2 text-sm text-[#a09b95]">{item.note}</p> : null}
              <p className="mt-2 text-[10px] tracking-wider text-[#5c5955]">
                {item.visible === false ? "OCULTO" : "NO SITE"}
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
          ))}
      </div>
    </div>
  );
}
