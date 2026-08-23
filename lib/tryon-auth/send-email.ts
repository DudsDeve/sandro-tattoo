import { buildConfirmationEmail } from "@/lib/tryon-auth/email-templates";

export async function sendConfirmationEmail(email: string, confirmUrl: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[tryon-auth] RESEND_API_KEY missing. Confirm URL:", confirmUrl);
      return { ok: true, skipped: true as const, confirmUrl };
    }
    throw new Error("Email is not configured (RESEND_API_KEY).");
  }

  const from = process.env.TRYON_FROM_EMAIL || process.env.RESEND_FROM || "VERSUS Tattoo <onboarding@resend.dev>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Confirm your email — VERSUS Virtual Try-On",
      html: buildConfirmationEmail(confirmUrl),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to send email: ${text.slice(0, 240)}`);
  }

  return { ok: true, skipped: false as const };
}
