"use client";

import { useT } from "@/lib/i18n/LanguageProvider";

export function ChatMessage({ role, text }: { role: "user" | "assistant"; text: string }) {
  const t = useT();
  return (
    <div className={role === "user" ? "ml-8 text-right" : "mr-8"}>
      <p className="label-mono mb-1">{role === "user" ? t.ai.you : t.ai.studio}</p>
      <div
        className={
          role === "user"
            ? "inline-block bg-bg-accent/40 px-4 py-3 text-left text-sm"
            : "border border-line bg-bg-tertiary px-4 py-3 text-sm text-ink-secondary"
        }
      >
        {text}
      </div>
    </div>
  );
}
