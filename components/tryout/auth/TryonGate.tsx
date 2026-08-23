"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { ConfirmationSent } from "@/components/tryout/auth/ConfirmationSent";
import { EmailInput } from "@/components/tryout/auth/EmailInput";
import { LimitReached } from "@/components/tryout/auth/LimitReached";
import { isUnlimitedEmail } from "@/lib/tryon-auth/constants";

export type TryonAuthInfo = {
  email: string;
  remainingUses: number;
  usesThisMonth: number;
  isUnlimited: boolean;
  resetsAt: string;
  refresh: () => Promise<void>;
};

type GateState = "loading" | "need_email" | "confirmation_sent" | "limit_reached" | "authorized";

export function TryonGate({ children }: { children: (auth: TryonAuthInfo) => ReactNode }) {
  const [state, setState] = useState<GateState>("loading");
  const [authInfo, setAuthInfo] = useState<TryonAuthInfo | null>(null);
  const [email, setEmail] = useState("");
  const [devConfirmUrl, setDevConfirmUrl] = useState("");

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/tryon-auth/check", { cache: "no-store" });
      const data = (await res.json()) as {
        authenticated?: boolean;
        email?: string;
        remainingUses?: number;
        usesThisMonth?: number;
        isUnlimited?: boolean;
        canUse?: boolean;
        resetsAt?: string;
      };

      if (data.authenticated && data.email) {
        const info: TryonAuthInfo = {
          email: data.email,
          remainingUses: data.remainingUses ?? 0,
          usesThisMonth: data.usesThisMonth ?? 0,
          isUnlimited: Boolean(data.isUnlimited),
          resetsAt: data.resetsAt ?? "",
        };
        setAuthInfo(info);
        setState(data.canUse ? "authorized" : "limit_reached");
        return;
      }
      setState("need_email");
    } catch {
      setState("need_email");
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    void checkSession().then(() => {
      if (params.get("confirmed") === "true" || params.get("error")) {
        window.history.replaceState({}, "", "/virtual-tryout");
      }
    });
  }, [checkSession]);

  async function handleEmailSubmit(submittedEmail: string) {
    setEmail(submittedEmail);
    const res = await fetch("/api/tryon-auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: submittedEmail }),
    });
    const data = (await res.json()) as {
      status?: string;
      remainingUses?: number;
      usesThisMonth?: number;
      error?: string;
      confirmUrl?: string;
    };
    if (!res.ok) throw new Error(data.error || "Failed to register");

    if (data.status === "already_confirmed") {
      const remaining = data.remainingUses ?? 0;
      setAuthInfo({
        email: submittedEmail,
        remainingUses: remaining,
        usesThisMonth: data.usesThisMonth ?? 0,
        isUnlimited: isUnlimitedEmail(submittedEmail),
        resetsAt: "",
      });
      setState(remaining > 0 || isUnlimitedEmail(submittedEmail) ? "authorized" : "limit_reached");
      return;
    }

    setDevConfirmUrl(data.confirmUrl || "");
    setState("confirmation_sent");
  }

  if (state === "loading") {
    return (
      <div className="page-shell flex min-h-[50svh] items-center justify-center">
        <p className="label-mono text-ink-muted">Checking access…</p>
      </div>
    );
  }

  if (state === "need_email") {
    return <EmailInput onSubmit={handleEmailSubmit} />;
  }

  if (state === "confirmation_sent") {
    return (
      <ConfirmationSent
        email={email}
        onResend={() => handleEmailSubmit(email)}
        devConfirmUrl={devConfirmUrl}
      />
    );
  }

  if (state === "limit_reached" && authInfo) {
    return <LimitReached resetsAt={authInfo.resetsAt} email={authInfo.email} />;
  }

  if (state === "authorized" && authInfo) {
    return <>{children({ ...authInfo, refresh: checkSession })}</>;
  }

  return null;
}
