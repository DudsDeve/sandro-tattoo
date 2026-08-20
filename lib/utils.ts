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

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function whatsappLink(message?: string) {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP ?? "5511988880000";
  const text = encodeURIComponent(
    message ?? "Olá! Vim pelo site do Sandro Tattoo e quero conversar sobre uma sessão.",
  );
  return `https://wa.me/${phone}?text=${text}`;
}

export function getMessageText(parts: Array<{ type: string; text?: string }>) {
  return parts
    .filter((part) => part.type === "text" && part.text)
    .map((part) => part.text)
    .join("");
}
