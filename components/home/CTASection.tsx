"use client";

import { CtaLink } from "@/components/ui/CursorLink";
import { ParallaxImage } from "@/components/ui/ParallaxImage";
import { EditableMedia, EditableText } from "@/components/site-editor/Editable";
import { useT } from "@/lib/i18n/LanguageProvider";

export function CTASection() {
  const t = useT();
  return (
    <section className="relative h-[90svh] min-h-[480px] sm:min-h-[560px]">
      <EditableMedia id="home.cta.image" type="image" className="absolute inset-0 h-full">
        {(src) => <ParallaxImage src={src} alt="Studio interior" className="absolute inset-0 h-full" speed={0.35} />}
      </EditableMedia>
      <div className="absolute inset-0 bg-black/65" />
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-5 text-center">
        <EditableText id="home.cta.title" as="h2" className="display-section max-w-4xl">
          {t.cta.title}
        </EditableText>
        <EditableText id="home.cta.body" as="p" className="mt-6 max-w-lg text-ink-secondary">
          {t.cta.body}
        </EditableText>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-4">
          <CtaLink href="/agendar" className="w-full sm:w-auto">
            <EditableText id="home.cta.book" as="span">
              {t.cta.book}
            </EditableText>
          </CtaLink>
          <CtaLink href="/quiz" variant="outline" className="w-full sm:w-auto">
            <EditableText id="home.cta.talk" as="span">
              {t.cta.talk}
            </EditableText>
          </CtaLink>
        </div>
      </div>
    </section>
  );
}
