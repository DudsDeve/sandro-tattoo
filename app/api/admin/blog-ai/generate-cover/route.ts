import { NextResponse } from "next/server";
import { runBlogCover } from "@/lib/blog-ai/pipeline";

export const runtime = "nodejs";
export const maxDuration = 180;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { imageSubject?: string; slug?: string };
    if (!body.imageSubject?.trim()) {
      return NextResponse.json({ error: "imageSubject required" }, { status: 400 });
    }
    const imageUrl = await runBlogCover(body.imageSubject, body.slug || "cover");
    return NextResponse.json({ imageUrl });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Cover generation failed" },
      { status: 502 },
    );
  }
}
