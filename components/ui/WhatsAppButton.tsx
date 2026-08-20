"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/utils";

export function WhatsAppButton() {
  return (
    <Link
      href={whatsappLink()}
      target="_blank"
      rel="noreferrer"
      aria-label="WhatsApp"
      className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1.25rem,env(safe-area-inset-right))] z-50 flex h-12 w-12 items-center justify-center rounded-full bg-bg-accent text-ink shadow-[0_0_0_0_rgba(76,86,52,0.5)] sm:h-14 sm:w-14"
    >
      <span className="absolute inset-0 animate-[pulse-ring_2s_ease-out_infinite] rounded-full border border-bg-accent-light" />
      <MessageCircle size={22} />
    </Link>
  );
}
