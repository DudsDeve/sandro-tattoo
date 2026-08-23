import { NextResponse } from "next/server";
import { mutateCmsStore, newId, removeMedia } from "@/lib/cms/store";
import type { CmsWishlistItem } from "@/lib/cms/types";

function clampDiscount(value: unknown) {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 10;
  return Math.min(90, Math.max(1, Math.round(n)));
}

function parseBody(body: Partial<CmsWishlistItem>): Omit<CmsWishlistItem, "id" | "order"> {
  return {
    title: body.title?.trim() || "",
    image: body.image?.trim() || "",
    discountPercent: clampDiscount(body.discountPercent),
    note: body.note?.trim() || "",
    visible: body.visible !== false,
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<CmsWishlistItem>;
    const fields = parseBody(body);
    if (!fields.title || !fields.image) {
      return NextResponse.json({ error: "Título e imagem são obrigatórios" }, { status: 400 });
    }
    const store = await mutateCmsStore((s) => {
      const wishlistItems = Array.isArray(s.wishlistItems) ? s.wishlistItems : [];
      wishlistItems.push({
        id: newId("wish"),
        ...fields,
        order: body.order ?? wishlistItems.length,
      });
      return { ...s, wishlistItems };
    });
    return NextResponse.json(store);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Erro ao salvar" }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = (await req.json()) as CmsWishlistItem;
    if (!body.id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });
    const fields = parseBody(body);
    if (!fields.title || !fields.image) {
      return NextResponse.json({ error: "Título e imagem são obrigatórios" }, { status: 400 });
    }
    const store = await mutateCmsStore((s) => {
      const list = Array.isArray(s.wishlistItems) ? s.wishlistItems : [];
      const i = list.findIndex((t) => t.id === body.id);
      if (i < 0) throw new Error("Não encontrado");
      list[i] = {
        ...list[i],
        ...fields,
        id: body.id,
        order: body.order ?? list[i].order,
      };
      return { ...s, wishlistItems: list };
    });
    return NextResponse.json(store);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Erro ao atualizar" }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });
  const store = await mutateCmsStore((s) => {
    const item = (s.wishlistItems || []).find((t) => t.id === id);
    if (item?.image) void removeMedia(item.image);
    return { ...s, wishlistItems: (s.wishlistItems || []).filter((t) => t.id !== id) };
  });
  return NextResponse.json(store);
}
