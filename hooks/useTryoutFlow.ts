"use client";

import { useState } from "react";
import type { TryoutStep } from "@/lib/tryout/types";

const ORDER: TryoutStep[] = ["upload", "mark", "design", "preview"];

export function useTryoutFlow(initial: TryoutStep = "upload") {
  const [step, setStep] = useState<TryoutStep>(initial);
  const index = ORDER.indexOf(step);
  return {
    step,
    index,
    setStep,
    next: () => setStep(ORDER[Math.min(index + 1, ORDER.length - 1)]),
    back: () => setStep(ORDER[Math.max(index - 1, 0)]),
    go: setStep,
  };
}
