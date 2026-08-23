import { NextResponse } from "next/server";
import { mutateCmsStore, newId, removeMedia } from "@/lib/cms/store";
import type { CmsCategory } from "@/lib/cms/types";

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<CmsCategory>;
  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Nome obrigatório" }, { status: 400 });
  }

  const store = await mutateCmsStore((s) => {
    const name = body.name!.trim();
    const slug =
      body.slug?.trim() ||
      name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    s.categories.push({
      id: newId("cat"),
      slug,
      name,
      description: body.description?.trim() || "",
      image: body.image || "",
      video: body.video || undefined,
      order: body.order ?? s.categories.length,
    });
    return s;
  });

  return NextResponse.json(store);
}

export async function PUT(req: Request) {
  const body = (await req.json()) as CmsCategory;
  if (!body.id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });

  const store = await mutateCmsStore((s) => {
    const i = s.categories.findIndex((c) => c.id === body.id);
    if (i < 0) throw new Error("NOT_FOUND");
    const prev = s.categories[i];
    s.categories[i] = {
      ...prev,
      ...body,
      id: prev.id,
      slug: body.slug?.trim() || prev.slug,
      name: body.name?.trim() || prev.name,
      description: body.description ?? prev.description,
      image: body.image ?? prev.image,
      video: body.video ?? prev.video,
      order: body.order ?? prev.order,
    };
    return s;
  });

  return NextResponse.json(store);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });

  const store = await mutateCmsStore((s) => {
    const cat = s.categories.find((c) => c.id === id);
    if (cat?.image) void removeMedia(cat.image);
    if (cat?.video) void removeMedia(cat.video);
    s.categories = s.categories.filter((c) => c.id !== id);
    s.items = s.items.filter((item) => item.categoryId !== id);
    return s;
  });

  return NextResponse.json(store);
}
