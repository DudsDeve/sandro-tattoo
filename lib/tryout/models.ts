export const AI_MODELS = [
  {
    id: "gemini-2.5-flash-image",
    name: "Gemini 2.5 Flash Image",
    description: "Nano Banana — vê a foto e o design e edita a área marcada",
    endpoint: "gemini",
    badge: "Recommended",
  },
  {
    id: "gemini-2.0-flash-preview-image-generation",
    name: "Gemini 2.0 Flash Image",
    description: "Geração nativa de imagem com contexto multimodal",
    endpoint: "gemini",
    badge: null,
  },
] as const;

export type ModelId = (typeof AI_MODELS)[number]["id"];

export const DEFAULT_TRYOUT_MODEL: ModelId = "gemini-2.5-flash-image";

export function isModelId(value: string): value is ModelId {
  return AI_MODELS.some((m) => m.id === value);
}
