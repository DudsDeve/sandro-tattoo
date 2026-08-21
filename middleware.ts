import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE = "st_admin_session";

function secret() {
  return process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "sandro-dev-secret";
}

function toHex(buf: ArrayBuffer) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqualHex(a: string, b: string) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

async function sign(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return toHex(sig);
}

async function validSession(raw?: string) {
  if (!raw) return false;
  const [exp, sig] = raw.split(".");
  if (!exp || !sig) return false;
  if (Number(exp) < Date.now()) return false;
  const expected = await sign(exp);
  return timingSafeEqualHex(sig, expected);
}

function bareNext(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-sandro-shell", "bare");
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname !== "/admin/login") {
      const token = request.cookies.get(COOKIE)?.value;
      if (!(await validSession(token))) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin/login";
        url.searchParams.set("next", pathname);
        return NextResponse.redirect(url);
      }
    }
    return bareNext(request);
  }

  if (pathname.startsWith("/studio")) {
    return bareNext(request);
  }

  if (pathname.startsWith("/api/admin") && !pathname.startsWith("/api/admin/login")) {
    const token = request.cookies.get(COOKIE)?.value;
    if (!(await validSession(token))) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/studio/:path*", "/api/admin/:path*"],
};
