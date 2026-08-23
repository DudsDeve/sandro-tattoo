"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CursorLink } from "@/components/ui/CursorLink";
import { STUDIO } from "@/lib/data/studio";
import { useT } from "@/lib/i18n/LanguageProvider";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export function Footer() {
  const t = useT();
  const ref = useRef<HTMLElement>(null);
  const navLinks = [
    { href: "/", label: t.nav.home },
    { href: "/artistas", label: t.nav.artists },
    { href: "/galeria", label: t.nav.gallery },
    { href: "/virtual-tryout", label: t.nav.tryOn },
    { href: "/processo", label: t.nav.process },
    { href: "/blog", label: t.nav.blog },
  ];
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
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-5 sm:py-16 md:grid-cols-2 md:px-8 md:py-20 lg:grid-cols-3">
          <div data-foot>
            <p className="font-display text-3xl">{STUDIO.name}</p>
            <p className="mt-3 max-w-xs text-sm text-ink-secondary">
              {t.studio.tagline}. {STUDIO.address.city}.
            </p>
            <nav className="mt-6 flex flex-col gap-2 text-sm">
              {navLinks.map((l) => (
                <CursorLink key={l.href} href={l.href} className="text-ink-secondary hover:text-ink">
                  {l.label}
                </CursorLink>
              ))}
            </nav>
          </div>
          <div data-foot>
            <p className="label-mono mb-4">{t.footer.contact}</p>
            <p className="text-sm">{t.studio.fullAddress}</p>
            <p className="mt-2 text-sm text-ink-secondary">{STUDIO.phone}</p>
            <p className="text-sm text-ink-secondary">{STUDIO.email}</p>
          </div>
          <div data-foot>
            <p className="label-mono mb-4">{t.footer.newsletter}</p>
            <form className="flex border-b border-line pb-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                required
                placeholder={t.footer.emailPlaceholder}
                className="w-full border-0 bg-transparent px-0 focus:outline-none"
              />
              <button type="submit" className="label-mono text-moss">
                {t.footer.send}
              </button>
            </form>
            <p className="mt-6 label-mono">Instagram</p>
            <a
              href={`https://instagram.com/${STUDIO.instagram}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-sm text-moss"
            >
              @{STUDIO.instagram}
            </a>
          </div>
        </div>
      </div>

      <div className="relative z-10 bg-black px-4 py-8 pb-[max(3.5rem,env(safe-area-inset-bottom))] sm:px-5 md:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-xs text-ink-muted">
            © {new Date().getFullYear()} {STUDIO.name}. {t.footer.copyright}
          </p>
          <p className="mt-4 text-sm text-ink-secondary">
            Created by: Eduardo Palhares — Website and app developer
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
            <a
              href="https://wa.me/5531994375739"
              target="_blank"
              rel="noreferrer"
              className="text-moss hover:text-ink"
            >
              +55 31 994375739
            </a>
            <a href="mailto:duds.deve@gmail.com" className="text-moss hover:text-ink">
              duds.deve@gmail.com
            </a>
            <a
              href="https://www.linkedin.com/in/eduardo-palhares-74054325b/"
              target="_blank"
              rel="noreferrer"
              className="text-moss hover:text-ink"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
