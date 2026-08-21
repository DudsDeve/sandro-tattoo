import { NextResponse } from "next/server";
import { mutateCmsStore, newId, removeMedia } from "@/lib/cms/store";
import type { CmsArtist, CmsArtistWork } from "@/lib/cms/types";
import { normalizeInstagramHandle } from "@/lib/utils";

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<CmsArtist>;
  if (!body.name?.trim() || !body.image) {
    return NextResponse.json({ error: "Nome e foto são obrigatórios" }, { status: 400 });
  }

  const slug =
    body.slug?.trim() ||
    body.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const store = await mutateCmsStore((s) => {
    s.artists.push({
      id: newId("art"),
      slug,
      name: body.name!.trim(),
      role: body.role?.trim() || "Artista",
      specialty: body.specialty?.trim() || "",
      specialtyIds: body.specialtyIds || [],
      years: body.years ?? 1,
      bio: body.bio?.trim() || "",
      bioLong: body.bioLong?.trim() || body.bio?.trim() || "",
      instagram: normalizeInstagramHandle(body.instagram || ""),
      image: body.image!,
      available: body.available ?? true,
      works: body.works || [],
    });
    return s;
  });

  return NextResponse.json(store);
}

export async function PUT(req: Request) {
  const body = (await req.json()) as CmsArtist & { addWork?: CmsArtistWork; removeWorkId?: string };
  if (!body.id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });

  const store = await mutateCmsStore((s) => {
    const i = s.artists.findIndex((a) => a.id === body.id);
    if (i < 0) throw new Error("NOT_FOUND");
    const current = s.artists[i];
    let works = Array.isArray(body.works) ? body.works : current.works;

    if (body.addWork?.image) {
      works = [
        {
          id: newId("aw"),
          title: body.addWork.title || "Trabalho",
          image: body.addWork.image,
          video: body.addWork.video,
        },
        ...works,
      ];
    }

    if (body.removeWorkId) {
      const removed = works.find((w) => w.id === body.removeWorkId);
      if (removed?.image) void removeMedia(removed.image);
      works = works.filter((w) => w.id !== body.removeWorkId);
    }

    const rest = { ...body };
    delete rest.addWork;
    delete rest.removeWorkId;
    const next = {
      ...current,
      ...Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined)),
      id: current.id,
      works,
    } as CmsArtist;

    if (typeof rest.instagram === "string") {
      next.instagram = normalizeInstagramHandle(rest.instagram);
    }

    s.artists[i] = next;
    return s;
  });

  return NextResponse.json(store);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });

  const store = await mutateCmsStore((s) => {
    const artist = s.artists.find((a) => a.id === id);
    if (artist?.image) void removeMedia(artist.image);
    artist?.works.forEach((w) => {
      if (w.image) void removeMedia(w.image);
    });
    s.artists = s.artists.filter((a) => a.id !== id);
    s.items = s.items.map((item) =>
      item.artistId === id ? { ...item, artistId: undefined } : item,
    );
    return s;
  });

  return NextResponse.json(store);
}
