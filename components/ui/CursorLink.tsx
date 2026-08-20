"use client";

import Link from "next/link";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { cn } from "@/lib/utils";

export function CursorLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  kind?: "hover" | "cta" | "drag";
}) {
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export function CtaLink({
  href,
  children,
  variant = "solid",
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "solid" | "outline";
  className?: string;
}) {
  return (
    <CursorLink href={href} className={cn("inline-block", className)}>
      <MagneticButton as="span" variant={variant} className="w-full">
        {children}
      </MagneticButton>
    </CursorLink>
  );
}
