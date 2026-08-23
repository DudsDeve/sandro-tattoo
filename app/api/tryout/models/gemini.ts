import { generateWithGeminiImage } from "@/lib/tryout/gemini";
import type { GenerateInput } from "@/lib/tryout/types";

export async function generateWithGemini25(input: GenerateInput) {
  return generateWithGeminiImage("gemini-2.5-flash-image", input);
}

export async function generateWithGemini20(input: GenerateInput) {
  return generateWithGeminiImage("gemini-2.0-flash-preview-image-generation", input);
}
