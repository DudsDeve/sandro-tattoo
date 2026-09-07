import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function parseJsonResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text.trim()) {
    throw new Error(`Resposta vazia do servidor (HTTP ${res.status})`);
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("O servidor não devolveu JSON válido.");
  }
}

export function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(iso: string, locale = "en-IE") {
  const d = iso ? new Date(iso) : new Date();
  if (Number.isNaN(d.getTime())) return iso || "";
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(d);
}

export const WHATSAPP_INTRO =
  "Hi, I was looking at your website and would like to ask a few questions.";

export function whatsappLink(extra?: string) {
  const phone = (process.env.NEXT_PUBLIC_WHATSAPP ?? "353838963870").replace(/\D/g, "");
  const extraText = extra?.trim();
  const body = extraText ? `${WHATSAPP_INTRO}\n\n${extraText}` : WHATSAPP_INTRO;
  return `https://wa.me/${phone}?text=${encodeURIComponent(body)}`;
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

export function youtubeVideoId(url: string): string | null {
  const value = url.trim();
  if (!value) return null;
  const match = value.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  );
  if (match?.[1]) return match[1];
  if (/^[A-Za-z0-9_-]{11}$/.test(value)) return value;
  return null;
}

export function youtubeEmbedUrl(url: string): string | null {
  const id = youtubeVideoId(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}

export function instagramUrl(handleOrUrl: string) {
  const handle = normalizeInstagramHandle(handleOrUrl);
  if (!handle) return "";
  return `https://instagram.com/${handle}`;
}
