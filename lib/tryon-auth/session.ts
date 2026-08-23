import { NextResponse } from "next/server";
import { TRYON_CONFIG } from "@/lib/tryon-auth/constants";

export function siteOrigin(req: Request) {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (env) return env;
  return new URL(req.url).origin;
}

export function sessionCookie(email: string) {
  return {
    name: TRYON_CONFIG.SESSION_COOKIE_NAME,
    value: email,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: TRYON_CONFIG.SESSION_EXPIRY_DAYS * 24 * 60 * 60,
    path: "/",
  };
}

export function applySessionCookie(res: NextResponse, email: string) {
  const c = sessionCookie(email);
  res.cookies.set(c.name, c.value, {
    httpOnly: c.httpOnly,
    secure: c.secure,
    sameSite: c.sameSite,
    maxAge: c.maxAge,
    path: c.path,
  });
  return res;
}

export function readSessionEmail(req: Request) {
  const raw = req.headers.get("cookie") || "";
  const match = raw.match(new RegExp(`(?:^|;\\s*)${TRYON_CONFIG.SESSION_COOKIE_NAME}=([^;]*)`));
  return match?.[1] ? decodeURIComponent(match[1]) : "";
}
