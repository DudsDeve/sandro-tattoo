"use client";

import { cn } from "@/lib/utils";

const LOGO = "/brand/versus-logo.png";
const MARK = "/brand/versus-mark.png";

/** Logomarca VERSUS (PNG) ou monograma VS compacto. */
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
      src={compact ? MARK : LOGO}
      alt="VERSUS"
      className={cn("select-none object-contain", animate && "origin-center", className)}
      draggable={false}
    />
  );
}
