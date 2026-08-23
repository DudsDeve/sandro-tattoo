"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { AssistantChat } from "@/components/ai/AssistantChat";
import { ConceptChat } from "@/components/ai/ConceptChat";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

function BotIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="5" y="8" width="14" height="10" rx="2" />
      <path d="M12 4v4M9 13h.01M15 13h.01" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function AssistantWidget() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"faq" | "conceito">("faq");

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={t.ai.open}
        className="fixed bottom-[max(4.75rem,calc(env(safe-area-inset-bottom)+3.5rem))] right-[max(1.25rem,env(safe-area-inset-right))] z-50 flex h-12 w-12 items-center justify-center rounded-full border border-line-accent bg-bg-tertiary text-ink sm:bottom-24 sm:right-5 sm:h-14 sm:w-14"
      >
        <span className="absolute inset-0 animate-[pulse-ring_2.4s_ease-out_infinite] rounded-full border border-moss/40" />
        <BotIcon />
      </button>

      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            className="fixed inset-0 z-[60] flex h-[100svh] w-full flex-col border-line bg-black/95 p-4 pt-[max(1.25rem,env(safe-area-inset-top))] backdrop-blur-xl sm:p-5 md:inset-auto md:bottom-5 md:right-5 md:h-[min(88vh,760px)] md:w-[min(440px,calc(100vw-2.5rem))] md:border"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex gap-2">
                {(["faq", "conceito"] as const).map((key) => (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={cn(
                      "label-mono px-3 py-1",
                      tab === key ? "bg-bg-accent text-ink" : "text-ink-secondary",
                    )}
                  >
                    {key === "faq" ? t.ai.faq : t.ai.concept}
                  </button>
                ))}
              </div>
              <button onClick={() => setOpen(false)} aria-label={t.ai.close}>
                <CloseIcon />
              </button>
            </div>
            <div className="min-h-0 flex-1">
              {tab === "faq" ? <AssistantChat /> : <ConceptChat compact />}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
