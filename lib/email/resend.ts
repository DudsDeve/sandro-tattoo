type SendEmailInput = {
  to: string[];
  subject: string;
  html: string;
  replyTo?: string;
};

export function resendFromAddress() {
  return process.env.TRYON_FROM_EMAIL || process.env.RESEND_FROM || "VERSUS Tattoo <onboarding@resend.dev>";
}

export async function sendResendEmail(input: SendEmailInput) {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[email] RESEND_API_KEY missing — skipped:", input.subject);
      return { ok: true, skipped: true as const };
    }
    throw new Error("Email is not configured (RESEND_API_KEY).");
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: resendFromAddress(),
      to: input.to,
      subject: input.subject,
      html: input.html,
      ...(input.replyTo ? { reply_to: input.replyTo } : {}),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to send email: ${text.slice(0, 240)}`);
  }

  return { ok: true, skipped: false as const };
}
