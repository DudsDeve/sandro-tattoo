"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CtaLink } from "@/components/ui/CursorLink";
import { processSteps as defaultSteps } from "@/lib/data/content";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import type { ProcessStep } from "@/lib/types";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const SCENE_VIDEO: Record<string, string> = {
  consulta: "/videos/consultation.mp4",
  design: "/videos/design.mp4",
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

  useGSAP(
    () => {
      if (reduced) return;
      const scenes = gsap.utils.toArray<HTMLElement>("[data-scene]");
      const canPin = window.matchMedia("(min-width: 768px)").matches;
      scenes.forEach((scene) => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: scene,
            start: canPin ? "top top" : "top 75%",
            end: canPin ? "+=90%" : "bottom 55%",
            pin: canPin,
            scrub: canPin ? 1 : false,
          },
        });
        tl.fromTo(scene.querySelector("[data-num]"), { opacity: 0, y: 40 }, { opacity: 1, y: 0 })
          .fromTo(scene.querySelector("[data-title]"), { yPercent: 80, opacity: 0 }, { yPercent: 0, opacity: 1 }, 0.1)
          .fromTo(scene.querySelector("[data-body]"), { opacity: 0 }, { opacity: 1 }, 0.25)
          .fromTo(scene.querySelector("[data-line]"), { scaleX: 0 }, { scaleX: 1, transformOrigin: "left" }, 0.2);
      });
    },
    { scope: root, dependencies: [reduced, steps] },
  );

  return (
    <div ref={root}>
      {steps.map((step, i) => {
        const videoSrc = SCENE_VIDEO[step.id];
        return (
        <section
          key={step.id}
          data-scene
          className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden px-4 py-24 sm:px-5 md:px-16"
          style={{ background: videoSrc ? "#000" : i % 2 === 0 ? "#000" : "#0D0F0A" }}
        >
          {videoSrc && (
            <>
              <video
                className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                src={videoSrc}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                aria-hidden
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/25" />
            </>
          )}
          <div className="relative z-10">
          <p data-num className="label-mono">
            {step.number} / 06
          </p>
          <h2 data-title className="display-hero mt-6">
            {step.title}
          </h2>
          <span data-line className="mt-8 block h-px w-40 origin-left bg-bg-accent-light" />
          <p data-body className="mt-8 max-w-xl text-lg text-ink-secondary">
            {step.body}
          </p>
          <p data-body className="mt-4 max-w-xl text-sm text-ink-muted">
            {step.detail}
          </p>
          </div>
        </section>
        );
      })}
      <section className="flex min-h-[60svh] flex-col items-center justify-center bg-black px-5 text-center">
        <h2 className="display-section">{ctaTitle}</h2>
        <div className="mt-10">
          <CtaLink href="/agendar">{ctaBook}</CtaLink>
        </div>
      </section>
    </div>
  );
}
