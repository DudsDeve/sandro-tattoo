"use client";

import { type ReactNode } from "react";
import { useMagneticEffect } from "@/hooks/useMagneticEffect";
import { cn } from "@/lib/utils";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  variant?: "solid" | "outline" | "ghost";
  as?: "button" | "span";
  type?: "button" | "submit";
  onClick?: () => void;
}

export function MagneticButton({
  children,
  className,
  variant = "solid",
  as = "button",
  type = "button",
  onClick,
}: MagneticButtonProps) {
  const ref = useMagneticEffect(0.28);

  const styles = {
    solid: "bg-bg-accent text-ink hover:bg-bg-accent-light border border-line-accent",
    outline: "border border-line-accent text-ink magnetic-fill bg-transparent",
    ghost: "text-ink border-transparent",
  };

  const classes = cn(
    "relative inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-medium tracking-wide transition-colors duration-300",
    styles[variant],
    className,
  );

  if (as === "span") {
    return (
      <span ref={ref} className={classes} onClick={onClick}>
        {children}
      </span>
    );
  }

  return (
    <button ref={ref} type={type} className={classes} onClick={onClick}>
      {children}
    </button>
  );
}
