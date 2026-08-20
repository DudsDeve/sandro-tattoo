"use client";

import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { ParallaxImage } from "@/components/ui/ParallaxImage";
import { TextReveal } from "@/components/ui/TextReveal";
import { STUDIO } from "@/lib/data/studio";

export function AboutSection() {
  return (
    <section className="relative bg-[#0D0F0A] px-5 py-28 md:px-12 md:py-36">
      <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
        <div>
          <p className="label-mono mb-6">Sobre o estúdio</p>
          <h2 className="display-section mb-8">
            Um ateliê, não uma linha de montagem.
          </h2>
          <TextReveal className="max-w-lg text-ink-secondary">
            O Sandro Tattoo nasceu da recusa ao catálogo. Cada peça é desenhada para um corpo específico, com tempo de consulta, stencil e cicatrização tratados como parte da arte — não como pós-venda.
          </TextReveal>
          <p className="mt-10 font-display text-6xl text-moss md:text-8xl">
            <AnimatedCounter to={STUDIO.years} suffix="+" />
          </p>
          <p className="label-mono mt-2">anos de pele e ofício</p>
        </div>
        <ParallaxImage
          src="https://images.unsplash.com/photo-1598371839696-5c6d067a07cd?auto=format&fit=crop&w=1600&q=80"
          alt="Interior do estúdio Sandro Tattoo"
          className="aspect-[4/5] w-full"
          speed={0.25}
        />
      </div>
    </section>
  );
}
