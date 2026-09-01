import type { CmsClient } from "@/lib/cms/types";
import { sendResendEmail } from "@/lib/email/resend";

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function bookingNotifyTo() {
  return (
    process.env.BOOKING_NOTIFY_EMAIL?.trim() ||
    process.env.ADMIN_EMAIL?.trim() ||
    ""
  );
}

function buildBookingEmail(client: CmsClient) {
  const sizeLabel: Record<string, string> = {
    pequena: "Pequena",
    media: "Média",
    grande: "Grande / projeto",
  };
  const rows: [string, string][] = [
    ["Nome", client.name],
    ["E-mail", client.email],
    ["Telefone", client.phone],
    ...(client.instagram ? [["Instagram", client.instagram] as [string, string]] : []),
    ["Artista", client.artistName || client.artistSlug],
    ["Horário", client.slot],
    ["Local no corpo", client.bodyPart],
    ["Tamanho", sizeLabel[client.size] || client.size],
    ["Primeira tattoo", client.firstTattoo === "sim" ? "Sim" : "Não"],
    ...(client.ideaLink ? [["Link de referência", client.ideaLink] as [string, string]] : []),
  ];

  const ideaBlock = client.idea
    ? `<h3 style="margin:24px 0 8px;font-size:14px;text-transform:uppercase;letter-spacing:0.08em;color:#6b6560;">Ideia</h3>
       <p style="margin:0;white-space:pre-wrap;line-height:1.6;">${esc(client.idea)}</p>`
    : "";

  const images =
    client.ideaImages.length > 0
      ? `<h3 style="margin:24px 0 8px;font-size:14px;text-transform:uppercase;letter-spacing:0.08em;color:#6b6560;">Referências (${client.ideaImages.length})</h3>
         <ul style="margin:0;padding-left:18px;">${client.ideaImages
           .map((url) => `<li><a href="${esc(url)}">${esc(url)}</a></li>`)
           .join("")}</ul>`
      : "";

  const table = rows
    .map(
      ([label, value]) =>
        `<tr>
          <td style="padding:8px 16px 8px 0;font-weight:600;color:#6b6560;vertical-align:top;white-space:nowrap;">${esc(label)}</td>
          <td style="padding:8px 0;line-height:1.5;">${esc(value)}</td>
        </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:24px;background:#f5f1eb;font-family:Georgia,serif;color:#1a1816;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e8e2d9;padding:28px;">
    <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#8a847c;">VERSUS Tattoo</p>
    <h1 style="margin:0 0 20px;font-size:24px;font-weight:400;">Novo pedido — Book a session</h1>
    <table style="border-collapse:collapse;width:100%;font-size:15px;">${table}</table>
    ${ideaBlock}
    ${images}
    <p style="margin:28px 0 0;font-size:12px;color:#8a847c;">ID: ${esc(client.id)} · ${esc(new Date(client.createdAt).toLocaleString("pt-PT"))}</p>
  </div>
</body>
</html>`;
}

export async function sendBookingNotificationEmail(client: CmsClient) {
  const to = bookingNotifyTo();
  if (!to) {
    console.warn("[booking] BOOKING_NOTIFY_EMAIL / ADMIN_EMAIL not set — notification skipped");
    return { ok: true, skipped: true as const };
  }

  return sendResendEmail({
    to: [to],
    replyTo: client.email,
    subject: `Novo agendamento — ${client.name} (${client.artistName || client.artistSlug})`,
    html: buildBookingEmail(client),
  });
}
