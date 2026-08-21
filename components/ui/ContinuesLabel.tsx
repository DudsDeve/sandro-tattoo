"use client";

import { useT } from "@/lib/i18n/LanguageProvider";

export function ContinuesLabel() {
  const t = useT();
  return <p className="label-mono mb-4">{t.pages.continues}</p>;
}
