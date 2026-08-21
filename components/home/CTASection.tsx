"use client";

import { CtaLink } from "@/components/ui/CursorLink";
import { ParallaxImage } from "@/components/ui/ParallaxImage";
import { useT } from "@/lib/i18n/LanguageProvider";

export function CTASection() {
  const t = useT();
  return (
    <section className="relative h-[90svh] min-h-[480px] sm:min-h-[560px]">
      <ParallaxImage
        src="https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&w=2000&q=80"
        alt="Studio interior"
        className="absolute inset-0 h-full"
        speed={0.35}
      />
      <div className="absolute inset-0 bg-black/65" />
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-5 text-center">
        <h2 className="display-section max-w-4xl">{t.cta.title}</h2>
        <p className="mt-6 max-w-lg text-ink-secondary">{t.cta.body}</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-4">
          <CtaLink href="/agendar" className="w-full sm:w-auto">
            {t.cta.book}
          </CtaLink>
          <CtaLink href="/quiz" variant="outline" className="w-full sm:w-auto">
            {t.cta.talk}
          </CtaLink>
        </div>
      </div>
    </section>
  );
}
