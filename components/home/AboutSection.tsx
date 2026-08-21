"use client";

import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { ParallaxImage } from "@/components/ui/ParallaxImage";
import { TextReveal } from "@/components/ui/TextReveal";
import { EditableMedia, EditableText } from "@/components/site-editor/Editable";
import { STUDIO } from "@/lib/data/studio";
import { useT } from "@/lib/i18n/LanguageProvider";

export function AboutSection() {
  const t = useT();
  return (
    <section className="relative bg-[#0D0F0A] px-4 py-20 sm:px-5 md:px-12 md:py-36">
      <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
        <div>
          <EditableText id="home.about.label" as="p" className="label-mono mb-6">
            {t.about.label}
          </EditableText>
          <EditableText id="home.about.title" as="h2" className="display-section mb-8">
            {t.about.title}
          </EditableText>
          <EditableText id="home.about.body" as="div" className="max-w-lg text-ink-secondary">
            {t.about.body}
          </EditableText>
          <p className="mt-10 font-display text-5xl text-moss sm:text-6xl md:text-8xl">
            <AnimatedCounter to={STUDIO.years} suffix="+" />
          </p>
          <EditableText id="home.about.yearsLabel" as="p" className="label-mono mt-2">
            {t.about.years}
          </EditableText>
        </div>
        <EditableMedia id="home.about.image" type="image" className="aspect-[4/5] w-full">
          {(src) => (
            <ParallaxImage src={src} alt="Sandro Tattoo studio interior" className="h-full w-full" speed={0.25} />
          )}
        </EditableMedia>
      </div>
    </section>
  );
}
