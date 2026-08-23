"use client";

import { useState } from "react";
import { EMAIL_REGEX } from "@/lib/tryon-auth/constants";

export function EmailInput({ onSubmit }: { onSubmit: (email: string) => Promise<void> }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const valid = EMAIL_REGEX.test(email.trim());

  return (
    <div className="page-shell flex min-h-[70svh] items-center justify-center">
      <form
        className="w-full max-w-md border border-line bg-[#0A0A0A] p-8"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!valid || busy) return;
          setBusy(true);
          setError("");
          try {
            await onSubmit(email.trim());
          } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
          } finally {
            setBusy(false);
          }
        }}
      >
        <p className="label-mono">Virtual try-on</p>
        <h1 className="font-display mt-3 text-3xl">Enter your email</h1>
        <p className="mt-3 text-sm text-ink-secondary">
          Unlock the Virtual Try-On. You get 3 free sessions per month.
        </p>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="mt-8 w-full border border-line bg-black px-4 py-3 text-ink outline-none focus:border-line-accent"
        />
        <button
          type="submit"
          disabled={!valid || busy}
          className="mt-5 w-full bg-bg-accent px-5 py-3 text-sm disabled:opacity-40"
        >
          {busy ? "Sending…" : "Continue"}
        </button>
        {error ? <p className="mt-4 text-sm text-error">{error}</p> : null}
      </form>
    </div>
  );
}
