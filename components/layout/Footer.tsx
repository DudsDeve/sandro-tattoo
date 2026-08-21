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
    { href: "/artistas", label: t.nav.artists },
    { href: "/galeria", label: t.nav.gallery },
    { href: "/processo", label: t.nav.process },
    { href: "/loja", label: t.nav.shop },
    { href: "/blog", label: t.nav.blog },
  ];
  const hours = [
    { days: t.studio.hoursWeek, time: "11:00 — 20:00" },
    { days: t.studio.hoursSat, time: "10:00 — 18:00" },
    { days: t.studio.hoursSun, time: t.studio.closed },
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
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-5 md:grid-cols-4 md:px-8 md:py-20">
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
            <p className="label-mono mb-4">{t.footer.hours}</p>
            {hours.map((h) => (
              <p key={h.days} className="flex justify-between gap-4 text-sm text-ink-secondary">
                <span>{h.days}</span>
                <span className="text-ink">{h.time}</span>
              </p>
            ))}
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

      <div className="relative bg-black px-4 py-8 pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:px-5 md:px-8">
        <p className="mx-auto max-w-7xl text-xs text-ink-muted">
          © {new Date().getFullYear()} {STUDIO.name}. {t.footer.copyright}
        </p>
      </div>
    </footer>
  );
}
