"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useState } from "react";
import { ChatInput } from "@/components/ai/ChatInput";
import { ChatMessage } from "@/components/ai/ChatMessage";
import { QuickSuggestions } from "@/components/ai/QuickSuggestions";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { whatsappLink } from "@/lib/utils";

const STORAGE_KEY = "sandro-assistant";

export function AssistantChat() {
  const { t, locale } = useLanguage();
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/assistant",
        body: { locale },
      }),
    [locale],
  );
  const { messages, sendMessage, status, setMessages } = useChat({ transport });
  const busy = status === "submitted" || status === "streaming";
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { at: number; messages: typeof messages };
        if (Date.now() - parsed.at < 24 * 60 * 60 * 1000) {
          setMessages(parsed.messages);
        }
      } catch {
        /* ignore */
      }
    }
    setReady(true);
  }, [setMessages]);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ at: Date.now(), messages }));
  }, [messages, ready]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto">
        {messages.length === 0 && (
          <>
            <ChatMessage role="assistant" text={t.ai.assistantHello} />
            <QuickSuggestions onPick={(q) => void sendMessage({ text: q })} />
          </>
        )}
        {messages.map((m) => (
          <ChatMessage
            key={m.id}
            role={m.role === "user" ? "user" : "assistant"}
            text={m.parts
              .filter((p) => p.type === "text")
              .map((p) => ("text" in p ? p.text : ""))
              .join("")}
          />
        ))}
        {busy && (
          <p className="label-mono animate-pulse">{locale === "pt" ? "um segundo…" : "one second…"}</p>
        )}
      </div>
      {messages.length >= 4 && (
        <a
          href={whatsappLink(
            locale === "pt"
              ? "Vim do assistente do site e preciso de um humano."
              : "I came from the site assistant and need a human.",
          )}
          className="mb-3 text-center text-xs text-moss underline"
          target="_blank"
          rel="noreferrer"
        >
          {locale === "pt" ? "Falar com humano" : "Talk to a human"}
        </a>
      )}
      <ChatInput disabled={busy} onSend={(text) => void sendMessage({ text })} />
    </div>
  );
}
