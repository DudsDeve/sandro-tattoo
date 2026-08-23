import { NextResponse } from "next/server";
import { mutateCmsStore, newId } from "@/lib/cms/store";
import type { CmsClient } from "@/lib/cms/types";

function str(v: unknown, max = 400) {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const name = str(body.name, 120);
    const email = str(body.email, 200).toLowerCase();
    const phone = str(body.phone, 40);
    const digits = phone.replace(/\D/g, "");

    if (name.length < 2 || !email.includes("@") || digits.length < 8) {
      return NextResponse.json({ error: "Nome, e-mail e telefone são obrigatórios." }, { status: 400 });
    }

    const ideaNote = "Lead do chat de atendimento (FAQ / conceito).";

    const store = await mutateCmsStore((s) => {
      const clients = Array.isArray(s.clients) ? [...s.clients] : [];
      const existing = clients.find((c) => c.email.toLowerCase() === email);
      if (existing) {
        const idea = existing.idea?.includes("chat de atendimento")
          ? existing.idea
          : [existing.idea, ideaNote].filter(Boolean).join("\n\n");
        const next: CmsClient = { ...existing, name, phone, idea, source: existing.source || "chat" };
        return { ...s, clients: clients.map((c) => (c.id === existing.id ? next : c)) };
      }
      const client: CmsClient = {
        id: newId("cli"),
        createdAt: new Date().toISOString(),
        name,
        email,
        phone,
        instagram: "",
        artistSlug: "",
        artistName: "",
        idea: ideaNote,
        ideaLink: "",
        ideaImages: [],
        bodyPart: "",
        size: "",
        firstTattoo: "nao",
        slot: "",
        source: "chat",
      };
      return { ...s, clients: [client, ...clients] };
    });

    const saved = store.clients.find((c) => c.email.toLowerCase() === email);
    return NextResponse.json({ ok: true, id: saved?.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao salvar contato";
    console.error("[leads]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
