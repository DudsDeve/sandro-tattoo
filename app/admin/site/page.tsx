"use client";

import Link from "next/link";
import { SITE_PAGES } from "@/lib/site-editor/registry";

export default function AdminSitePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-4xl">Site</h1>
        <p className="mt-2 max-w-2xl text-[#a09b95]">
          Editor visual página a página. Abra uma página, clique em textos, imagens ou vídeos e edite no
          painel — como no Elementor.
        </p>
      </div>

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
