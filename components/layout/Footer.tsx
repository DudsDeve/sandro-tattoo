"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GlobeZoom } from "@/components/home/GlobeZoom";
import { CursorLink } from "@/components/ui/CursorLink";
import { gallery } from "@/lib/data/content";
import { NAV_LINKS, STUDIO } from "@/lib/data/studio";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

function FooterGlobe() {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setReady(true);
      },
      { rootMargin: "280px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {ready ? <GlobeZoom /> : <div className="h-[100svh] min-h-[520px] bg-black" aria-hidden />}
    </div>
  );
}

export function Footer() {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.from("[data-foot]", {
        y: 40,
        opacity: 0,
        duration: 0.9,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 85%" },
      });
    },
    { scope: ref },
  );

  return (
    <footer ref={ref} className="relative border-t border-line bg-bg-secondary">
      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, var(--color-border-hover) 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-5 md:grid-cols-4 md:px-8 md:py-20">
          <div data-foot>
            <p className="font-display text-3xl">{STUDIO.name}</p>
            <p className="mt-3 max-w-xs text-sm text-ink-secondary">
              {STUDIO.tagline}. {STUDIO.address.city}.
            </p>
            <nav className="mt-6 flex flex-col gap-2 text-sm">
              {NAV_LINKS.map((l) => (
                <CursorLink key={l.href} href={l.href} className="text-ink-secondary hover:text-ink">
                  {l.label}
                </CursorLink>
              ))}
            </nav>
          </div>
          <div data-foot>
            <p className="label-mono mb-4">Contato</p>
            <p className="text-sm">{STUDIO.address.full}</p>
            <p className="mt-2 text-sm text-ink-secondary">{STUDIO.phone}</p>
            <p className="text-sm text-ink-secondary">{STUDIO.email}</p>
          </div>
          <div data-foot>
            <p className="label-mono mb-4">Horários</p>
            {STUDIO.hours.map((h) => (
              <p key={h.days} className="flex justify-between gap-4 text-sm text-ink-secondary">
                <span>{h.days}</span>
                <span className="text-ink">{h.time}</span>
              </p>
            ))}
          </div>
          <div data-foot>
            <p className="label-mono mb-4">Newsletter</p>
            <form
              className="flex border-b border-line pb-2"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                required
                placeholder="seu@email.com"
                className="w-full border-0 bg-transparent px-0 focus:outline-none"
              />
              <button type="submit" className="label-mono text-moss">
                Enviar
              </button>
            </form>
            <p className="mt-6 label-mono">Instagram</p>
            <div className="mt-3 grid grid-cols-3 gap-1">
              {gallery.slice(0, 6).map((g) => (
                <a
                  key={g.id}
                  href={`https://instagram.com/${STUDIO.instagram}`}
                  target="_blank"
                  rel="noreferrer"
                  className="relative aspect-square overflow-hidden"
                >
                  <Image src={g.image} alt="" fill className="object-cover" sizes="120px" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <FooterGlobe />

      <div className="relative bg-black px-4 py-8 pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:px-5 md:px-8">
        <p className="mx-auto max-w-7xl text-xs text-ink-muted">
          © {new Date().getFullYear()} {STUDIO.name}. Todas as peças são autorais.
        </p>
      </div>
    </footer>
  );
}
