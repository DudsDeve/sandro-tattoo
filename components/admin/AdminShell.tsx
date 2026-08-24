"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Painel", exact: true },
  { href: "/admin/site", label: "Site" },
  { href: "/admin/categorias", label: "Categorias" },
  { href: "/admin/itens", label: "Trabalhos" },
  { href: "/admin/artistas", label: "Artistas" },
  { href: "/admin/depoimentos", label: "Depoimentos" },
  { href: "/admin/wishlist", label: "Wishlist" },
  { href: "/admin/clientes", label: "Clientes" },
  { href: "/admin/usuarios", label: "Usuários" },
  { href: "/admin/espera", label: "Espera" },
  { href: "/admin/configuracoes", label: "Configurações" },
  { href: "/admin/blog", label: "Blog + IA" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const isVisualEditor = path.startsWith("/admin/site/editor");
  const isWaitingTv = path.startsWith("/admin/espera/tv");

  if (path === "/admin/login" || isWaitingTv) {
    return <>{children}</>;
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e8e4df] lg:flex">
      <aside className="sticky top-0 z-40 flex max-h-screen w-full shrink-0 flex-col border-b border-[#1a1a1a] bg-black lg:h-screen lg:w-56 lg:border-b-0 lg:border-r">
        <div className="border-b border-[#1a1a1a] px-5 py-4">
          <p className="font-mono text-[0.65rem] tracking-[0.2em] text-[#8b9a6b]">ADMIN</p>
          <p className="font-serif text-xl">VERSUS</p>
        </div>
        <nav className="flex flex-1 flex-row flex-wrap gap-1 overflow-y-auto p-3 lg:flex-col lg:flex-nowrap">
          {LINKS.map((l) => {
            const active = l.exact ? path === l.href : path.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded px-3 py-2 text-sm",
                  active ? "bg-[#4c5634] text-white" : "text-[#a09b95] hover:bg-[#141414] hover:text-white",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex gap-4 border-t border-[#1a1a1a] px-5 py-4 text-sm">
          <Link href="/" className="text-[#a09b95] hover:text-white">
            Ver site
          </Link>
          <button type="button" onClick={() => void logout()} className="text-[#8b9a6b]">
            Sair
          </button>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <main className={cn(isVisualEditor ? "px-0 py-0" : "mx-auto max-w-6xl px-4 py-8 lg:px-8")}>
          {children}
        </main>
        {!isVisualEditor && (
          <p className="px-4 pb-8 text-center text-xs text-[#5c5955]">
            Use <span className="text-[#8b9a6b]">Site</span> para editar textos, imagens e vídeos no visual
            da página.
          </p>
        )}
      </div>
    </div>
  );
}
