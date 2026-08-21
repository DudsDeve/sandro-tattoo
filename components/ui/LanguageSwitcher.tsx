"use client";

import { LOCALES } from "@/lib/i18n/config";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useLanguage();
  const next = locale === "en" ? LOCALES.find((l) => l.code === "pt")! : LOCALES.find((l) => l.code === "en")!;

  return (
    <button
      type="button"
      onClick={() => setLocale(next.code)}
      className={cn(
        "inline-flex items-center gap-1.5 rounded border border-line px-2.5 py-1.5 text-xs tracking-wide text-ink-secondary transition hover:border-line-accent hover:text-ink",
        className,
      )}
      aria-label={next.aria}
      title={next.aria}
    >
      <span className="text-base leading-none" aria-hidden>
        {locale === "en" ? "🇬🇧" : "🇧🇷"}
      </span>
      <span className="font-mono text-[0.65rem]">{locale.toUpperCase()}</span>
    </button>
  );
}
