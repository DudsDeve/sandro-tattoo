"use client";

import { CtaLink } from "@/components/ui/CursorLink";

export function LimitReached({ resetsAt, email }: { resetsAt: string; email: string }) {
  const date = resetsAt
    ? new Date(resetsAt).toLocaleDateString("en-IE", { day: "numeric", month: "long" })
    : "next month";

  return (
    <div className="page-shell flex min-h-[70svh] items-center justify-center">
      <div className="w-full max-w-lg border border-line bg-[#0A0A0A] p-8 text-center">
        <p className="label-mono">Monthly limit</p>
        <h1 className="font-display mt-3 text-3xl">You’ve used all 3 sessions this month</h1>
        <p className="mt-4 text-sm text-ink-secondary">
          Access for <span className="text-ink">{email}</span> resets on {date}. Meanwhile you can browse
          the gallery or book a consultation.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <CtaLink href="/galeria" variant="outline">
            Browse gallery
          </CtaLink>
          <CtaLink href="/agendar">Book a session</CtaLink>
        </div>
      </div>
    </div>
  );
}
