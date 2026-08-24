"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MediaImage } from "@/components/ui/MediaImage";
import { buildWaitingPlaylist, type WaitingSlide } from "@/lib/waiting/playlist";
import type { CmsStore } from "@/lib/cms/types";

const IMAGE_MS = 9000;

export function WaitingModePlayer({ store }: { store: CmsStore }) {
  const router = useRouter();
  const slides = useMemo(() => buildWaitingPlaylist(store), [store]);
  const [index, setIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [hint, setHint] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const next = useCallback(() => {
    setIndex((i) => (slides.length ? (i + 1) % slides.length : 0));
  }, [slides.length]);

  const prev = useCallback(() => {
    setIndex((i) => (slides.length ? (i - 1 + slides.length) % slides.length : 0));
  }, [slides.length]);

  const slide: WaitingSlide | undefined = slides[index];

  useEffect(() => {
    const t = window.setTimeout(() => setHint(false), 5000);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") router.push("/admin/espera");
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        next();
      }
      if (e.key === "ArrowLeft") prev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, router]);

  useEffect(() => {
    if (!started || !slide || slide.kind !== "image") return;
    const t = window.setTimeout(next, IMAGE_MS);
    return () => window.clearTimeout(t);
  }, [index, next, slide, started]);

  useEffect(() => {
    if (!started || !slide || slide.kind !== "youtube") return;
    const iframe = iframeRef.current;
    const fallback = window.setTimeout(next, 52_000);

    function onMessage(ev: MessageEvent) {
      try {
        const data = typeof ev.data === "string" ? JSON.parse(ev.data) : ev.data;
        if (data?.event === "onStateChange" && data?.info === 0) next();
        if (data?.info === 0 && data?.event === "infoDelivery") next();
      } catch {
        /* ignore */
      }
    }
    window.addEventListener("message", onMessage);
    const ping = window.setInterval(() => {
      iframe?.contentWindow?.postMessage(JSON.stringify({ event: "listening" }), "*");
    }, 2500);

    return () => {
      window.clearTimeout(fallback);
      window.clearInterval(ping);
      window.removeEventListener("message", onMessage);
    };
  }, [index, next, slide, started]);

  async function start() {
    setStarted(true);
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      /* TV browsers may already be fullscreen */
    }
  }

  if (!slides.length) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black text-[#a09b95]">
        <p>Cadastre fotos, vídeos ou links do YouTube no admin para o modo de espera.</p>
      </div>
    );
  }

  if (!started) {
    return (
      <button
        type="button"
        onClick={() => void start()}
        className="flex h-screen w-screen flex-col items-center justify-center bg-black text-white"
      >
        <p className="font-mono text-xs tracking-[0.4em] text-[#8b9a6b]">VERSUS</p>
        <p className="mt-6 font-serif text-5xl">Modo de espera</p>
        <p className="mt-4 text-sm text-[#a09b95]">Toque para iniciar na televisão</p>
      </button>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${slide?.kind}-${index}`}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          {slide?.kind === "image" ? (
            <div className="absolute inset-0 overflow-hidden">
              <MediaImage
                src={slide.src}
                alt=""
                fill
                className="object-cover [animation:kenburns_11s_ease-in-out_forwards]"
                sizes="100vw"
                priority
              />
            </div>
          ) : null}
          {slide?.kind === "video" ? (
            <video
              key={slide.src}
              src={slide.src}
              className="h-full w-full object-cover"
              autoPlay
              playsInline
              onEnded={next}
              onError={next}
              onCanPlay={(e) => {
                const el = e.currentTarget;
                void el.play().catch(() => {
                  el.muted = true;
                  void el.play();
                });
              }}
            />
          ) : null}
          {slide?.kind === "youtube" ? (
            <iframe
              ref={iframeRef}
              title={slide.title || "YouTube"}
              src={`https://www.youtube.com/embed/${slide.videoId}?autoplay=1&rel=0&modestbranding=1&controls=0&disablekb=1&fs=0&iv_load_policy=3&playsinline=1&enablejsapi=1`}
              className="h-full w-full border-0"
              allow="autoplay; fullscreen"
            />
          ) : null}
        </motion.div>
      </AnimatePresence>
      {hint ? (
        <p className="pointer-events-none absolute bottom-6 left-6 font-mono text-[10px] tracking-[0.2em] text-white/40">
          ESC sai · ← → troca
        </p>
      ) : null}
    </div>
  );
}
