"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AssistantWidget } from "@/components/ai/AssistantWidget";
import { GlobeZoom } from "@/components/home/GlobeZoom";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { NoiseOverlay } from "@/components/ui/NoiseOverlay";
import { Preloader } from "@/components/ui/Preloader";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

function LocateSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setReady(true);
      },
      { rootMargin: "280px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {ready ? <GlobeZoom /> : <div className="h-[100svh] min-h-[520px] bg-black" aria-hidden />}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const isStudio = path.startsWith("/studio");
  const isAdmin = path.startsWith("/admin");
  const [visualEdit, setVisualEdit] = useState(false);

  useEffect(() => {
    setVisualEdit(new URLSearchParams(window.location.search).get("visualEdit") === "1");
  }, []);

  if (isStudio || isAdmin) {
    return <div className="min-h-screen bg-black text-ink">{children}</div>;
  }

  return (
    <>
      {!visualEdit && <Preloader />}
      <NoiseOverlay />
      {!visualEdit && <ScrollProgress />}
      <Navbar />
      <main>{children}</main>
      {!visualEdit && <LocateSection />}
      <Footer />
      {!visualEdit && <AssistantWidget />}
      {!visualEdit && <WhatsAppButton />}
    </>
  );
}
