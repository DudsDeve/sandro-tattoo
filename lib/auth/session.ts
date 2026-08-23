import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const USER_COOKIE = "st_user_session";
const MAX_AGE = 60 * 60 * 24 * 30;

function secret() {
  return process.env.AUTH_SECRET || process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "sandro-dev-secret";
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

export function parseUserSessionToken(raw?: string | null): { id: string; exp: number } | null {
  if (!raw) return null;
  const [id, exp, sig] = raw.split(".");
  if (!id || !exp || !sig) return null;
  if (Number(exp) < Date.now()) return null;
  const payload = `${id}.${exp}`;
  const expected = sign(payload);
  try {
    if (expected.length !== sig.length) return null;
    if (!timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return null;
  } catch {
    return null;
  }
  return { id, exp: Number(exp) };
}

export async function createUserSession(userId: string) {
  const exp = String(Date.now() + MAX_AGE * 1000);
  const payload = `${userId}.${exp}`;
  const token = `${payload}.${sign(payload)}`;
  const jar = await cookies();
  jar.set(USER_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearUserSession() {
  const jar = await cookies();
  jar.delete(USER_COOKIE);
}

export async function readUserSessionId() {
  const jar = await cookies();
  return parseUserSessionToken(jar.get(USER_COOKIE)?.value)?.id ?? null;
}
