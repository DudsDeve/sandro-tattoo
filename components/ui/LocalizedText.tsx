"use client";

import type { ReactNode } from "react";
import { useT } from "@/lib/i18n/LanguageProvider";

export function PageIntro({
  labelKey,
  titleKey,
  bodyKey,
}: {
  labelKey: keyof ReturnType<typeof useT>["pages"];
  titleKey: keyof ReturnType<typeof useT>["pages"];
  bodyKey?: keyof ReturnType<typeof useT>["pages"];
}) {
  const t = useT();
  return (
    <>
      <p className="label-mono">{t.pages[labelKey]}</p>
      <h1 className="display-section mt-4 mb-4 max-w-4xl">{t.pages[titleKey]}</h1>
      {bodyKey ? <p className="mb-12 max-w-xl text-ink-secondary">{t.pages[bodyKey]}</p> : null}
    </>
  );
}

export function LocalizedText({
  children,
}: {
  children: (t: ReturnType<typeof useT>) => ReactNode;
}) {
  const t = useT();
  return <>{children(t)}</>;
}
