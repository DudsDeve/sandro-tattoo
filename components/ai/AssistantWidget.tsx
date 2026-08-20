"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, X } from "lucide-react";
import { useState } from "react";
import { AssistantChat } from "@/components/ai/AssistantChat";
import { ConceptChat } from "@/components/ai/ConceptChat";
import { cn } from "@/lib/utils";

export function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"faq" | "conceito">("faq");

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir assistente"
        className="fixed bottom-24 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-line-accent bg-bg-tertiary text-ink"
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
            className="fixed bottom-0 right-0 z-[60] flex h-[100svh] w-full flex-col border-l border-line bg-black/95 p-5 backdrop-blur-xl md:h-[min(88vh,760px)] md:w-[440px] md:bottom-5 md:right-5 md:border"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex gap-2">
                {(["faq", "conceito"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={cn(
                      "label-mono px-3 py-1",
                      tab === t ? "bg-bg-accent text-ink" : "text-ink-secondary",
                    )}
                  >
                    {t === "faq" ? "Dúvidas" : "Conceito"}
                  </button>
                ))}
              </div>
              <button onClick={() => setOpen(false)} aria-label="Fechar">
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
