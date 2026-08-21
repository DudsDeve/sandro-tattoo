import { NextResponse } from "next/server";
import { publishBlogDraft, type BlogGeneratedPost } from "@/lib/blog-ai/pipeline";
import { getCmsStore } from "@/lib/cms/store";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      post?: BlogGeneratedPost;
      cover?: string;
      imageUrl?: string;
      sources?: string[];
      published?: boolean;
    };

    if (!body.post?.title || !body.post?.body) {
      return NextResponse.json({ error: "post title and body required" }, { status: 400 });
    }

    const cover = body.cover || body.imageUrl || "";
    if (!cover) {
      return NextResponse.json({ error: "Cover image is required before publish." }, { status: 400 });
    }

    const saved = await publishBlogDraft({
      post: body.post,
      cover,
      sources: body.sources || [],
      published: body.published ?? false,
    });

    const store = await getCmsStore();
    return NextResponse.json({ success: true, saved, store });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Publish failed" },
      { status: 502 },
    );
  }
}
