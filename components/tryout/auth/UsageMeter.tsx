"use client";

import { TRYON_CONFIG } from "@/lib/tryon-auth/constants";

export function UsageMeter({
  used,
  remaining,
  isUnlimited,
}: {
  used: number;
  remaining: number;
  isUnlimited: boolean;
}) {
  if (isUnlimited) return null;
  const limit = TRYON_CONFIG.MONTHLY_LIMIT;
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <p className="text-sm text-ink-secondary">
        {remaining} of {limit} sessions remaining this month
      </p>
      <div className="flex gap-1.5" aria-hidden>
        {Array.from({ length: limit }).map((_, i) => (
          <span
            key={i}
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: i < used ? "#5C5955" : "#4C5634" }}
          />
        ))}
      </div>
    </div>
  );
}
