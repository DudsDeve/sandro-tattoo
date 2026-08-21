"use client";

import Link from "next/link";
import { useAdminStore } from "@/components/admin/AdminStoreProvider";

export default function AdminHomePage() {
  const { store, loading } = useAdminStore();

  if (loading || !store) {
    return <p className="text-[#a09b95]">Carregando painel…</p>;
  }

  const cards = [
    { href: "/admin/categorias", label: "Categorias", count: store.categories.length, hint: "Estilos / seções visuais" },
    { href: "/admin/itens", label: "Trabalhos", count: store.items.length, hint: "Fotos e vídeos por categoria" },
    { href: "/admin/artistas", label: "Artistas", count: store.artists.length, hint: "Equipe + portfólio" },
    { href: "/admin/blog", label: "Posts", count: store.posts.length, hint: "Blog com IA e SEO" },
  ];

  return (
    <div>
      <h1 className="font-serif text-4xl">Painel</h1>
      <p className="mt-2 max-w-2xl text-[#a09b95]">
        Foque em mídia: capas, trabalhos e vídeos. A navegação e o layout do site não mudam por aqui.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
