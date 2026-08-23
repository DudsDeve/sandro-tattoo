import { NextResponse } from "next/server";
import { mutateCmsStore, newId, removeMedia } from "@/lib/cms/store";
import type { CmsTestimonial } from "@/lib/cms/types";
import { youtubeVideoId } from "@/lib/utils";

function parseBody(body: Partial<CmsTestimonial>): Omit<CmsTestimonial, "id" | "order"> {
  const youtubeUrl = body.youtubeUrl?.trim() || "";
  if (youtubeUrl && !youtubeVideoId(youtubeUrl)) {
    throw new Error("Link do YouTube inválido");
  }
  return {
    title: body.title?.trim() || "",
    description: body.description?.trim() || "",
    name: body.name?.trim() || "",
    artistId: body.artistId?.trim() || "",
    image: body.image?.trim() || "",
    video: body.video?.trim() || "",
    youtubeUrl,
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<CmsTestimonial>;
    if (!body.title?.trim() || !body.name?.trim() || !body.description?.trim() || !body.artistId?.trim()) {
      return NextResponse.json({ error: "Título, nome, descrição e artista são obrigatórios" }, { status: 400 });
    }
    const fields = parseBody(body);
    const store = await mutateCmsStore((s) => {
      if (!s.artists.some((a) => a.id === fields.artistId)) {
        throw new Error("Artista não encontrado");
      }
      const testimonials = Array.isArray(s.testimonials) ? s.testimonials : [];
      testimonials.push({
        id: newId("dep"),
        ...fields,
        order: body.order ?? testimonials.length,
      });
      return { ...s, testimonials };
    });
    return NextResponse.json(store);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Erro ao salvar" }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = (await req.json()) as CmsTestimonial;
    if (!body.id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });
    const fields = parseBody(body);
    if (!fields.artistId) {
      return NextResponse.json({ error: "Artista é obrigatório" }, { status: 400 });
    }
    const store = await mutateCmsStore((s) => {
      if (!s.artists.some((a) => a.id === fields.artistId)) {
        throw new Error("Artista não encontrado");
      }
      const i = s.testimonials.findIndex((t) => t.id === body.id);
      if (i < 0) throw new Error("Não encontrado");
      s.testimonials[i] = {
        ...s.testimonials[i],
        ...fields,
        id: body.id,
        order: body.order ?? s.testimonials[i].order,
      };
      return s;
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
    const item = s.testimonials.find((t) => t.id === id);
    if (item?.image) void removeMedia(item.image);
    if (item?.video) void removeMedia(item.video);
    s.testimonials = s.testimonials.filter((t) => t.id !== id);
    return s;
  });
  return NextResponse.json(store);
}
