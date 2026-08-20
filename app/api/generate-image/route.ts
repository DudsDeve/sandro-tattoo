import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { prompt } = (await req.json()) as { prompt?: string };
  if (!prompt) return NextResponse.json({ error: "prompt ausente" }, { status: 400 });

  const tattooPrompt = `${prompt}. Tattoo flash sheet design, black ink drawing on white paper, high contrast, no photorealistic skin, no watermark.`;

  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    const created = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: tattooPrompt,
        size: "1024x1024",
        quality: "standard",
      }),
    });
    const json = (await created.json()) as { data?: Array<{ url: string }>; error?: { message?: string } };
    if (json.data?.[0]?.url) return NextResponse.json({ url: json.data[0].url });
    if (json.error?.message) {
      return NextResponse.json({ error: json.error.message }, { status: 502 });
    }
  }

  const replicate = process.env.REPLICATE_API_TOKEN;
  if (replicate) {
    const created = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${replicate}`,
        "Content-Type": "application/json",
        Prefer: "wait",
      },
      body: JSON.stringify({
        version: "black-forest-labs/flux-schnell",
        input: { prompt: tattooPrompt },
      }),
    });
    const json = (await created.json()) as { output?: string | string[] };
    const url = Array.isArray(json.output) ? json.output[0] : json.output;
    if (url) return NextResponse.json({ url });
  }

  return NextResponse.json({ error: "Nenhuma API de imagem configurada" }, { status: 501 });
}
