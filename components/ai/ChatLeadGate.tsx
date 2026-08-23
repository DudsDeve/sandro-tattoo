"use client";

import { useState } from "react";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const STORAGE_KEY = "versus-chat-lead";

export type ChatLead = { name: string; email: string; phone: string };

export function readChatLead(): ChatLead | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as ChatLead;
    if (data.name?.trim() && data.email?.includes("@") && data.phone?.replace(/\D/g, "").length >= 8) {
      return data;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function saveChatLead(lead: ChatLead) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lead));
}

export function ChatLeadGate({ children }: { children: React.ReactNode }) {
  const { t, locale } = useLanguage();
  const [lead, setLead] = useState<ChatLead | null>(() => readChatLead());
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (lead) return <>{children}</>;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Erro");
      const next = { name: name.trim(), email: email.trim(), phone: phone.trim() };
      saveChatLead(next);
      setLead(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={(e) => void submit(e)} className="flex h-full flex-col justify-center gap-3">
      <p className="label-mono text-moss">{t.ai.leadLabel}</p>
      <p className="text-sm text-ink-secondary">{t.ai.leadIntro}</p>
      <input
        required
        minLength={2}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t.ai.leadName}
        className="w-full px-3 py-3"
        autoComplete="name"
      />
      <input
        required
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t.ai.leadEmail}
        className="w-full px-3 py-3"
        autoComplete="email"
      />
      <input
        required
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder={t.ai.leadPhone}
        className="w-full px-3 py-3"
        autoComplete="tel"
      />
      {error ? <p className="text-sm text-error">{error}</p> : null}
      <MagneticButton type="submit" className="mt-2 w-full" disabled={busy}>
        {busy ? (locale === "pt" ? "Salvando…" : "Saving…") : t.ai.leadStart}
      </MagneticButton>
    </form>
  );
}
