"use client";

import { MagneticButton } from "@/components/ui/MagneticButton";
import { CtaLink } from "@/components/ui/CursorLink";

export function ResultExport({
  disabled,
  onExport,
}: {
  disabled: boolean;
  onExport: () => Promise<void>;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <MagneticButton onClick={() => void onExport()} className={disabled ? "pointer-events-none opacity-40" : ""}>
        Salvar preview
      </MagneticButton>
      <CtaLink href="/agendar" variant="outline">
        Agendar com este design
      </CtaLink>
    </div>
  );
}
