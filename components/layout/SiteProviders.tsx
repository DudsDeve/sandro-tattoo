"use client";

import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";
import { PostHogProvider } from "@/components/layout/PostHogProvider";
import { SiteContentProvider } from "@/components/site-editor/SiteContentProvider";
import { VisualEditGuard } from "@/components/site-editor/VisualEditGuard";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { UserProvider } from "@/components/auth/UserProvider";

export function SiteProviders({ children }: { children: ReactNode }) {
  return (
    <PostHogProvider>
      <LanguageProvider>
        <UserProvider>
        <SiteContentProvider>
          <ReactLenis root options={{ lerp: 0.08, duration: 1.15, smoothWheel: true }}>
            <VisualEditGuard />
            {children}
          </ReactLenis>
        </SiteContentProvider>
        </UserProvider>
      </LanguageProvider>
    </PostHogProvider>
  );
}
