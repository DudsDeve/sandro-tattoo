import { generateText } from "ai";
import { NextResponse } from "next/server";
import { QUIZ_EXPLAIN_SYSTEM } from "@/lib/ai/prompts";
import { hasLlmKey, llmModel } from "@/lib/ai/llm";

export async function POST(req: Request) {
  const { styles, artist, percent } = (await req.json()) as {
    styles?: string[];
    artist?: string;
    percent?: number;
  };

  if (!hasLlmKey()) {
    return NextResponse.json({
      explanation: `Baseado nas suas escolhas, o olhar puxa para ${(styles ?? []).join(", ")}. ${artist} encaixa com ${percent}% — especialidade e escala combinam com o que você escolheu.`,
    });
  }

  const { text } = await generateText({
    model: llmModel(),
    system: QUIZ_EXPLAIN_SYSTEM,
    prompt: `Estilos: ${(styles ?? []).join(", ")}. Artista: ${artist}. Match: ${percent}%. Escreva a explicação.`,
  });

  return NextResponse.json({ explanation: text });
}
