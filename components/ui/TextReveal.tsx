"use client";

import { useEffect, useRef } from "react";
import SplitType from "split-type";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function TextReveal({
  children,
  className,
  as: Tag = "p",
}: {
  children: string;
  className?: string;
  as?: "p" | "h2" | "h3" | "div";
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const split = new SplitType(el, { types: "lines" });
    const lines = split.lines ?? [];
    gsap.set(lines, { overflow: "hidden" });
    const inner = lines.map((line) => {
      const wrap = document.createElement("span");
      wrap.style.display = "block";
      wrap.innerHTML = line.innerHTML;
      line.innerHTML = "";
      line.appendChild(wrap);
      return wrap;
    });

    const tween = gsap.from(inner, {
      yPercent: 110,
      duration: 1.1,
      ease: "power4.out",
      stagger: 0.08,
      scrollTrigger: {
        trigger: el,
        start: "top 82%",
      },
    });

    return () => {
      tween.kill();
      split.revert();
    };
  }, []);

  return (
    <Tag ref={ref as never} className={cn(className)}>
      {children}
    </Tag>
  );
}
