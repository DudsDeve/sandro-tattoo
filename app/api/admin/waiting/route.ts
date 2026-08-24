import { NextResponse } from "next/server";
import { mutateCmsStore, newId } from "@/lib/cms/store";
import type { CmsWaitingVideo } from "@/lib/cms/types";
import { youtubeVideoId } from "@/lib/utils";

function parseBody(body: Partial<CmsWaitingVideo>): Omit<CmsWaitingVideo, "id" | "order"> {
  const youtubeUrl = body.youtubeUrl?.trim() || "";
  if (!youtubeVideoId(youtubeUrl)) throw new Error("Link do YouTube inválido");
  return {
    title: body.title?.trim() || "YouTube",
    youtubeUrl,
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<CmsWaitingVideo>;
    const fields = parseBody(body);
    const store = await mutateCmsStore((s) => {
      const waitingVideos = Array.isArray(s.waitingVideos) ? s.waitingVideos : [];
      waitingVideos.push({
        id: newId("wait"),
        ...fields,
        order: body.order ?? waitingVideos.length,
      });
      return { ...s, waitingVideos };
    });
    return NextResponse.json(store);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Erro ao salvar" }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = (await req.json()) as CmsWaitingVideo;
    if (!body.id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });
    const fields = parseBody(body);
    const store = await mutateCmsStore((s) => {
      const list = Array.isArray(s.waitingVideos) ? s.waitingVideos : [];
      const i = list.findIndex((v) => v.id === body.id);
      if (i < 0) throw new Error("Não encontrado");
      list[i] = { ...list[i], ...fields, id: body.id, order: body.order ?? list[i].order };
      return { ...s, waitingVideos: list };
    });
    return NextResponse.json(store);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Erro ao atualizar" }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });
  const store = await mutateCmsStore((s) => ({
    ...s,
    waitingVideos: (s.waitingVideos || []).filter((v) => v.id !== id),
  }));
  return NextResponse.json(store);
}
