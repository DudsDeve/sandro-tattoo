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
  {
    id: "imagen-4.0-generate-001",
    name: "Imagen 4",
    description: "Google Imagen — gera a partir da descrição (menos fiel à máscara)",
    endpoint: "imagen",
    badge: null,
  },
  {
    id: "gpt-image-1",
    name: "GPT Image 1",
    description: "Best quality and instruction following — edits the marked area",
    endpoint: "images",
    badge: null,
  },
  {
    id: "dall-e-3",
    name: "DALL·E 3",
    description: "Strong prompt adherence, HD output, creative interpretation",
    endpoint: "images",
    badge: null,
  },
  {
    id: "dall-e-2",
    name: "DALL·E 2 (Inpainting)",
    description: "Native mask support — edits only the masked region",
    endpoint: "edits",
    badge: "Inpainting",
  },
  {
    id: "gpt-4o",
    name: "GPT-4o Vision + Image",
    description: "Sees body, mask and design, then generates with that context",
    endpoint: "chat",
    badge: null,
  },
] as const;

export type ModelId = (typeof AI_MODELS)[number]["id"];

export const DEFAULT_TRYOUT_MODEL: ModelId = "gemini-2.5-flash-image";

export function isModelId(value: string): value is ModelId {
  return AI_MODELS.some((m) => m.id === value);
}
