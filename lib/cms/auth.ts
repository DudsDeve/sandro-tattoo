import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE = "st_admin_session";
const MAX_AGE = 60 * 60 * 24 * 7;

function secret() {
  return process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "sandro-dev-secret";
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

export function adminPasswordOk(password: string) {
  const expected = process.env.ADMIN_PASSWORD || "sandroadmin";
  if (password.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(password), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function createAdminSession() {
  const exp = String(Date.now() + MAX_AGE * 1000);
  const token = `${exp}.${sign(exp)}`;
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearAdminSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function isAdminAuthenticated() {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return false;
  const [exp, sig] = raw.split(".");
  if (!exp || !sig) return false;
  if (Number(exp) < Date.now()) return false;
  const expected = sign(exp);
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function requireAdmin() {
  const ok = await isAdminAuthenticated();
  if (!ok) throw new Error("UNAUTHORIZED");
}
