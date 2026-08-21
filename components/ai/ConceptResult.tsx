"use client";

import Image from "next/image";
import { CtaLink } from "@/components/ui/CursorLink";
import { useT } from "@/lib/i18n/LanguageProvider";

export function ConceptResult({
  imageUrl,
  loading,
}: {
  imageUrl: string | null;
  loading: boolean;
}) {
  const t = useT();
  return (
    <div className="border border-line p-4">
      <p className="label-mono mb-3">{t.concept.generated}</p>
      {loading && <p className="text-sm text-ink-secondary">{t.concept.generating}</p>}
      {imageUrl && (
        <div className="relative aspect-square overflow-hidden">
          <Image src={imageUrl} alt={t.concept.generated} fill className="object-cover" unoptimized />
        </div>
      )}
      <p className="mt-3 text-xs text-ink-muted">{t.concept.disclaimer}</p>
      <div className="mt-4">
        <CtaLink href="/agendar">{t.concept.bookConcept}</CtaLink>
      </div>
    </div>
  );
}
