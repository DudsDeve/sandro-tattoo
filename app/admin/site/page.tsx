"use client";

import Link from "next/link";
import { useState } from "react";
import { SITE_PAGES } from "@/lib/site-editor/registry";

export default function AdminSitePage() {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function restoreAllDefaults() {
    if (
      !confirm(
        "Restaurar o padrão de TODAS as páginas do site? Todas as edições salvas no editor Site serão descartadas.",
      )
    ) {
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/site", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reset: "all" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao restaurar");
      setMsg("Site inteiro restaurado ao padrão provisório.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Erro ao restaurar");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl">Site</h1>
          <p className="mt-2 max-w-2xl text-[#a09b95]">
            Editor visual página a página. Abra uma página, clique em textos, imagens ou vídeos e edite no
            painel — como no Elementor.
          </p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void restoreAllDefaults()}
          className="border border-[#4c5634]/60 px-4 py-2 text-sm text-[#8b9a6b] hover:bg-[#4c5634]/15"
          title="Volta todo o site aos valores padrão do sistema (ainda provisórios)"
        >
          {busy ? "Restaurando…" : "Restaurar padrão (todo o site)"}
        </button>
      </div>

      {msg && <p className="text-sm text-[#8b9a6b]">{msg}</p>}
      <p className="text-xs text-[#5c5955]">
        O padrão atual é provisório. Em breve você define o layout oficial — o botão passará a restaurar
        exatamente essa versão.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SITE_PAGES.map((page) => (
          <Link
            key={page.path}
            href={`/admin/site/editor?path=${encodeURIComponent(page.path)}`}
            className="border border-[#1a1a1a] bg-[#111] p-5 transition hover:border-[#4c5634]"
          >
            <p className="font-mono text-[0.65rem] tracking-[0.18em] text-[#8b9a6b]">{page.path}</p>
            <p className="mt-2 font-serif text-2xl">{page.label}</p>
            <p className="mt-2 text-sm text-[#5c5955]">{page.description}</p>
            <p className="mt-4 text-xs text-[#8b9a6b]">{page.fields.length} campos editáveis →</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
