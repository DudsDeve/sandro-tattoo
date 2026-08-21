import { generateText } from "ai";
import { hasLlmKey, llmModel } from "@/lib/ai/llm";
import { buildCoverPrompt } from "@/lib/blog-ai/cover-prompt-builder";
import { researchTattooTrends, type ResearchHit } from "@/lib/cms/research";
import { uploadMedia } from "@/lib/cms/store";
import { STUDIO } from "@/lib/data/studio";
import type { CmsPost } from "@/lib/cms/types";

export type GeneratedBlogDraft = {
  title: string;
  seoTitle: string;
  seoDescription: string;
  slug: string;
  excerpt: string;
  category: CmsPost["category"];
  readTime: string;
  content: string;
  cover: string;
  keywords: string[];
  sources: string[];
  research: ResearchHit[];
};

const TOPIC_FALLBACK = (year: number) => [
  `tendências de tatuagem ${year} que estão bombando agora`,
  `aftercare e cicatrização: o que mudou em ${year}`,
  `fine line e micro-realismo: por que dominam as feeds`,
  `blackwork ornamental contemporâneo`,
  `realismo black & grey vs cor: o que escolher hoje`,
  `tatuagem minimalista com significado pessoal`,
  `irezumi e oriental moderno em estúdios ocidentais`,
  `primeira tattoo em ${year}: checklist honesto`,
  `pigmentos, cura e duração das cores na pele`,
  `cover-up inteligente: revitalizar peça antiga`,
  `flash day vs peça exclusiva: quando cada um faz sentido`,
  `dotwork e geometria sagrada em alta`,
  `tatuagem em áreas delicadas: costela, mão e pescoço`,
  `estilo lettering e script fino sem envelhecer mal`,
  `higiene, biossegurança e o que exigir do estúdio`,
  `tendências de placement: antebraço, panturrilha e sleeve`,
  `neo-tradicional e cores saturadas em ${year}`,
  `tatuagem discreta para o dia a dia corporativo`,
  `tattoo festivals and conventions in Dublin ${year}`,
  `tattoo events Ireland ${year}`,
  `European tattoo conventions worth watching ${year}`,
];

function shufflePick<T>(items: T[], count: number, seed?: string): T[] {
  const pool = [...items];
  let h = (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
  if (seed) {
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const out: T[] = [];
  for (let n = 0; n < count && pool.length; n++) {
    h = (h * 1664525 + 1013904223) >>> 0;
    const extra =
      typeof globalThis.crypto?.getRandomValues === "function"
        ? globalThis.crypto.getRandomValues(new Uint32Array(1))[0]!
        : Math.floor(Math.random() * 0xffffffff);
    const idx = (h ^ extra) % pool.length;
    out.push(pool.splice(idx, 1)[0]!);
  }
  return out;
}

function angleFromHeadline(title: string, year: number): string | null {
  const t = title.replace(/\s+/g, " ").trim();
  if (t.length < 18) return null;
  const lower = t.toLowerCase();
  const tattooRelated =
    /tatto|tatuag|ink\b|aftercare|blackwork|fine.?line|realismo|piercing|estúdio|studio|agulha|cicatriz|cover.?up|flash|sleeve/i.test(
      lower,
    );
  if (!tattooRelated) return null;
  // Evita títulos genéricos demais / clickbait vazio
  if (/^\d+\s*noticias/i.test(t)) return null;
  return t.length > 90 ? `${t.slice(0, 87)}… (${year})` : t;
}

/**
 * Sorteia 2 ângulos atuais e sempre ligados a tatuagem,
 * priorizando manchetes recentes da pesquisa online.
 */
export async function pickFreshTattooTopics(count = 2, seed?: string): Promise<string[]> {
  const year = new Date().getFullYear();
  const month = new Intl.DateTimeFormat("pt-BR", { month: "long", timeZone: "America/Sao_Paulo" }).format(
    new Date(),
  );

  const researchResult = await researchTattooTrends(`tatuagem tendências ${year} ${month}`);
  const hits = researchResult.hits;
  const fromNews = hits
    .map((h) => angleFromHeadline(h.title, year))
    .filter((x): x is string => Boolean(x));

  // Dedup aproximado por palavras-chave
  const uniqueNews: string[] = [];
  const seen = new Set<string>();
  for (const angle of fromNews) {
    const key = angle
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
      .split(/\s+/)
      .slice(0, 6)
      .join(" ");
    if (seen.has(key)) continue;
    seen.add(key);
    uniqueNews.push(angle);
  }

  const picked = shufflePick(uniqueNews, count, seed);
  if (picked.length >= count) return picked.slice(0, count);

  const need = count - picked.length;
  const fallback = shufflePick(TOPIC_FALLBACK(year), need + 4, `${seed || ""}-${month}`);
  for (const f of fallback) {
    if (picked.length >= count) break;
    if (!picked.includes(f)) picked.push(f);
  }

  // Se ainda faltou (improvável), completa com variações do mês
  while (picked.length < count) {
    picked.push(`o que está em alta em tatuagem em ${month} de ${year} #${picked.length + 1}`);
  }
  return picked.slice(0, count);
}

/** @deprecated use pickFreshTattooTopics */
export function pickDailyTopics(seed: string, count = 2): string[] {
  return shufflePick(TOPIC_FALLBACK(new Date().getFullYear()), count, seed);
}

/** @deprecated Prefer buildCoverPrompt(subject). Kept for shared image helper. */
export const BLOG_COVER_PROMPT = buildCoverPrompt(
  "a modern tattoo studio still-life with tattoo machine, ink bottles and sterile tools arranged as a premium isometric scene",
);

async function persistRemoteImage(url: string, filename: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Não foi possível baixar a imagem gerada.");
  const type = res.headers.get("content-type") || "image/png";
  const bytes = await res.arrayBuffer();
  const file = new File([bytes], filename, { type });
  return uploadMedia(file);
}

async function persistBase64Image(b64: string, filename: string) {
  const bytes = Buffer.from(b64, "base64");
  const file = new File([bytes], filename, { type: "image/png" });
  return uploadMedia(file);
}

/** Sempre gera capa com IA e persiste no Blob/uploads. */
export async function generateCoverImage(prompt: string, slugHint = "cover"): Promise<string> {
  const safePrompt = prompt.slice(0, 3800);
  const filename = `blog-${slugHint.slice(0, 40)}-${Date.now()}.png`;
  const errors: string[] = [];

  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    const preferred = process.env.OPENAI_IMAGE_MODEL?.trim();
    const models = [
      preferred,
      "gpt-image-1",
      "dall-e-3",
      "dall-e-2",
    ].filter((m, i, arr): m is string => Boolean(m) && arr.indexOf(m) === i);

    for (const model of models) {
      const body: Record<string, unknown> = {
        model,
        prompt: safePrompt,
        n: 1,
      };

      if (model === "dall-e-2") {
        body.size = "1024x1024";
      } else if (model === "dall-e-3") {
        body.size = "1792x1024";
        body.quality = "standard";
      } else {
        // gpt-image-1 e similares — paisagem média/alta
        body.size = "1536x1024";
        body.quality = "high";
      }

      try {
        const created = await fetch("https://api.openai.com/v1/images/generations", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openaiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
        const json = (await created.json()) as {
          data?: Array<{ url?: string; b64_json?: string }>;
          error?: { message?: string };
        };

        if (json.data?.[0]?.url) {
          return persistRemoteImage(json.data[0].url, filename);
        }
        if (json.data?.[0]?.b64_json) {
          return persistBase64Image(json.data[0].b64_json, filename);
        }
        errors.push(`${model}: ${json.error?.message || `HTTP ${created.status}`}`);
      } catch (e) {
        errors.push(`${model}: ${e instanceof Error ? e.message : "erro de rede"}`);
      }
    }
  }

  const replicate = process.env.REPLICATE_API_TOKEN;
  if (replicate) {
    try {
      const created = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${replicate}`,
          "Content-Type": "application/json",
          Prefer: "wait",
        },
        body: JSON.stringify({
          version: "black-forest-labs/flux-schnell",
          input: { prompt: safePrompt, aspect_ratio: "16:9" },
        }),
      });
      const json = (await created.json()) as { output?: string | string[]; error?: string };
      const url = Array.isArray(json.output) ? json.output[0] : json.output;
      if (url) return persistRemoteImage(url, filename);
      errors.push(`replicate: ${json.error || "sem output"}`);
    } catch (e) {
      errors.push(`replicate: ${e instanceof Error ? e.message : "erro de rede"}`);
    }
  }

  if (!openaiKey && !replicate) {
    throw new Error(
      "Para gerar capa com IA, configure OPENAI_API_KEY ou REPLICATE_API_TOKEN.",
    );
  }

  throw new Error(
    `Falha ao gerar capa: ${errors.slice(0, 3).join(" | ") || "nenhum modelo disponível"}. Opcional: defina OPENAI_IMAGE_MODEL=dall-e-2`,
  );
}

export async function generateBlogPost(options?: {
  topic?: string;
  tone?: string;
}): Promise<GeneratedBlogDraft> {
  if (!hasLlmKey()) {
    throw new Error("Configure OPENAI_API_KEY (ou Anthropic) para gerar posts com IA.");
  }

  const researchResult = await researchTattooTrends(options?.topic);
  const research = researchResult.hits;
  if (!research.length) {
    throw new Error("Não foi possível pesquisar tendências agora.");
  }

  const researchBlock = research
    .map((h, i) => `${i + 1}. ${h.title}\n   Fonte: ${h.source}\n   Região: ${h.region || "geral"}\n   URL: ${h.url}\n   Resumo: ${h.snippet}`)
    .join("\n\n");

  const year = new Date().getFullYear();
  const eventGeoRule =
    researchResult.isEventTopic && researchResult.eventScope
      ? `
REGRA GEOGRÁFICA (OBRIGATÓRIA — este post é sobre EVENTOS):
- Escopo encontrado na pesquisa: ${researchResult.eventScope === "dublin" ? "Dublin, Irlanda" : researchResult.eventScope === "ireland" ? "Irlanda" : "Europa"}.
- Só cite eventos/festivais/convenções dessa região (ou mais específica dentro dela).
- NÃO invente nem traga eventos do Brasil, América Latina ou outros continentes.
- Se a pesquisa for sobre Dublin, foque Dublin; se Irlanda, Irlanda; se Europa, Europa.
- Deixe claro a cidade/país de cada evento mencionado.
`
      : researchResult.isEventTopic
        ? `
REGRA GEOGRÁFICA (EVENTOS): priorize Dublin → Irlanda → Europa. Não invente festivais brasileiros.
`
        : "";

  const { text } = await generateText({
    model: llmModel(),
    temperature: 0.7,
    prompt: `Você é editor SEO sênior de um estúdio de tatuagem premium (${STUDIO.name}, ${STUDIO.address.city}, Ireland).

DATA DE HOJE: ${new Date().toISOString().slice(0, 10)}
FOCO: conteúdo ATUAL sobre tatuagem (${year}), baseado nas pesquisas abaixo — não invente notícias; sintetize o que é tendência agora.
${eventGeoRule}
PESQUISA ONLINE RECENTE:
${researchBlock}

TEMA SUGERIDO (opcional): ${options?.topic || "(escolha o ângulo mais atual e útil)"}
TOM: ${options?.tone || "autoridade acolhedora, direto, sem clickbait barato"}

Gere UM artigo completo em português do Brasil, otimizado para Google.
Responda APENAS com JSON válido (sem markdown) no formato:
{
  "title": "título H1 com palavra-chave principal (máx 65 caracteres se possível)",
  "seoTitle": "title tag SEO (máx 60 caracteres)",
  "seoDescription": "meta description persuasiva (140-155 caracteres)",
  "slug": "slug-url-curto",
  "excerpt": "resumo curto para listagem (1-2 frases)",
  "category": "tendencias" | "cuidados" | "estilo" | "bastidores",
  "readTime": "X min",
  "content": "corpo do post em plain text com parágrafos separados por \\n\\n. Inclua subtítulos em linhas próprias começando com ## . Mínimo 700 palavras. Inclua FAQ curto no final com 3 perguntas.",
  "keywords": ["kw1","kw2","kw3","kw4","kw5"]
}`,
  });

  let parsed: {
    title?: string;
    seoTitle?: string;
    seoDescription?: string;
    slug?: string;
    excerpt?: string;
    category?: CmsPost["category"];
    readTime?: string;
    content?: string;
    keywords?: string[];
  };

  try {
    const clean = text.replace(/^```json\s*|\s*```$/g, "").trim();
    parsed = JSON.parse(clean);
  } catch {
    throw new Error("A IA retornou um formato inválido.");
  }

  if (!parsed.title?.trim() || !parsed.content?.trim()) {
    throw new Error("A IA não gerou título/conteúdo suficientes.");
  }

  const slug =
    parsed.slug?.trim() ||
    parsed.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 80);

  // Capa sempre com o prompt fixo (estética clara / espaço à esquerda para título).
  const cover = await generateCoverImage(BLOG_COVER_PROMPT, slug);

  return {
    title: parsed.title.trim(),
    seoTitle: (parsed.seoTitle || parsed.title).trim(),
    seoDescription: (parsed.seoDescription || parsed.excerpt || "").trim(),
    slug,
    excerpt: (parsed.excerpt || parsed.seoDescription || "").trim(),
    category: parsed.category || "tendencias",
    readTime: parsed.readTime || "6 min",
    content: parsed.content.trim(),
    cover,
    keywords: parsed.keywords || [],
    sources: research.map((r) => r.url),
    research,
  };
}
