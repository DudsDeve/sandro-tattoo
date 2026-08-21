import { NextResponse } from "next/server";
import { runBlogResearch } from "@/lib/blog-ai/pipeline";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { manualTopic?: string; topic?: string };
    const research = await runBlogResearch(body.manualTopic || body.topic);
    return NextResponse.json({ research });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Research failed" },
      { status: 502 },
    );
  }
}
