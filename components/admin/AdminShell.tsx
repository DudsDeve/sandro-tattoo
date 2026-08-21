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
  { href: "/admin/blog", label: "Blog + IA" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const isVisualEditor = path.startsWith("/admin/site/editor");

  if (path === "/admin/login") {
    return <>{children}</>;
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e8e4df]">
      <header className="sticky top-0 z-40 border-b border-[#1a1a1a] bg-black/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="font-mono text-[0.65rem] tracking-[0.2em] text-[#8b9a6b]">ADMIN</p>
            <p className="font-serif text-xl">Sandro Tattoo</p>
          </div>
          <nav className="flex flex-wrap gap-1">
            {LINKS.map((l) => {
              const active = l.exact ? path === l.href : path.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "rounded px-3 py-2 text-sm",
                    active ? "bg-[#4c5634] text-white" : "text-[#a09b95] hover:text-white",
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/" className="text-[#a09b95] hover:text-white">
              Ver site
            </Link>
            <button type="button" onClick={logout} className="text-[#8b9a6b]">
              Sair
            </button>
          </div>
        </div>
      </header>
      <main className={cn(isVisualEditor ? "max-w-none px-0 py-0" : "mx-auto max-w-7xl px-4 py-8")}>
        {children}
      </main>
      {!isVisualEditor && (
        <p className="px-4 pb-8 text-center text-xs text-[#5c5955]">
          Use <span className="text-[#8b9a6b]">Site</span> para editar textos, imagens e vídeos no visual
          da página.
        </p>
      )}
    </div>
  );
}
