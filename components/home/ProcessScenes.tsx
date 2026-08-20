"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CtaLink } from "@/components/ui/CursorLink";
import { processSteps } from "@/lib/data/content";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export function ProcessScenes() {
  const root = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const scenes = gsap.utils.toArray<HTMLElement>("[data-scene]");
      scenes.forEach((scene) => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: scene,
            start: "top top",
            end: "+=90%",
            pin: true,
            scrub: 1,
          },
        });
        tl.fromTo(scene.querySelector("[data-num]"), { opacity: 0, y: 40 }, { opacity: 1, y: 0 })
          .fromTo(scene.querySelector("[data-title]"), { yPercent: 80, opacity: 0 }, { yPercent: 0, opacity: 1 }, 0.1)
          .fromTo(scene.querySelector("[data-body]"), { opacity: 0 }, { opacity: 1 }, 0.25)
          .fromTo(scene.querySelector("[data-line]"), { scaleX: 0 }, { scaleX: 1, transformOrigin: "left" }, 0.2);
      });
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <div ref={root}>
      {processSteps.map((step, i) => (
        <section
          key={step.id}
          data-scene
          className="relative flex min-h-[100svh] flex-col justify-center px-5 md:px-16"
          style={{ background: i % 2 === 0 ? "#000" : "#0D0F0A" }}
        >
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
        </section>
      ))}
      <section className="flex min-h-[60svh] flex-col items-center justify-center bg-black px-5 text-center">
        <h2 className="display-section">O primeiro passo é a consulta.</h2>
        <div className="mt-10">
          <CtaLink href="/agendar">Agendar consulta</CtaLink>
        </div>
      </section>
    </div>
  );
}
