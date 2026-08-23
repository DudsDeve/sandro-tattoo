import { NextResponse } from "next/server";
import { EMAIL_REGEX, isUnlimitedEmail, normalizeEmail } from "@/lib/tryon-auth/constants";
import { confirmUser, findUserByEmail, insertUser, usageSnapshot } from "@/lib/tryon-auth/db";
import { clientIp, registerRateLimited } from "@/lib/tryon-auth/rate-limit";
import { sendConfirmationEmail } from "@/lib/tryon-auth/send-email";
import { applySessionCookie, siteOrigin } from "@/lib/tryon-auth/session";

export async function POST(req: Request) {
  try {
    const ip = clientIp(req);
    if (registerRateLimited(ip)) {
      return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
    }

    const body = (await req.json()) as { email?: string };
    const email = normalizeEmail(body.email || "");
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const confirmUrlFor = (token: string) =>
      `${siteOrigin(req)}/virtual-tryout/confirm?token=${encodeURIComponent(token)}`;

    const existing = await findUserByEmail(email);

    async function enterDirect(userId: string) {
      const usage = await usageSnapshot(email, userId);
      const res = NextResponse.json({
        status: "already_confirmed",
        remainingUses: usage.remainingUses,
        usesThisMonth: usage.usesThisMonth,
      });
      return applySessionCookie(res, email);
    }

    if (isUnlimitedEmail(email)) {
      let user = existing;
      if (!user) user = await insertUser(email);
      if (!user.email_confirmed) await confirmUser(user.id);
      return enterDirect(user.id);
    }

    if (existing?.email_confirmed) {
      return enterDirect(existing.id);
    }

    if (existing && !existing.email_confirmed) {
      const sent = await sendConfirmationEmail(email, confirmUrlFor(existing.confirmation_token));
      return NextResponse.json({
        status: "confirmation_resent",
        ...(sent.skipped ? { confirmUrl: sent.confirmUrl } : {}),
      });
    }

    const created = await insertUser(email);
    const sent = await sendConfirmationEmail(email, confirmUrlFor(created.confirmation_token));
    return NextResponse.json({
      status: "confirmation_sent",
      ...(sent.skipped ? { confirmUrl: sent.confirmUrl } : {}),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to register";
    console.error("[tryon-auth/register]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
