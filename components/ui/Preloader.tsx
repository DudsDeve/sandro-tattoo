"use client";

import { useEffect, useState } from "react";
import { LogoMark } from "@/components/ui/LogoMark";

export function Preloader() {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(false);
      return;
    }
    const start = performance.now();
    const duration = 2200;
    let frame: number;
    const tick = (now: number) => {
      const p = Math.min(100, ((now - start) / duration) * 100);
      setProgress(p);
      if (p < 100) {
        frame = requestAnimationFrame(tick);
      } else {
        setExiting(true);
        setTimeout(() => setVisible(false), 500);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black"
      style={{
        clipPath: exiting ? "inset(0 0 100% 0)" : "inset(0 0 0 0)",
        transition: "clip-path 0.55s cubic-bezier(0.76, 0, 0.24, 1)",
      }}
    >
      <LogoMark className="h-24 w-24 text-ink" animate />
      <p className="font-script mt-6 text-3xl text-moss">Sandro Tattoo</p>
      <div className="mt-10 h-[1px] w-40 overflow-hidden bg-line">
        <div className="h-full bg-bg-accent-light" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
