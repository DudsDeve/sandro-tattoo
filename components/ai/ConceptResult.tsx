"use client";

import Image from "next/image";
import { CtaLink } from "@/components/ui/CursorLink";

export function ConceptResult({
  imageUrl,
  loading,
}: {
  imageUrl: string | null;
  loading: boolean;
}) {
  return (
    <div className="border border-line p-4">
      <p className="label-mono mb-3">Referência gerada</p>
      {loading && <p className="text-sm text-ink-secondary">Gerando imagem…</p>}
      {imageUrl && (
        <div className="relative aspect-square overflow-hidden">
          <Image src={imageUrl} alt="Conceito gerado" fill className="object-cover" unoptimized />
        </div>
      )}
      <p className="mt-3 text-xs text-ink-muted">
        É uma base para o artista — a peça final é desenhada à mão para o seu corpo.
      </p>
      <div className="mt-4">
        <CtaLink href="/agendar">Agendar com este conceito</CtaLink>
      </div>
    </div>
  );
}
