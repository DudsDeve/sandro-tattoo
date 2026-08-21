"use client";

import { CtaLink } from "@/components/ui/CursorLink";
import { useT } from "@/lib/i18n/LanguageProvider";

export default function NotFound() {
  const t = useT();
  return (
    <div className="flex min-h-[80svh] flex-col items-center justify-center px-5 text-center">
      <p className="label-mono">404</p>
      <h1 className="display-section mt-4">{t.pages.notFound}</h1>
      <div className="mt-10">
        <CtaLink href="/">{t.pages.backHome}</CtaLink>
      </div>
    </div>
  );
}
