"use client";

import { useMemo, useState } from "react";
import { useAdminStore } from "@/components/admin/AdminStoreProvider";
import type { CmsClient } from "@/lib/cms/types";

const SIZE_LABEL: Record<string, string> = {
  pequena: "Pequena",
  media: "Média",
  grande: "Grande / projeto",
};

export default function AdminClientsPage() {
  const { store, setStore, loading } = useAdminStore();
  const [openId, setOpenId] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const clients = useMemo(() => {
    const list = store?.clients ?? [];
    const term = q.trim().toLowerCase();
    if (!term) return list;
    return list.filter((c) =>
      [c.name, c.email, c.phone, c.instagram, c.artistName, c.idea, c.slot]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [store?.clients, q]);

  if (loading || !store) return <p className="text-[#a09b95]">Carregando…</p>;

  async function remove(id: string) {
    if (!confirm("Remover este cliente / pedido?")) return;
    const res = await fetch(`/api/admin/clients?id=${id}`, { method: "DELETE" });
    if (res.ok) setStore(await res.json());
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-4xl">Clientes</h1>
        <p className="mt-2 text-[#a09b95]">
          Cada envio de Book a session e cada lead do chat de atendimento aparece aqui.
        </p>
      </div>

      <input
        className="w-full max-w-md border border-[#1a1a1a] bg-black px-3 py-3"
        placeholder="Buscar por nome, e-mail, telefone, artista…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {!clients.length ? (
        <p className="text-sm text-[#a09b95]">Nenhum pedido ainda.</p>
      ) : (
        <div className="space-y-3">
          {clients.map((c) => (
            <ClientCard
              key={c.id}
              client={c}
              open={openId === c.id}
              onToggle={() => setOpenId((id) => (id === c.id ? null : c.id))}
              onRemove={() => void remove(c.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ClientCard({
  client: c,
  open,
  onToggle,
  onRemove,
}: {
  client: CmsClient;
  open: boolean;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const when = new Date(c.createdAt).toLocaleString("pt-BR");
  return (
    <article className="border border-[#1a1a1a] bg-[#111]">
      <button type="button" onClick={onToggle} className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-4 text-left">
        <div>
          <p className="font-medium">{c.name}</p>
          <p className="mt-1 text-sm text-[#a09b95]">
            {c.email} · {c.phone}
            {c.instagram ? ` · @${c.instagram.replace(/^@/, "")}` : ""}
          </p>
        </div>
        <div className="text-right text-sm text-[#a09b95]">
          <p>{c.artistName || (c.source === "chat" ? "Chat de atendimento" : "—")}</p>
          <p className="mt-1 font-mono text-xs">{when}</p>
        </div>
      </button>
      {open && (
        <div className="space-y-3 border-t border-[#1a1a1a] px-4 py-4 text-sm">
          <p>
            <span className="text-[#8b9a6b]">Horário:</span> {c.slot}
          </p>
          <p>
            <span className="text-[#8b9a6b]">Local / tamanho:</span> {c.bodyPart} · {SIZE_LABEL[c.size] || c.size} ·{" "}
            {c.firstTattoo === "sim" ? "primeira tattoo" : "já tem tattoo"}
          </p>
          {c.ideaLink ? (
            <p>
              <span className="text-[#8b9a6b]">Link:</span>{" "}
              <a href={c.ideaLink} target="_blank" rel="noreferrer" className="text-[#8b9a6b] underline">
                {c.ideaLink}
              </a>
            </p>
          ) : null}
          <p className="whitespace-pre-wrap text-[#e8e4df]">
            <span className="text-[#8b9a6b]">Ideia:</span>
            {"\n"}
            {c.idea}
          </p>
          {c.ideaImages?.length ? (
            <div className="flex flex-wrap gap-2">
              {c.ideaImages.map((src) => (
                <a key={src} href={src} target="_blank" rel="noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-20 w-16 object-cover" />
                </a>
              ))}
            </div>
          ) : null}
          <button type="button" className="text-xs text-red-400/80" onClick={onRemove}>
            Remover
          </button>
        </div>
      )}
    </article>
  );
}
