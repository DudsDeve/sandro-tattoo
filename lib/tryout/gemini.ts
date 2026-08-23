import { stripDataUrl } from "@/lib/tryout/image-utils";
import { getGeminiApiKey } from "@/lib/tryout/keys";
import { buildTattooPrompt, type GenerateInput } from "@/lib/tryout/prompt-builder";

type GeminiPart = {
  text?: string;
  inlineData?: { mimeType?: string; data?: string };
  inline_data?: { mime_type?: string; data?: string };
};

async function geminiKey() {
  const key = await getGeminiApiKey();
  if (!key) throw new Error("Configure GEMINI_API_KEY em Admin → Configurações.");
  return key;
}

function inlineB64(part: GeminiPart) {
  return part.inlineData?.data || part.inline_data?.data;
}

function inlineMime(part: GeminiPart) {
  return part.inlineData?.mimeType || part.inline_data?.mime_type || "image/png";
}

export async function generateWithGeminiImage(model: string, input: GenerateInput): Promise<string> {
  const key = await geminiKey();
  const original = input.originalBodyImage || input.bodyImage;
  const coverage = input.bodyImage;
  const prompt = `${buildTattooPrompt(input)}

Image A = original client photo (keep this identity).
Image B = mask of the selected area — fill ALL of it.
Image C = tattoo artwork.
Image D = coverage guide (artwork already covering the selection). Match that coverage, then blend into skin.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": key,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: "image/png",
                  data: stripDataUrl(original),
                },
              },
              {
                inlineData: {
                  mimeType: "image/png",
                  data: stripDataUrl(input.maskImage),
                },
              },
              {
                inlineData: {
                  mimeType: "image/png",
                  data: stripDataUrl(input.designImage),
                },
              },
              {
                inlineData: {
                  mimeType: "image/png",
                  data: stripDataUrl(coverage),
                },
              },
            ],
          },
        ],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
        },
      }),
    },
  );

  const json = (await res.json()) as {
    error?: { message?: string };
    candidates?: Array<{ content?: { parts?: GeminiPart[] } }>;
  };

  if (!res.ok) {
    throw new Error(json.error?.message || `Gemini falhou (HTTP ${res.status})`);
  }

  const parts = json.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    const data = inlineB64(part);
    if (data) return `data:${inlineMime(part)};base64,${data}`;
  }
  throw new Error(json.error?.message || "Gemini não devolveu imagem. Confira a chave e o modelo.");
}

export async function generateWithImagen(input: GenerateInput): Promise<string> {
  const key = await geminiKey();
  const prompt = buildTattooPrompt(input);
  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": key,
      },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: { sampleCount: 1 },
      }),
    },
  );
  const json = (await res.json()) as {
    error?: { message?: string };
    predictions?: Array<{ bytesBase64Encoded?: string; mimeType?: string }>;
  };
  if (!res.ok) {
    throw new Error(json.error?.message || `Imagen falhou (HTTP ${res.status})`);
  }
  const b64 = json.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) throw new Error("Imagen não devolveu imagem.");
  return `data:${json.predictions?.[0]?.mimeType || "image/png"};base64,${b64}`;
}
