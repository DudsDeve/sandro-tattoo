import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { ASSISTANT_SYSTEM, languageRule } from "@/lib/ai/prompts";
import { retrieveRelevant } from "@/lib/ai/knowledge-base";
import { hasLlmKey, llmModel } from "@/lib/ai/llm";
import { mockUiStream } from "@/lib/ai/mock-stream";
import { STUDIO } from "@/lib/data/studio";

export const runtime = "edge";
export const maxDuration = 60;

function localAnswer(q: string, locale?: string) {
  const s = q.toLowerCase();
  const pt = locale === "pt";
  if (/pre[cç]o|custa|valor|price|cost/.test(s))
    return pt
      ? `Valores fecham na consulta. Mínimo de sessão: ${STUDIO.minPrice}. Complexidade, tamanho e artista mudam o número. Quer agendar? /agendar`
      : `Prices are set in consultation. Session minimum: ${STUDIO.minPrice}. Complexity, size and artist change the number. Want to book? /agendar`;
  if (/hora|funciona|abre|hours|open/.test(s))
    return STUDIO.hours.map((h) => `${h.days}: ${h.time}`).join(" · ");
  if (/agenda|marca|book/.test(s))
    return pt
      ? `Pelo site em /agendar, ou WhatsApp ${STUDIO.phone}. Depósito ${STUDIO.deposit}`
      : `Via the site at /agendar, or WhatsApp ${STUDIO.phone}. Deposit ${STUDIO.deposit}`;
  if (/walk/.test(s)) return STUDIO.walkIn;
  if (/cuidad|cicatriz|aftercare|heal/.test(s))
    return pt
      ? "24h de filme, depois lava, seca com toque, pomada fina. Sem sol, piscina ou academia até a gente liberar."
      : "Film for 24h, then wash, pat dry, thin ointment. No sun, pool or gym until we clear you.";
  if (/endere[cç]o|fica|onde|where|address/.test(s)) return STUDIO.address.full;
  return pt
    ? `Posso falar de horários, preços, cuidados, artistas e agendamento. Se for muito específico, o WhatsApp é ${STUDIO.phone}.`
    : `I can help with hours, pricing, aftercare, artists and booking. For something very specific, WhatsApp is ${STUDIO.phone}.`;
}

export async function POST(req: Request) {
  const { messages, locale }: { messages: UIMessage[]; locale?: string } = await req.json();
  const last = messages.at(-1);
  const query =
    last?.parts
      ?.filter((p) => p.type === "text")
      .map((p) => ("text" in p ? p.text : ""))
      .join("") ?? "";

  if (!hasLlmKey()) {
    return mockUiStream(localAnswer(query, locale));
  }

  const result = streamText({
    model: llmModel(),
    system: `${ASSISTANT_SYSTEM}\n\n${languageRule(locale)}\n\nCONTEXT:\n${retrieveRelevant(query)}`,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
