"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { formatDate } from "@/lib/utils";

export function LocalizedDate({ iso }: { iso: string }) {
  const { locale } = useLanguage();
  return <>{formatDate(iso, locale === "pt" ? "pt-BR" : "en-IE")}</>;
}
