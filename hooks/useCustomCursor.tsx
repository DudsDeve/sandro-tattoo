"use client";

import { type ReactNode } from "react";

/** Stub vazio — o cursor customizado foi removido. Mantido só para o HMR do Turbopack. */
export function CursorProvider({ children }: { children: ReactNode }) {
  return children;
}

export function useCursor() {
  return {
    kind: "default" as const,
    setKind: (_kind?: string) => undefined,
  };
}
