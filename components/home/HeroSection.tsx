"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { CtaLink } from "@/components/ui/CursorLink";
import { STUDIO } from "@/lib/data/studio";

export function HeroSection() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const words = el.querySelectorAll("[data-word]");
    gsap.fromTo(
      words,
      { yPercent: 110, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 1.25, ease: "power4.out", stagger: 0.12, delay: 2.2 },
    );
    gsap.fromTo(
      "[data-hero-sub]",
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 1, delay: 3, ease: "power2.out" },
    );
  }, []);

  return (
    <section ref={root} className="relative h-[100svh] min-h-[560px] overflow-hidden">
      <div className="absolute inset-0 scale-110 will-change-transform" data-hero-media>
        <video
          className="h-full w-full object-cover opacity-50"
          autoPlay
          muted
          loop
          playsInline
          poster="https://images.unsplash.com/photo-1611501275019-9b5c707e0d0d?auto=format&fit=crop&w=2000&q=80"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1562962230-16e4623d36e6?auto=format&fit=crop&w=2000&q=80)",
            animation: "kenburns 18s ease-in-out infinite alternate",
          }}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      <div className="relative z-10 flex h-full flex-col justify-end px-4 pb-28 pt-28 sm:px-5 sm:pb-24 sm:pt-32 md:px-12">
        <p className="label-mono mb-6">{STUDIO.address.city} · EST. 2012</p>
        <h1 className="display-hero max-w-[12ch]">
          {"ARTE GRAVADA NA PELE".split(" ").map((word) => (
            <span key={word} className="mr-[0.18em] inline-block overflow-hidden">
              <span data-word className="inline-block">
                {word}
              </span>
            </span>
          ))}
        </h1>
        <p data-hero-sub className="mt-6 max-w-xl text-ink-secondary opacity-0">
          Um estúdio autoral. Cinco artistas. Peças que envelhecem com você — do primeiro traço à cicatriz bonita.
        </p>
        <div data-hero-sub className="mt-8 flex w-full max-w-xl flex-col gap-3 opacity-0 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-4">
          <CtaLink href="/quiz" className="w-full sm:w-auto">Descubra seu estilo</CtaLink>
          <CtaLink href="/agendar" variant="outline" className="w-full sm:w-auto">
            Agendar sessão
          </CtaLink>
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
        <span className="label-mono block animate-bounce text-[10px]">scroll</span>
        <span className="mx-auto mt-2 block h-8 w-px bg-ink/50" />
      </div>
    </section>
  );
}
