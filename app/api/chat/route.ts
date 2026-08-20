import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { CONCEPT_SYSTEM } from "@/lib/ai/prompts";
import { hasLlmKey, llmModel } from "@/lib/ai/llm";
import { mockUiStream } from "@/lib/ai/mock-stream";
import { artists } from "@/lib/data/content";

export const runtime = "edge";
export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  const last = messages.at(-1);
  const lastText =
    last?.parts
      ?.filter((p) => p.type === "text")
      .map((p) => ("text" in p ? p.text : ""))
      .join("") ?? "";

  if (!hasLlmKey()) {
    const artist = artists[0];
    const text = lastText.length < 40
      ? "Curti o começo. Você imagina isso mais geométrico e limpo, ou orgânico com textura — tipo pele, escama, folha?"
      : `Conceito: composição em ${lastText.slice(0, 80)}. Centro visual claro, hierarquia de pretos, respiro para a anatomia. Paleta black & grey com um acento se fizer sentido.\n\nArtista sugerido: ${artist.name} (${artist.specialty}).\n\n[GENERATE_IMAGE: blackwork tattoo design of ${lastText}, high contrast ink drawing on white paper, no skin, studio flash sheet style]`;
    return mockUiStream(text);
  }

  const result = streamText({
    model: llmModel(),
    system: CONCEPT_SYSTEM,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
