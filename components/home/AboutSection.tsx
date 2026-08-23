"use client";

import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { ParallaxImage } from "@/components/ui/ParallaxImage";
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
          <p className="mt-10 font-display text-4xl text-moss sm:text-6xl md:text-8xl">
            <AnimatedCounter to={STUDIO.years} suffix="+" />
          </p>
          <EditableText id="home.about.yearsLabel" as="p" className="label-mono mt-2">
            {t.about.years}
          </EditableText>
        </div>
        <EditableMedia
          id="home.about.image"
          type="image"
          className="group relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] shadow-[0_24px_80px_rgba(0,0,0,0.55)] ring-1 ring-[#8b9a6b]/35 transition duration-700 hover:ring-[#8b9a6b]/70 hover:shadow-[0_0_60px_rgba(139,154,107,0.18)]"
        >
          {(src) => (
            <>
              <ParallaxImage
                src={src}
                alt="VERSUS studio interior"
                className="absolute inset-0 h-full w-full"
                speed={0.18}
              />
              <div
                className="pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-to-t from-black/45 via-transparent to-[#8b9a6b]/10 mix-blend-soft-light"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-0 rounded-[2rem] opacity-[0.12] mix-blend-overlay"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.55'/></svg>\")",
                }}
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-4 rounded-[1.35rem] border border-white/10 transition duration-700 group-hover:border-[#8b9a6b]/40"
                aria-hidden
              />
            </>
          )}
        </EditableMedia>
      </div>
    </section>
  );
}
