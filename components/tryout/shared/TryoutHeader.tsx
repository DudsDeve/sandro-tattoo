"use client";

import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useT } from "@/lib/i18n/LanguageProvider";

export function TryoutHeader() {
  const t = useT();
  return (
    <header className="mb-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <p className="label-mono">{t.tryout.label}</p>
        <LanguageSwitcher />
      </div>
      <h1 className="display-section mt-3 max-w-3xl">{t.tryout.title}</h1>
      <p className="mt-4 max-w-xl text-ink-secondary">{t.tryout.intro}</p>
    </header>
  );
}

export function TryoutDisclaimer() {
  const t = useT();
  return <p className="mt-8 max-w-2xl text-xs text-ink-muted">{t.tryout.disclaimer}</p>;
}
