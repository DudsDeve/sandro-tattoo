"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAdminStore } from "@/components/admin/AdminStoreProvider";

type PersistenceInfo = {
  persistence: "supabase" | "blob" | "local";
  ready: boolean;
  hint: string;
  supabase: { configured: boolean; url: string | null };
};

export default function AdminHomePage() {
  const { store, loading } = useAdminStore();
  const [persistence, setPersistence] = useState<PersistenceInfo | null>(null);

  useEffect(() => {
    void fetch("/api/admin/persistence")
      .then((r) => r.json())
      .then((d: PersistenceInfo) => setPersistence(d))
      .catch(() => undefined);
  }, []);

  if (loading || !store) {
    return <p className="text-[#a09b95]">Carregando painel…</p>;
  }

  const cards = [
    { href: "/admin/site", label: "Site", count: "∞", hint: "Editor visual página a página" },
    { href: "/admin/categorias", label: "Categorias", count: store.categories.length, hint: "Estilos / seções visuais" },
    { href: "/admin/itens", label: "Trabalhos", count: store.items.length, hint: "Fotos e vídeos por categoria" },
    { href: "/admin/artistas", label: "Artistas", count: store.artists.length, hint: "Equipe + portfólio" },
    { href: "/admin/blog", label: "Posts", count: store.posts.length, hint: "Blog com IA e SEO" },
  ];

  const modeLabel =
    persistence?.persistence === "supabase"
      ? "Supabase (banco)"
      : persistence?.persistence === "blob"
        ? "Vercel Blob (fallback)"
        : "Arquivo local (dev)";

  return (
    <div>
      <h1 className="font-serif text-4xl">Painel</h1>
      <p className="mt-2 max-w-2xl text-[#a09b95]">
        Edite o site no visual (Site), gerencie mídia e conteúdo do blog. Clique em textos, imagens e
        vídeos no editor para alterar.
      </p>

      {persistence && (
        <div
          className={`mt-6 border p-4 ${
            persistence.ready ? "border-[#4c5634]/60 bg-[#111]" : "border-[#5c4030] bg-[#14110e]"
          }`}
        >
          <p className="font-mono text-[0.65rem] tracking-[0.18em] text-[#8b9a6b]">PERSISTÊNCIA</p>
          <p className="mt-2 text-sm text-[#e8e4df]">
            Modo atual: <span className="text-[#8b9a6b]">{modeLabel}</span>
          </p>
          <p className="mt-1 text-xs text-[#a09b95]">{persistence.hint}</p>
          {!persistence.ready && (
            <p className="mt-2 text-xs text-[#a09b95]">
              SQL: <code className="text-[#8b9a6b]">supabase/migrations/001_cms.sql</code> · vars:{" "}
              <code className="text-[#8b9a6b]">NEXT_PUBLIC_SUPABASE_URL</code> +{" "}
              <code className="text-[#8b9a6b]">SUPABASE_SERVICE_ROLE_KEY</code>
            </p>
          )}
        </div>
      )}

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="border border-[#1a1a1a] bg-[#111] p-5 hover:border-[#4c5634]">
            <p className="font-mono text-[0.65rem] tracking-[0.18em] text-[#8b9a6b]">{c.label}</p>
            <p className="mt-3 font-serif text-4xl">{c.count}</p>
            <p className="mt-2 text-sm text-[#a09b95]">{c.hint}</p>
          </Link>
        ))}
      </div>
      <p className="mt-8 text-xs text-[#5c5955]">Atualizado: {new Date(store.updatedAt).toLocaleString("pt-BR")}</p>
    </div>
  );
}
