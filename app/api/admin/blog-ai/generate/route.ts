import { NextResponse } from "next/server";
import { runBlogWrite, type BlogResearchPayload } from "@/lib/blog-ai/pipeline";

export const runtime = "nodejs";
export const maxDuration = 180;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { research?: BlogResearchPayload };
    if (!body.research) {
      return NextResponse.json({ error: "research payload required" }, { status: 400 });
    }
    const post = await runBlogWrite(body.research);
    return NextResponse.json({ post });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Generate failed" },
      { status: 502 },
    );
  }
}
