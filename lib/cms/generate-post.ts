import { buildCoverPrompt } from "@/lib/blog-ai/cover-prompt-builder";
import { selectTopic } from "@/lib/cms/topic-engine";
import { persistGeneratedImage, persistMediaBytes } from "@/lib/media/storage";

/**
 * Next unused SEO pillars (client keywords), never the same keyword twice in one batch.
 */
export async function pickFreshTattooTopics(count = 2, _seed?: string): Promise<string[]> {
  const topics: string[] = [];
  const excludeIds: string[] = [];
  for (let i = 0; i < count; i++) {
    const selection = await selectTopic(undefined, excludeIds);
    topics.push(selection.pillar.primaryKeyword);
    excludeIds.push(selection.pillar.id);
  }
  return topics;
}

/** @deprecated use pickFreshTattooTopics */
export function pickDailyTopics(_seed: string, count = 2): string[] {
  return Array.from({ length: count }, (_, i) => `tattoo ideas ${new Date().getFullYear()} ${i + 1}`);
}

/** @deprecated Prefer buildCoverPrompt(subject). Kept for shared image helper. */
export const BLOG_COVER_PROMPT = buildCoverPrompt(
  "a modern tattoo studio still-life with tattoo machine, ink bottles and sterile tools arranged as a premium isometric scene",
);

async function persistRemoteImage(url: string, filename: string) {
  return persistGeneratedImage(url, "blog", filename);
}

async function persistBase64Image(b64: string, filename: string) {
  return persistMediaBytes(Buffer.from(b64, "base64"), filename, "image/png", "blog");
}

/** Sempre gera capa com IA e grava no bucket; o post só armazena a URL. */
export async function generateCoverImage(prompt: string, slugHint = "cover"): Promise<string> {
  const safePrompt = prompt.slice(0, 3800);
  const filename = `blog-${slugHint.slice(0, 40)}-${Date.now()}.png`;
  const errors: string[] = [];

  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    const preferred = process.env.OPENAI_IMAGE_MODEL?.trim();
    const models = [preferred, "gpt-image-1", "dall-e-3", "dall-e-2"].filter(
      (m, i, arr): m is string => Boolean(m) && arr.indexOf(m) === i,
    );

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
    throw new Error("Para gerar capa com IA, configure OPENAI_API_KEY ou REPLICATE_API_TOKEN.");
  }

  throw new Error(
    `Falha ao gerar capa: ${errors.slice(0, 3).join(" | ") || "nenhum modelo disponível"}. Opcional: defina OPENAI_IMAGE_MODEL=dall-e-2`,
  );
}
