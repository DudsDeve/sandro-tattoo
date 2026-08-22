"use client";

import { useEffect, useState } from "react";
import { ProcessScenes } from "@/components/home/ProcessScenes";
import { EditableText } from "@/components/site-editor/Editable";
import { processSteps } from "@/lib/data/content";
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, type Locale } from "@/lib/i18n/config";
import { en } from "@/lib/i18n/messages/en";
import { pt } from "@/lib/i18n/messages/pt";
import type { ProcessStep } from "@/lib/types";

const EN_STEPS: Record<string, Pick<ProcessStep, "title" | "body" | "detail">> = {
  consulta: {
    title: "Consultation",
    body: "We talk intention, references, body placement and budget. No pressure to draw on the spot.",
    detail: "In person or video. 30–45 minutes. You leave with a clear brief: style, scale and artist.",
  },
  design: {
    title: "Design",
    body: "The artist builds the piece for your body — not a generic flash. You approve before the needle.",
    detail: "Studies, adjustments and, when it helps, the concept generator as a visual starting point.",
  },
  preparacao: {
    title: "Prep",
    body: "Stencil, placement, skin check and session agreements. Breathe before the first line.",
    detail: "Sleep, eat, hydrate. Arrive sober. We’ll tell you what to wear for the placement.",
  },
  sessao: {
    title: "Session",
    body: "Low music, honest breaks, unhurried technique. The session lasts as long as the skin allows well.",
    detail: "Sessions of 3 to 6 hours. Large projects break into chapters — never into rush.",
  },
  cuidados: {
    title: "Aftercare",
    body: "Kit, written instructions and a direct channel in the first days. Healing is part of the tattoo.",
    detail: "Film, washing, thin moisture. No sun, pool or gym until we clear you.",
  },
  cicatrizacao: {
    title: "Healing",
    body: "Touch-up if needed, healed photo, and an invite to the next layer of the project.",
    detail: "Review in 4–6 weeks. Large pieces get continuity — the body becomes a living archive.",
  },
};

export default function ProcessoPage() {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const sync = () => {
      const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY);
      if (saved === "en" || saved === "pt") setLocale(saved);
    };
    sync();
    window.addEventListener("versus-locale", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("versus-locale", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const t = locale === "pt" ? pt : en;
  const steps =
    locale === "en"
      ? processSteps.map((s) => ({ ...s, ...(EN_STEPS[s.id] || {}) }))
      : processSteps;

  return (
    <div className="pt-16">
      <div className="px-4 pb-10 pt-16 sm:px-5 md:px-16">
        <p className="label-mono">{t.nav.process}</p>
        <EditableText id="page.process.title" as="h1" className="display-section mt-4">
          {t.pages.processTitle}
        </EditableText>
      </div>
      <ProcessScenes steps={steps} ctaTitle={t.cta.title} ctaBook={t.cta.book} />
    </div>
  );
}
