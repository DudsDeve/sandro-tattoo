"use client";

import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { ParallaxImage } from "@/components/ui/ParallaxImage";
import { TextReveal } from "@/components/ui/TextReveal";
import { STUDIO } from "@/lib/data/studio";
import { useT } from "@/lib/i18n/LanguageProvider";

export function AboutSection() {
  const t = useT();
  return (
    <section className="relative bg-[#0D0F0A] px-4 py-20 sm:px-5 md:px-12 md:py-36">
      <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
        <div>
          <p className="label-mono mb-6">{t.about.label}</p>
          <h2 className="display-section mb-8">{t.about.title}</h2>
          <TextReveal className="max-w-lg text-ink-secondary">{t.about.body}</TextReveal>
          <p className="mt-10 font-display text-5xl text-moss sm:text-6xl md:text-8xl">
            <AnimatedCounter to={STUDIO.years} suffix="+" />
          </p>
          <p className="label-mono mt-2">{t.about.years}</p>
        </div>
        <ParallaxImage
          src="https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=1600&q=80"
          alt="Sandro Tattoo studio interior"
          className="aspect-[4/5] w-full"
          speed={0.25}
        />
      </div>
    </section>
  );
}
