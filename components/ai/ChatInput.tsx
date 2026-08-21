"use client";

import { useState } from "react";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useT } from "@/lib/i18n/LanguageProvider";

export function ChatInput({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void;
  disabled?: boolean;
}) {
  const t = useT();
  const [value, setValue] = useState("");

  return (
    <form
      className="mt-4 flex flex-col gap-2 border-t border-line pt-4 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        const text = value.trim();
        if (!text) return;
        onSend(text);
        setValue("");
      }}
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
        placeholder={t.ai.placeholder}
        className="flex-1 px-3 py-3"
      />
      <MagneticButton type="submit" className="w-full sm:w-auto">
        {t.ai.send}
      </MagneticButton>
    </form>
  );
}
