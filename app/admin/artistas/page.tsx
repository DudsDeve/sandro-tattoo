"use client";

import { useState } from "react";
import { MediaField } from "@/components/admin/MediaField";
import { useAdminStore } from "@/components/admin/AdminStoreProvider";
import type { CmsArtist } from "@/lib/cms/types";

const blank = (): Partial<CmsArtist> => ({
  name: "",
  role: "Artista",
  specialty: "",
  specialtyIds: [],
  years: 1,
  bio: "",
  bioLong: "",
  instagram: "",
  image: "",
  available: true,
  works: [],
});

export default function AdminArtistsPage() {
  const { store, setStore, loading } = useAdminStore();
  const [draft, setDraft] = useState(blank());
  const [editing, setEditing] = useState<CmsArtist | null>(null);
  const [workTitle, setWorkTitle] = useState("");
  const [workImage, setWorkImage] = useState("");
  const [busy, setBusy] = useState(false);

  if (loading || !store) return <p className="text-[#a09b95]">Carregando…</p>;

  async function save() {
    setBusy(true);
    const res = await fetch("/api/admin/artists", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing ? { ...editing, ...draft, id: editing.id } : draft),
    });
    setBusy(false);
    if (res.ok) {
      const data = await res.json();
      setStore(data);
      if (!editing) {
        setDraft(blank());
      } else {
        const updated = data.artists.find((a: CmsArtist) => a.id === editing.id);
        if (updated) {
          setEditing(updated);
          setDraft(updated);
        }
      }
    }
  }

  async function addWork() {
    if (!editing || !workImage) return;
    setBusy(true);
    const res = await fetch("/api/admin/artists", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editing.id,
        addWork: { title: workTitle || "Trabalho", image: workImage },
      }),
    });
    setBusy(false);
    if (res.ok) {
      const data = await res.json();
      setStore(data);
      const updated = data.artists.find((a: CmsArtist) => a.id === editing.id);
      setEditing(updated);
      setDraft(updated);
      setWorkImage("");
      setWorkTitle("");
    }
  }

  async function removeWork(workId: string) {
    if (!editing) return;
    const res = await fetch("/api/admin/artists", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editing.id, removeWorkId: workId }),
    });
    if (res.ok) {
      const data = await res.json();
      setStore(data);
      const updated = data.artists.find((a: CmsArtist) => a.id === editing.id);
      setEditing(updated);
      setDraft(updated);
    }
  }

  async function remove(id: string) {
    if (!confirm("Remover artista?")) return;
    const res = await fetch(`/api/admin/artists?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setStore(await res.json());
      setEditing(null);
      setDraft(blank());
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-4xl">Artistas</h1>
        <p className="mt-2 text-[#a09b95]">Cadastre a equipe e linke fotos dos trabalhos de cada pessoa.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-3 border border-[#1a1a1a] bg-[#111] p-5">
          <MediaField label="Foto do artista" value={draft.image} accept="image/*" onChange={(url) => setDraft((d) => ({ ...d, image: url }))} />
          <input className="w-full border border-[#1a1a1a] bg-black px-3 py-3" placeholder="Nome" value={draft.name || ""} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="border border-[#1a1a1a] bg-black px-3 py-3" placeholder="Função" value={draft.role || ""} onChange={(e) => setDraft((d) => ({ ...d, role: e.target.value }))} />
            <input className="border border-[#1a1a1a] bg-black px-3 py-3" placeholder="Especialidade" value={draft.specialty || ""} onChange={(e) => setDraft((d) => ({ ...d, specialty: e.target.value }))} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="font-mono text-[0.65rem] tracking-[0.18em] text-[#8b9a6b]">ANOS DE EXPERIÊNCIA</span>
              <input
                type="number"
                min={0}
                className="mt-2 w-full border border-[#1a1a1a] bg-black px-3 py-3"
                placeholder="Anos"
                value={draft.years ?? 1}
                onChange={(e) => setDraft((d) => ({ ...d, years: Number(e.target.value) }))}
              />
            </label>
            <label className="block sm:col-span-1">
              <span className="font-mono text-[0.65rem] tracking-[0.18em] text-[#8b9a6b]">INSTAGRAM</span>
              <input
                className="mt-2 w-full border border-[#1a1a1a] bg-black px-3 py-3"
                placeholder="@usuario ou https://instagram.com/usuario"
                value={draft.instagram || ""}
                onChange={(e) => setDraft((d) => ({ ...d, instagram: e.target.value }))}
              />
              {draft.instagram ? (
                <a
                  href={
                    draft.instagram.includes("instagram.com")
                      ? draft.instagram.startsWith("http")
                        ? draft.instagram
                        : `https://${draft.instagram}`
                      : `https://instagram.com/${draft.instagram.replace(/^@/, "")}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-xs text-[#8b9a6b] underline"
                >
                  Abrir perfil →
                </a>
              ) : (
                <p className="mt-2 text-xs text-[#5c5955]">Aparece no site como botão Instagram do artista.</p>
              )}
            </label>
          </div>
          <textarea className="w-full border border-[#1a1a1a] bg-black px-3 py-3" rows={2} placeholder="Bio curta" value={draft.bio || ""} onChange={(e) => setDraft((d) => ({ ...d, bio: e.target.value }))} />
          <textarea className="w-full border border-[#1a1a1a] bg-black px-3 py-3" rows={4} placeholder="Bio longa" value={draft.bioLong || ""} onChange={(e) => setDraft((d) => ({ ...d, bioLong: e.target.value }))} />
          <div className="flex flex-wrap gap-2">
            {store.categories.map((c) => {
              const on = (draft.specialtyIds || []).includes(c.slug);
              return (
                <button
                  key={c.id}
                  type="button"
                  className={`border px-3 py-1 text-xs ${on ? "border-[#4c5634] bg-[#4c5634]" : "border-[#1a1a1a]"}`}
                  onClick={() =>
                    setDraft((d) => ({
                      ...d,
                      specialtyIds: on
                        ? (d.specialtyIds || []).filter((s) => s !== c.slug)
                        : [...(d.specialtyIds || []), c.slug],
                    }))
                  }
                >
                  {c.name}
                </button>
              );
            })}
          </div>
          <button type="button" disabled={busy} onClick={() => void save()} className="bg-[#4c5634] px-4 py-3 text-sm text-white">
            {editing ? "Salvar artista" : "Adicionar artista"}
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
              Novo
            </button>
          )}
        </div>

        <div className="space-y-4">
          {store.artists.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => {
                setEditing(a);
                setDraft(a);
              }}
              className={`flex w-full items-center gap-4 border p-3 text-left ${editing?.id === a.id ? "border-[#4c5634]" : "border-[#1a1a1a]"}`}
            >
              <div className="h-16 w-16 shrink-0 bg-cover bg-center" style={{ backgroundImage: `url(${a.image})` }} />
              <div className="min-w-0 flex-1">
                <p className="font-serif text-xl">{a.name}</p>
                <p className="text-xs text-[#8b9a6b]">
                  {a.specialty} · {a.works.length} trabalhos
                  {a.instagram ? ` · @${a.instagram.replace(/^@/, "")}` : ""}
                </p>
              </div>
              <span
                className="text-xs text-[#8f4a4a]"
                onClick={(e) => {
                  e.stopPropagation();
                  void remove(a.id);
                }}
              >
                Excluir
              </span>
            </button>
          ))}

          {editing && (
            <div className="border border-[#1a1a1a] bg-[#111] p-4">
              <p className="font-mono text-[0.65rem] tracking-[0.18em] text-[#8b9a6b]">TRABALHOS DE {editing.name.toUpperCase()}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <MediaField label="Nova foto" value={workImage} accept="image/*" onChange={setWorkImage} />
                <div className="space-y-3">
                  <input className="w-full border border-[#1a1a1a] bg-black px-3 py-3" placeholder="Título do trabalho" value={workTitle} onChange={(e) => setWorkTitle(e.target.value)} />
                  <button type="button" disabled={busy || !workImage} onClick={() => void addWork()} className="bg-[#4c5634] px-4 py-3 text-sm text-white">
                    Linkar foto
                  </button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {editing.works.map((w) => (
                  <div key={w.id} className="relative aspect-square overflow-hidden border border-[#1a1a1a]">
                    <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${w.image})` }} />
                    <button type="button" className="absolute inset-x-0 bottom-0 bg-black/70 py-1 text-[10px] text-[#8f4a4a]" onClick={() => void removeWork(w.id)}>
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
