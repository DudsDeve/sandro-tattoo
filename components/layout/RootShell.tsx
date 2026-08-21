import { headers } from "next/headers";
import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";

/** Server-side: skip site chrome (nav/footer) for admin & studio. */
export async function RootShell({ children }: { children: ReactNode }) {
  const h = await headers();
  const bare = h.get("x-sandro-shell") === "bare";

  if (bare) {
    return <div className="min-h-screen bg-black text-ink">{children}</div>;
  }

  return <AppShell>{children}</AppShell>;
}
