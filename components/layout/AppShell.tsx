"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AssistantWidget } from "@/components/ai/AssistantWidget";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { NoiseOverlay } from "@/components/ui/NoiseOverlay";
import { Preloader } from "@/components/ui/Preloader";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

export function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const isStudio = path.startsWith("/studio");

  if (isStudio) {
    return <div className="min-h-screen bg-white text-black">{children}</div>;
  }

  return (
    <>
      <Preloader />
      <NoiseOverlay />
      <ScrollProgress />
      <Navbar />
      <main>{children}</main>
      <Footer />
      <AssistantWidget />
      <WhatsAppButton />
    </>
  );
}
