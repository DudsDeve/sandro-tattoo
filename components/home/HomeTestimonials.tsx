"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { EditableText } from "@/components/site-editor/Editable";

/** Depoimentos — vazio até você cadastrar (sem mocks). */
export function HomeTestimonials() {
  const { t } = useLanguage();

  return (
    <section className="bg-bg-primary py-24">
      <EditableText id="home.testimonials.label" as="p" className="label-mono mb-3 px-4 md:px-12">
        {t.testimonials.label}
      </EditableText>
      <EditableText id="home.testimonials.title" as="h2" className="display-section mb-12 px-4 md:px-12">
        {t.testimonials.title}
      </EditableText>
      <p className="px-4 text-sm text-ink-muted md:px-12">
        Em breve — depoimentos reais dos clientes do estúdio.
      </p>
    </section>
  );
}
