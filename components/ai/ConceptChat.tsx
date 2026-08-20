"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChatMessage } from "@/components/ai/ChatMessage";
import { ChatInput } from "@/components/ai/ChatInput";
import { ConceptResult } from "@/components/ai/ConceptResult";

function extractImagePrompt(text: string) {
  const match = text.match(/\[GENERATE_IMAGE:\s*([\s\S]*?)\]/);
  return match?.[1]?.trim() ?? null;
}

export function ConceptChat({ compact = false }: { compact?: boolean }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const asked = useRef(new Set<string>());

  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const { messages, sendMessage, status } = useChat({ transport });
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    const last = [...messages].reverse().find((m) => m.role === "assistant");
    if (!last) return;
    const text = last.parts
      .filter((p) => p.type === "text")
      .map((p) => ("text" in p ? p.text : ""))
      .join("");
    const prompt = extractImagePrompt(text);
    if (!prompt || asked.current.has(last.id)) return;
    asked.current.add(last.id);
    setImageLoading(true);
    fetch("/api/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    })
      .then((r) => r.json())
      .then((d: { url?: string }) => setImageUrl(d.url ?? null))
      .finally(() => setImageLoading(false));
  }, [messages]);

  return (
    <div className={`flex flex-col ${compact ? "h-full" : "h-[70vh]"}`}>
      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <ChatMessage
            role="assistant"
            text="Olá! Eu sou o assistente criativo do Sandro Tattoo. Vou te ajudar a transformar sua ideia em um conceito visual. Me conta: o que você imagina para sua tattoo?"
          />
        )}
        {messages.map((m) => (
          <ChatMessage
            key={m.id}
            role={m.role === "user" ? "user" : "assistant"}
            text={m.parts
              .filter((p) => p.type === "text")
              .map((p) => ("text" in p ? p.text.replace(/\[GENERATE_IMAGE:[\s\S]*?\]/, "").trim() : ""))
              .join("")}
          />
        ))}
        {busy && <p className="label-mono animate-pulse">desenhando o pensamento…</p>}
        {(imageUrl || imageLoading) && (
          <ConceptResult imageUrl={imageUrl} loading={imageLoading} />
        )}
      </div>
      <ChatInput
        disabled={busy}
        onSend={(text) => {
          void sendMessage({ text });
        }}
      />
    </div>
  );
}
