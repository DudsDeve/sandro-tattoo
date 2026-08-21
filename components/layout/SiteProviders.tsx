"use client";

import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";
import { PostHogProvider } from "@/components/layout/PostHogProvider";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";

export function SiteProviders({ children }: { children: ReactNode }) {
  return (
    <PostHogProvider>
      <LanguageProvider>
        <ReactLenis root options={{ lerp: 0.08, duration: 1.15, smoothWheel: true }}>
          {children}
        </ReactLenis>
      </LanguageProvider>
    </PostHogProvider>
  );
}
