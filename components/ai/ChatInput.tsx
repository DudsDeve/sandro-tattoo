"use client";

import { useState } from "react";
import { MagneticButton } from "@/components/ui/MagneticButton";

export function ChatInput({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");

  return (
    <form
      className="mt-4 flex gap-2 border-t border-line pt-4"
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
        placeholder="Escreva sua ideia…"
        className="flex-1 px-3 py-3"
      />
      <MagneticButton type="submit">Enviar</MagneticButton>
    </form>
  );
}
