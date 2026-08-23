import { NextResponse } from "next/server";
import { findUserByEmail, logUsage, usageSnapshot } from "@/lib/tryon-auth/db";
import { readSessionEmail } from "@/lib/tryon-auth/session";

export async function POST(req: Request) {
  try {
    const email = readSessionEmail(req);
    if (!email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = (await req.json()) as { modelUsed?: string; designName?: string };
    const user = await findUserByEmail(email);
    if (!user || !user.email_confirmed) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const before = await usageSnapshot(email, user.id);
    if (!before.canUse) {
      return NextResponse.json({ error: "Monthly limit reached" }, { status: 429 });
    }

    await logUsage(user.id, body.modelUsed || "unknown", body.designName || "unknown");
    const after = await usageSnapshot(email, user.id);

    return NextResponse.json({
      success: true,
      usesThisMonth: after.usesThisMonth,
      remainingUses: after.remainingUses,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to log usage";
    console.error("[tryon-auth/log-usage]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
