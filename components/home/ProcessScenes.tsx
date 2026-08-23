"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "lenis/react";
import { CtaLink } from "@/components/ui/CursorLink";
import { processSteps as defaultSteps } from "@/lib/data/content";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import type { ProcessStep } from "@/lib/types";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const SCENE_VIDEO: Record<string, string> = {
  consulta: "/videos/consultation.mp4",
  design: "/videos/design.mp4",
  preparacao: "/videos/prep.mp4",
  sessao: "/videos/session.mp4",
  cuidados: "/videos/aftercare.mp4",
};

export function ProcessScenes({
  steps = defaultSteps,
  ctaTitle = "Ready to mark your story?",
  ctaBook = "Book a session",
}: {
  steps?: ProcessStep[];
  ctaTitle?: string;
  ctaBook?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useLenis(() => {
    ScrollTrigger.update();
  });

  useGSAP(
    () => {
      ScrollTrigger.config({ ignoreMobileResize: true });
      if (reduced) return;

      const tracks = gsap.utils.toArray<HTMLElement>("[data-scene-track]");
      tracks.forEach((track) => {
        const scene = track.querySelector<HTMLElement>("[data-scene]");
        if (!scene) return;
        const num = scene.querySelector("[data-num]");
        const title = scene.querySelector("[data-title]");
        const line = scene.querySelector("[data-line]");
        const body = scene.querySelector("[data-body-main]");
        const detail = scene.querySelector("[data-body-detail]");

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: track,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.65,
            invalidateOnRefresh: true,
          },
        });

        tl.fromTo(num, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 1, immediateRender: true })
          .fromTo(title, { opacity: 0, y: 72 }, { opacity: 1, y: 0, duration: 1.4, immediateRender: true })
          .fromTo(line, { scaleX: 0, transformOrigin: "left" }, { scaleX: 1, duration: 0.7, immediateRender: true })
          .fromTo(body, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 1.15, immediateRender: true })
          .fromTo(detail, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 1.15, immediateRender: true })
          .to({}, { duration: 0.9 });
      });

      requestAnimationFrame(() => ScrollTrigger.refresh());
    },
    { scope: root, dependencies: [reduced, steps] },
  );

  return (
    <div ref={root}>
      {steps.map((step, i) => {
        const videoSrc = SCENE_VIDEO[step.id];
        return (
          <div key={step.id} data-scene-track className="relative h-[420svh]">
            <section
              data-scene
              className="sticky top-0 flex h-[100svh] min-h-[520px] flex-col justify-center px-4 py-24 sm:px-5 md:px-16"
              style={{ background: videoSrc ? "#000" : i % 2 === 0 ? "#000" : "#0D0F0A" }}
            >
              {videoSrc && (
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  <video
                    className="absolute inset-0 h-full w-full object-cover"
                    src={videoSrc}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    aria-hidden
                  />
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/20" />
                </div>
              )}
              <div className="relative z-10">
                <p data-num className={`label-mono ${reduced ? "" : "opacity-0"}`}>
                  {step.number} / 06
                </p>
                <h2
                  data-title
                  className={`display-hero mt-6 text-ink drop-shadow-[0_4px_28px_rgba(0,0,0,0.9)] ${reduced ? "" : "opacity-0"}`}
                >
                  {step.title}
                </h2>
                <span
                  data-line
                  className={`mt-8 block h-px w-40 origin-left bg-bg-accent-light ${reduced ? "" : "scale-x-0"}`}
                />
                <p data-body-main className={`mt-8 max-w-xl text-lg text-ink ${reduced ? "" : "opacity-0"}`}>
                  {step.body}
                </p>
                <p data-body-detail className={`mt-4 max-w-xl text-sm text-ink-secondary ${reduced ? "" : "opacity-0"}`}>
                  {step.detail}
                </p>
              </div>
            </section>
          </div>
        );
      })}
      <section className="relative z-10 flex min-h-[60svh] flex-col items-center justify-center bg-black px-5 text-center">
        <h2 className="display-section">{ctaTitle}</h2>
        <div className="mt-10">
          <CtaLink href="/agendar">{ctaBook}</CtaLink>
        </div>
      </section>
    </div>
  );
}
