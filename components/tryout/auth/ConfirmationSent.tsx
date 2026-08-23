"use client";

import { useEffect, useState } from "react";

export function ConfirmationSent({
  email,
  onResend,
  devConfirmUrl,
}: {
  email: string;
  onResend: () => Promise<void>;
  devConfirmUrl?: string;
}) {
  const [wait, setWait] = useState(60);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (wait <= 0) return;
    const id = window.setTimeout(() => setWait((n) => n - 1), 1000);
    return () => window.clearTimeout(id);
  }, [wait]);

  return (
    <div className="page-shell flex min-h-[70svh] items-center justify-center">
      <div className="w-full max-w-md border border-line bg-[#0A0A0A] p-8 text-center">
        <p className="label-mono">Inbox</p>
        <h1 className="font-display mt-3 text-3xl">Check your email</h1>
        <p className="mt-4 text-sm text-ink-secondary">
          We sent a confirmation link to <span className="text-ink">{email}</span>. Click it to activate
          Virtual Try-On.
        </p>
        <p className="mt-4 text-xs text-ink-muted">Didn’t receive it? Check spam, or resend below.</p>
        <button
          type="button"
          disabled={wait > 0 || busy}
          className="mt-6 text-sm text-moss disabled:text-ink-muted"
          onClick={async () => {
            setBusy(true);
            try {
              await onResend();
              setWait(60);
            } finally {
              setBusy(false);
            }
          }}
        >
          {wait > 0 ? `Resend in ${wait}s` : busy ? "Sending…" : "Resend"}
        </button>
        {devConfirmUrl ? (
          <p className="mt-6 break-all text-left text-xs text-ink-muted">
            Dev only — no email provider:{" "}
            <a href={devConfirmUrl} className="text-moss underline">
              confirm link
            </a>
          </p>
        ) : null}
      </div>
    </div>
  );
}
