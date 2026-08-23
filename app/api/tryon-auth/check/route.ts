import { NextResponse } from "next/server";
import { monthResetDate } from "@/lib/tryon-auth/constants";
import { findUserByEmail, usageSnapshot } from "@/lib/tryon-auth/db";
import { readSessionEmail } from "@/lib/tryon-auth/session";
import { TRYON_CONFIG } from "@/lib/tryon-auth/constants";

export async function GET(req: Request) {
  try {
    const email = readSessionEmail(req);
    if (!email) return NextResponse.json({ authenticated: false });

    const user = await findUserByEmail(email);
    if (!user || !user.email_confirmed) {
      const res = NextResponse.json({ authenticated: false });
      res.cookies.delete(TRYON_CONFIG.SESSION_COOKIE_NAME);
      return res;
    }

    const usage = await usageSnapshot(email, user.id);
    return NextResponse.json({
      authenticated: true,
      email: user.email,
      usesThisMonth: usage.usesThisMonth,
      remainingUses: usage.remainingUses,
      isUnlimited: usage.isUnlimited,
      canUse: usage.canUse,
      resetsAt: monthResetDate().toISOString(),
    });
  } catch (e) {
    console.error("[tryon-auth/check]", e instanceof Error ? e.message : e);
    return NextResponse.json({ authenticated: false });
  }
}
