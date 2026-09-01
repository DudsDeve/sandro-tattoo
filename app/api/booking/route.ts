import { NextResponse } from "next/server";
import { sendBookingNotificationEmail } from "@/lib/booking/notify-email";
import { mutateCmsStore, newId } from "@/lib/cms/store";
import type { CmsClient } from "@/lib/cms/types";

function str(v: unknown, max = 4000) {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const name = str(body.name, 120);
    const email = str(body.email, 200);
    const phone = str(body.phone, 40);
    const idea = str(body.idea, 8000);
    const artistSlug = str(body.artist, 80);
    const slot = str(body.slot, 120);
    const bodyPart = str(body.bodyPart, 120);
    const size = str(body.size, 40);
    const firstRaw = str(body.firstTattoo, 8);
    const firstTattoo: "sim" | "nao" = firstRaw === "sim" ? "sim" : "nao";

    if (
      name.length < 2 ||
      !email.includes("@") ||
      phone.length < 8 ||
      !artistSlug ||
      !slot ||
      (idea.length < 8 && !str(body.tryoutPreview, 2000))
    ) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const ideaImages = Array.isArray(body.ideaImages)
      ? body.ideaImages.filter((u): u is string => typeof u === "string" && u.length > 0).slice(0, 8)
      : [];
    const tryoutPreview = str(body.tryoutPreview, 2000);
    if (tryoutPreview && !ideaImages.includes(tryoutPreview)) ideaImages.unshift(tryoutPreview);

    let savedClient: CmsClient | null = null;

    const store = await mutateCmsStore((s) => {
      const artist = s.artists.find((a) => a.slug === artistSlug);
      const client: CmsClient = {
        id: newId("cli"),
        createdAt: new Date().toISOString(),
        name,
        email,
        phone,
        instagram: str(body.instagram, 80),
        artistSlug,
        artistName: artist?.name || artistSlug,
        idea,
        ideaLink: str(body.ideaLink, 500),
        ideaImages,
        bodyPart,
        size,
        firstTattoo,
        slot,
      };
      savedClient = client;
      const clients = [client, ...(Array.isArray(s.clients) ? s.clients : [])];
      return { ...s, clients };
    });

    if (savedClient) {
      try {
        await sendBookingNotificationEmail(savedClient);
      } catch (e) {
        console.error("[booking] notification email failed:", e);
      }
    }

    return NextResponse.json({ ok: true, id: store.clients[0]?.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao salvar pedido";
    console.error("[booking]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
