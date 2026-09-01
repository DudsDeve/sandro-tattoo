import { sendResendEmail } from "@/lib/email/resend";
import { buildConfirmationEmail } from "@/lib/tryon-auth/email-templates";

export async function sendConfirmationEmail(email: string, confirmUrl: string) {
  try {
    const result = await sendResendEmail({
      to: [email],
      subject: "Confirm your email — VERSUS Virtual Try-On",
      html: buildConfirmationEmail(confirmUrl),
    });
    if (result.skipped) {
      console.info("[tryon-auth] RESEND_API_KEY missing. Confirm URL:", confirmUrl);
      return { ok: true, skipped: true as const, confirmUrl };
    }
    return { ok: true, skipped: false as const };
  } catch (e) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[tryon-auth] Email failed. Confirm URL:", confirmUrl, e);
      return { ok: true, skipped: true as const, confirmUrl };
    }
    throw e;
  }
}
