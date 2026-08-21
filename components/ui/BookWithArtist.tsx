"use client";

import { CtaLink } from "@/components/ui/CursorLink";
import { useT } from "@/lib/i18n/LanguageProvider";

export function BookWithArtist({
  slug,
  firstName,
  variant = "solid",
}: {
  slug: string;
  firstName: string;
  variant?: "outline" | "solid";
}) {
  const t = useT();
  return (
    <CtaLink href={`/agendar?artista=${slug}`} variant={variant}>
      {t.quiz.bookWith} {firstName}
    </CtaLink>
  );
}
