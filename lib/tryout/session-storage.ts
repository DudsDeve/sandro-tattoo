import type { TryoutSession } from "@/lib/tryout/types";

const KEY = "versus_tryout";

export function saveTryoutToSession(data: TryoutSession): void {
  sessionStorage.setItem(KEY, JSON.stringify(data));
}

export function getTryoutFromSession(): TryoutSession | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as TryoutSession;
    if (Date.now() - data.timestamp > 2 * 60 * 60 * 1000) {
      sessionStorage.removeItem(KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}
