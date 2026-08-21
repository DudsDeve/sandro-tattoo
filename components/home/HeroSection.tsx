"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { CtaLink } from "@/components/ui/CursorLink";
import { EditableMedia, EditableText } from "@/components/site-editor/Editable";
import { useSiteValue } from "@/components/site-editor/SiteContentProvider";
import { useT } from "@/lib/i18n/LanguageProvider";

export function HeroSection() {
  const t = useT();
  const root = useRef<HTMLElement>(null);
  const videoA = useRef<HTMLVideoElement>(null);
  const videoB = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  const title = useSiteValue("home.hero.title", t.hero.title);
  const video1 = useSiteValue("home.hero.video1", "/videos/hero-1.mp4");
  const video2 = useSiteValue("home.hero.video2", "/videos/hero-2.mp4");

  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const words = el.querySelectorAll("[data-word]");
    gsap.fromTo(
      words,
      { yPercent: 110, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 1.25, ease: "power4.out", stagger: 0.12, delay: 0.4 },
    );
    gsap.fromTo(
      "[data-hero-sub]",
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 1, delay: 1, ease: "power2.out" },
    );
  }, [title]);

  useEffect(() => {
    if (reduceMotion) return;
    const current = active === 0 ? videoA.current : videoB.current;
    const next = active === 0 ? videoB.current : videoA.current;
    if (!current) return;

    void current.play().catch(() => undefined);

    const onEnded = () => {
      const upcoming = (active + 1) % 2;
      if (next) {
        next.currentTime = 0;
        void next.play().catch(() => undefined);
      }
      setActive(upcoming);
    };

    current.addEventListener("ended", onEnded);
    return () => current.removeEventListener("ended", onEnded);
  }, [active, reduceMotion, video1, video2]);

  return (
    <section ref={root} className="relative h-[100svh] min-h-[560px] overflow-hidden">
      <div className="absolute inset-0 will-change-transform" data-hero-media>
        {!reduceMotion && (
          <>
            <EditableMedia id="home.hero.video1" type="video" className="absolute inset-0 h-full w-full">
              {(src) => (
                <video
                  ref={videoA}
                  className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000"
                  style={{ opacity: active === 0 ? 0.55 : 0 }}
                  src={src}
                  muted
                  playsInline
                  preload="auto"
                  aria-hidden
                />
              )}
            </EditableMedia>
            <EditableMedia id="home.hero.video2" type="video" className="absolute inset-0 h-full w-full">
              {(src) => (
                <video
                  ref={videoB}
                  className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000"
                  style={{ opacity: active === 1 ? 0.55 : 0 }}
                  src={src}
                  muted
                  playsInline
                  preload="auto"
                  aria-hidden
                />
              )}
            </EditableMedia>
          </>
        )}
        {reduceMotion && (
          <EditableMedia id="home.hero.video1" type="video" className="absolute inset-0 h-full w-full">
            {(src) => (
              <video
                className="absolute inset-0 h-full w-full object-cover opacity-55"
                src={src}
                muted
                playsInline
                preload="metadata"
                aria-hidden
              />
            )}
          </EditableMedia>
        )}
        <div className="absolute inset-0 bg-black/35" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/20" />
      <div className="relative z-10 flex h-full flex-col justify-end px-4 pb-28 pt-28 sm:px-5 sm:pb-24 sm:pt-32 md:px-12">
        <EditableText id="home.hero.eyebrow" as="p" className="label-mono mb-6">
          {t.hero.eyebrow}
        </EditableText>
        <EditableText
          id="home.hero.title"
          as="h1"
          className="display-hero max-w-[14ch]"
          render={(value) =>
            value.split(" ").map((word) => (
              <span key={word} className="mr-[0.18em] inline-block overflow-hidden">
                <span data-word className="inline-block">
                  {word}
                </span>
              </span>
            ))
          }
        >
          {t.hero.title}
        </EditableText>
        <EditableText
          id="home.hero.subtitle"
          as="p"
          className="mt-6 max-w-xl text-ink-secondary opacity-0"
          data-hero-sub=""
        >
          {t.hero.subtitle}
        </EditableText>
        <div data-hero-sub className="mt-8 flex w-full max-w-xl flex-col gap-3 opacity-0 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-4">
          <CtaLink href="/quiz" className="w-full sm:w-auto">
            <EditableText id="home.hero.ctaQuiz" as="span">
              {t.hero.ctaQuiz}
            </EditableText>
          </CtaLink>
          <CtaLink href="/agendar" variant="outline" className="w-full sm:w-auto">
            <EditableText id="home.hero.ctaBook" as="span">
              {t.hero.ctaBook}
            </EditableText>
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
