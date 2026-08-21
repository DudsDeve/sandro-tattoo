import { NextResponse } from "next/server";
import { mutateCmsStore, newId, removeMedia } from "@/lib/cms/store";
import type { CmsWorkItem } from "@/lib/cms/types";

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<CmsWorkItem>;
  if (!body.title?.trim() || !body.categoryId || !body.image) {
    return NextResponse.json({ error: "Título, categoria e imagem são obrigatórios" }, { status: 400 });
  }

  const store = await mutateCmsStore((s) => {
    s.items.unshift({
      id: newId("item"),
      title: body.title!.trim(),
      categoryId: body.categoryId!,
      artistId: body.artistId,
      image: body.image!,
      video: body.video,
      hours: body.hours,
      bodyPart: body.bodyPart,
    });
    return s;
  });

  return NextResponse.json(store);
}

export async function PUT(req: Request) {
  const body = (await req.json()) as CmsWorkItem;
  if (!body.id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });

  const store = await mutateCmsStore((s) => {
    const i = s.items.findIndex((x) => x.id === body.id);
    if (i < 0) throw new Error("NOT_FOUND");
    s.items[i] = { ...s.items[i], ...body };
    return s;
  });

  return NextResponse.json(store);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });

  const store = await mutateCmsStore((s) => {
    const item = s.items.find((x) => x.id === id);
    if (item?.image) void removeMedia(item.image);
    if (item?.video) void removeMedia(item.video);
    s.items = s.items.filter((x) => x.id !== id);
    return s;
  });

  return NextResponse.json(store);
}
