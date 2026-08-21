import { NextResponse } from "next/server";
import { BLOG_COVER_PROMPT, generateCoverImage } from "@/lib/cms/generate-post";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: Request) {
  // Aceita body opcional por compatibilidade; a capa do blog usa sempre o prompt fixo.
  await req.json().catch(() => ({}));

  try {
    const url = await generateCoverImage(BLOG_COVER_PROMPT, "concept");
    return NextResponse.json({ url });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Falha ao gerar imagem" },
      { status: 502 },
    );
  }
}
