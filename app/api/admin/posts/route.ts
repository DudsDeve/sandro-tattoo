import { NextResponse } from "next/server";
import { mutateCmsStore, newId, removeMedia } from "@/lib/cms/store";
import type { CmsPost } from "@/lib/cms/types";

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<CmsPost>;
  if (!body.title?.trim() || !body.content?.trim()) {
    return NextResponse.json({ error: "Título e conteúdo são obrigatórios" }, { status: 400 });
  }

  const slug =
    body.slug?.trim() ||
    body.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 80);

  const store = await mutateCmsStore((s) => {
    s.posts.unshift({
      id: newId("post"),
      slug,
      title: body.title!.trim(),
      excerpt: body.excerpt?.trim() || body.seoDescription?.trim() || "",
      category: body.category || "tendencias",
      date: body.date || new Date().toISOString().slice(0, 10),
      readTime: body.readTime || "5 min",
      cover: body.cover || "",
      content: body.content!,
      seoTitle: body.seoTitle || body.title,
      seoDescription: body.seoDescription || body.excerpt || "",
      published: body.published ?? true,
      sources: body.sources || [],
    });
    return s;
  });

  return NextResponse.json(store);
}

export async function PUT(req: Request) {
  const body = (await req.json()) as CmsPost;
  if (!body.id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });

  const store = await mutateCmsStore((s) => {
    const i = s.posts.findIndex((p) => p.id === body.id);
    if (i < 0) throw new Error("NOT_FOUND");
    s.posts[i] = { ...s.posts[i], ...body };
    return s;
  });

  return NextResponse.json(store);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });

  const store = await mutateCmsStore((s) => {
    const post = s.posts.find((p) => p.id === id);
    if (post?.cover) void removeMedia(post.cover);
    s.posts = s.posts.filter((p) => p.id !== id);
    return s;
  });

  return NextResponse.json(store);
}
