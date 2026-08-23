"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CursorLink } from "@/components/ui/CursorLink";
import { useUser } from "@/components/auth/UserProvider";
import { useT } from "@/lib/i18n/LanguageProvider";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const t = useT();
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useUser();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const next = params.get("next") || "/conta";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch(mode === "login" ? "/api/auth/login" : "/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mode === "login" ? { email, password } : { name, email, password }),
    });
    const data = (await res.json()) as { error?: string };
    setBusy(false);
    if (!res.ok) {
      setError(data.error || t.auth.error);
      return;
    }
    await refresh();
    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 border border-line bg-black p-8">
      <p className="font-mono text-[0.65rem] tracking-[0.2em] text-[#8b9a6b]">{t.auth.eyebrow}</p>
      <h1 className="font-serif text-3xl">{mode === "login" ? t.auth.loginTitle : t.auth.registerTitle}</h1>
      <p className="text-sm text-ink-secondary">{mode === "login" ? t.auth.loginLead : t.auth.registerLead}</p>
      {mode === "register" ? (
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.auth.name}
          className="w-full border border-line bg-[#111] px-3 py-3"
          autoComplete="name"
          required
        />
      ) : null}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t.auth.email}
        className="w-full border border-line bg-[#111] px-3 py-3"
        autoComplete="email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={t.auth.password}
        className="w-full border border-line bg-[#111] px-3 py-3"
        autoComplete={mode === "login" ? "current-password" : "new-password"}
        minLength={8}
        required
      />
      {error ? <p className="text-sm text-[#8f4a4a]">{error}</p> : null}
      <button
        type="submit"
        disabled={busy}
        className="w-full bg-[#4c5634] px-4 py-3 text-sm tracking-wide text-white disabled:opacity-40"
      >
        {busy ? t.auth.wait : mode === "login" ? t.auth.submitLogin : t.auth.submitRegister}
      </button>
      {mode === "login" ? (
        <p className="text-sm text-ink-secondary">
          {t.auth.noAccount}{" "}
          <CursorLink
            href={`/cadastro${next !== "/conta" ? `?next=${encodeURIComponent(next)}` : ""}`}
            className="text-[#8b9a6b]"
          >
            {t.auth.createAccount}
          </CursorLink>
        </p>
      ) : (
        <p className="text-sm text-ink-secondary">
          {t.auth.hasAccount}{" "}
          <CursorLink
            href={`/entrar${next !== "/conta" ? `?next=${encodeURIComponent(next)}` : ""}`}
            className="text-[#8b9a6b]"
          >
            {t.auth.goLogin}
          </CursorLink>
        </p>
      )}
    </form>
  );
}
