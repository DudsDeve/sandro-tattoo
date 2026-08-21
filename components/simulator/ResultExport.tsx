"use client";

import { MagneticButton } from "@/components/ui/MagneticButton";
import { CtaLink } from "@/components/ui/CursorLink";
import { useT } from "@/lib/i18n/LanguageProvider";

export function ResultExport({
  disabled,
  onExport,
}: {
  disabled: boolean;
  onExport: () => Promise<void>;
}) {
  const t = useT();
  return (
    <div className="flex flex-wrap gap-3">
      <MagneticButton onClick={() => void onExport()} className={disabled ? "pointer-events-none opacity-40" : ""}>
        {t.simulator.savePreview}
      </MagneticButton>
      <CtaLink href="/agendar" variant="outline">
        {t.simulator.bookDesign}
      </CtaLink>
    </div>
  );
}
