"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  variant?: "solid" | "outline" | "ghost";
  as?: "button" | "span";
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
}

export function MagneticButton({
  children,
  className,
  variant = "solid",
  as = "button",
  type = "button",
  onClick,
  disabled,
}: MagneticButtonProps) {
  const styles = {
    solid: "bg-bg-accent text-ink hover:bg-bg-accent-light border border-line-accent",
    outline: "border border-line-accent text-ink magnetic-fill bg-transparent",
    ghost: "text-ink border-transparent",
  };

  const classes = cn(
    "relative inline-flex min-h-11 items-center justify-center gap-2 px-5 py-3 text-sm font-medium tracking-wide transition-colors duration-300 sm:px-7 sm:py-3.5",
    styles[variant],
    disabled && "opacity-40",
    className,
  );

  if (as === "span") {
    return (
      <span className={classes} onClick={onClick}>
        {children}
      </span>
    );
  }

  return (
    <button type={type} className={classes} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
