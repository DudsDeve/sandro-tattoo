import { generateText } from "ai";
import { NextResponse } from "next/server";
import { QUIZ_EXPLAIN_SYSTEM, languageRule } from "@/lib/ai/prompts";
import { hasLlmKey, llmModel } from "@/lib/ai/llm";

export async function POST(req: Request) {
  const { styles, artist, percent, locale } = (await req.json()) as {
    styles?: string[];
    artist?: string;
    percent?: number;
    locale?: string;
  };

  if (!hasLlmKey()) {
    const list = (styles ?? []).join(", ");
    return NextResponse.json({
      explanation:
        locale === "pt"
          ? `Baseado nas suas escolhas, o olhar puxa para ${list}. ${artist} encaixa com ${percent}% — especialidade e escala combinam com o que você escolheu.`
          : `Based on your choices, your eye pulls toward ${list}. ${artist} fits at ${percent}% — specialty and scale align with what you picked.`,
    });
  }

  const { text } = await generateText({
    model: llmModel(),
    system: `${QUIZ_EXPLAIN_SYSTEM} ${languageRule(locale)}`,
    prompt:
      locale === "pt"
        ? `Estilos: ${(styles ?? []).join(", ")}. Artista: ${artist}. Match: ${percent}%. Escreva a explicação.`
        : `Styles: ${(styles ?? []).join(", ")}. Artist: ${artist}. Match: ${percent}%. Write the explanation.`,
  });

  return NextResponse.json({ explanation: text });
}
