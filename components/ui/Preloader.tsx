"use client";

import { useEffect, useState } from "react";
import { LogoMark } from "@/components/ui/LogoMark";

function shouldSkipPreloader() {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  if (params.get("visualEdit") === "1") return true;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  return false;
}

export function Preloader() {
  const [visible, setVisible] = useState(() => !shouldSkipPreloader());
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!visible) return;

    // Prefer timeout over rAF alone — rAF is throttled/paused inside iframes.
    const start = performance.now();
    const duration = 1800;
    let frame = 0;
    let timer = 0;

    const finish = () => {
      setProgress(100);
      setExiting(true);
      timer = window.setTimeout(() => setVisible(false), 450);
    };

    const tick = (now: number) => {
      const p = Math.min(100, ((now - start) / duration) * 100);
      setProgress(p);
      if (p >= 100) {
        finish();
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    // Hard fallback if rAF is frozen (e.g. iframe / background tab)
    const hard = window.setTimeout(finish, duration + 400);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      window.clearTimeout(hard);
    };
  }, [visible]);

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
