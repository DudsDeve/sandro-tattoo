import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(iso: string, locale = "en-IE") {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function whatsappLink(message?: string) {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP ?? "5511988880000";
  const text = encodeURIComponent(
    message ?? "Hi! I came from the Sandro Tattoo website and want to talk about a session.",
  );
  return `https://wa.me/${phone}?text=${text}`;
}

export function getMessageText(parts: Array<{ type: string; text?: string }>) {
  return parts
    .filter((part) => part.type === "text" && part.text)
    .map((part) => part.text)
    .join("");
}

/** Aceita @user, user ou URL completa → handle limpo. */
export function normalizeInstagramHandle(raw: string) {
  const value = raw.trim();
  if (!value) return "";
  try {
    if (/^https?:\/\//i.test(value) || value.includes("instagram.com")) {
      const url = new URL(value.startsWith("http") ? value : `https://${value}`);
      const part = url.pathname.split("/").filter(Boolean)[0] || "";
      return part.replace(/^@/, "").replace(/\/$/, "");
    }
  } catch {
    /* fall through */
  }
  return value.replace(/^@/, "").replace(/\/+$/, "").split(/[/?#]/)[0] || "";
}

export function instagramUrl(handleOrUrl: string) {
  const handle = normalizeInstagramHandle(handleOrUrl);
  if (!handle) return "";
  return `https://instagram.com/${handle}`;
}
