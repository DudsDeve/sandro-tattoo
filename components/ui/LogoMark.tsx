"use client";

import { cn } from "@/lib/utils";

const LOGO = "/brand/versus-logo.png?v=4";

/** Logomarca VERSUS (PNG). */
export function LogoMark({
  className,
  compact = false,
  animate = false,
}: {
  className?: string;
  compact?: boolean;
  animate?: boolean;
}) {
  return (
    <img
      src={LOGO}
      alt="VERSUS"
      className={cn("select-none object-contain", animate && "origin-center", compact && "origin-center", className)}
      draggable={false}
    />
  );
}
