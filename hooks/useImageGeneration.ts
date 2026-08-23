"use client";

import { useCallback, useState } from "react";
import type { GenerateInput } from "@/lib/tryout/types";
import { useT } from "@/lib/i18n/LanguageProvider";

export function useImageGeneration() {
  const t = useT();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const generate = useCallback(async (input: GenerateInput) => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/tryout/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = (await res.json()) as { imageUrl?: string; error?: string; model?: string };
      if (!res.ok || !data.imageUrl) throw new Error(data.error || t.tryout.genFail);
      return { imageUrl: data.imageUrl, model: data.model };
    } catch (e) {
      const message = e instanceof Error ? e.message : t.tryout.genError;
      setError(message);
      throw e;
    } finally {
      setBusy(false);
    }
  }, [t]);

  return { busy, error, generate, setError };
}
