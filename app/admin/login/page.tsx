"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setBusy(false);
    if (!res.ok) {
      setError("Senha inválida");
      return;
    }
    router.push(params.get("next") || "/admin");
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-sm space-y-4 border border-[#1a1a1a] bg-black p-8"
    >
      <p className="font-mono text-[0.65rem] tracking-[0.2em] text-[#8b9a6b]">ACESSO</p>
      <h1 className="font-serif text-3xl">Admin</h1>
      <p className="text-sm text-[#a09b95]">
        Gerencie fotos, vídeos, artistas e blog. Sem alterar a estrutura do site.
      </p>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Senha"
        className="w-full border border-[#1a1a1a] bg-[#111] px-3 py-3"
        autoFocus
      />
      {error && <p className="text-sm text-[#8f4a4a]">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="w-full bg-[#4c5634] px-4 py-3 text-sm tracking-wide text-white"
      >
        {busy ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-[#a09b95]">
          Carregando…
        </div>
      }
    >
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4">
        <LoginForm />
      </div>
    </Suspense>
  );
}
