import { NextResponse } from "next/server";
import { runFullBlogPipeline } from "@/lib/blog-ai/pipeline";

export const runtime = "nodejs";
export const maxDuration = 300;

/** Compat: one-shot generate (research + write + cover) as draft payload. */
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { topic?: string };
    const result = await runFullBlogPipeline({
      manualTopic: body.topic,
      published: false,
    });
    return NextResponse.json({
      draft: {
        title: result.post.title,
        seoTitle: result.post.seoTitle,
        seoDescription: result.post.excerpt,
        slug: result.post.slug,
        excerpt: result.post.excerpt,
        category: result.saved.category,
        readTime: result.post.readingTime,
        content: result.post.body,
        cover: result.cover,
        keywords: result.post.tags,
        sources: result.research.sources.map((s) => s.url),
        research: result.research.sources,
        published: false,
      },
      saved: result.saved,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Falha na geração";
    const status = /Configure|OPENAI|ANTHROPIC|REPLICATE/i.test(message) ? 400 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
