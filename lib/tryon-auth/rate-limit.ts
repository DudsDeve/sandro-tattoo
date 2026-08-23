import { TRYON_CONFIG } from "@/lib/tryon-auth/constants";

const hits = new Map<string, number[]>();

export function registerRateLimited(ip: string) {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const prev = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
  if (prev.length >= TRYON_CONFIG.REGISTER_MAX_PER_HOUR) {
    hits.set(ip, prev);
    return true;
  }
  prev.push(now);
  hits.set(ip, prev);
  return false;
}

export function clientIp(req: Request) {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip") || "unknown";
}
