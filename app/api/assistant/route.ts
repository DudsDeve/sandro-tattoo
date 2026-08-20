import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { ASSISTANT_SYSTEM } from "@/lib/ai/prompts";
import { retrieveRelevant } from "@/lib/ai/knowledge-base";
import { hasLlmKey, llmModel } from "@/lib/ai/llm";
import { mockUiStream } from "@/lib/ai/mock-stream";
import { STUDIO } from "@/lib/data/studio";

export const runtime = "edge";
export const maxDuration = 60;

function localAnswer(q: string) {
  const s = q.toLowerCase();
  if (/pre[cç]o|custa|valor/.test(s))
    return `Valores fecham na consulta. Mínimo de sessão: ${STUDIO.minPrice}. Complexidade, tamanho e artista mudam o número. Quer agendar? /agendar`;
  if (/hora|funciona|abre/.test(s))
    return STUDIO.hours.map((h) => `${h.days}: ${h.time}`).join(" · ");
  if (/agenda|marca/.test(s))
    return `Pelo site em /agendar, ou WhatsApp ${STUDIO.phone}. Depósito ${STUDIO.deposit}`;
  if (/walk/.test(s)) return STUDIO.walkIn;
  if (/cuidad|cicatriz/.test(s))
    return "24h de filme, depois lava, seca com toque, pomada fina. Sem sol, piscina ou academia até a gente liberar.";
  if (/endere[cç]o|fica|onde/.test(s)) return STUDIO.address.full;
  return `Posso falar de horários, preços, cuidados, artistas e agendamento. Se for muito específico, o WhatsApp é ${STUDIO.phone}.`;
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  const last = messages.at(-1);
  const query =
    last?.parts
      ?.filter((p) => p.type === "text")
      .map((p) => ("text" in p ? p.text : ""))
      .join("") ?? "";

  if (!hasLlmKey()) {
    return mockUiStream(localAnswer(query));
  }

  const result = streamText({
    model: llmModel(),
    system: `${ASSISTANT_SYSTEM}\n\nCONTEXTO:\n${retrieveRelevant(query)}`,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
