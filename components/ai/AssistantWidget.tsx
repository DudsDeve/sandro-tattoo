"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, X } from "lucide-react";
import { useState } from "react";
import { AssistantChat } from "@/components/ai/AssistantChat";
import { ConceptChat } from "@/components/ai/ConceptChat";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

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
        <MessageSquare size={20} />
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
                <X size={18} />
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
