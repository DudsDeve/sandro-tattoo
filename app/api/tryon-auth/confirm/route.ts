import { NextResponse } from "next/server";
import { TRYON_CONFIG } from "@/lib/tryon-auth/constants";
import { confirmUser, findUserByToken } from "@/lib/tryon-auth/db";
import { applySessionCookie, siteOrigin } from "@/lib/tryon-auth/session";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = siteOrigin(req);
  const token = url.searchParams.get("token");

  const fail = (code: string) => NextResponse.redirect(new URL(`/virtual-tryout?error=${code}`, origin));

  try {
    if (!token) return fail("invalid_token");

    const user = await findUserByToken(token);
    if (!user) return fail("invalid_token");

    if (!user.email_confirmed) {
      const hours = (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60);
      if (hours > TRYON_CONFIG.CONFIRMATION_EXPIRY_HOURS) return fail("token_expired");
      await confirmUser(user.id);
    }

    const res = NextResponse.redirect(new URL("/virtual-tryout?confirmed=true", origin));
    return applySessionCookie(res, user.email);
  } catch (e) {
    console.error("[tryon-auth/confirm]", e instanceof Error ? e.message : e);
    return fail("invalid_token");
  }
}
