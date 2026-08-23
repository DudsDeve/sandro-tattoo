import { ensureDataUrl } from "@/lib/tryout/image-utils";
import { openaiVisionText } from "@/lib/tryout/openai";
import { generateWithGptImage1 } from "@/app/api/tryout/models/gpt-image-1";
import { type GenerateInput } from "@/app/api/tryout/prompts/tattoo-prompt";

/**
 * GPT-4o chat does not emit pixels. We use vision for placement notes,
 * then gpt-image-1 inpainting with that extra context.
 */
export async function generateWithGpt4o(input: GenerateInput): Promise<string> {
  const notes = await openaiVisionText(
    ensureDataUrl(input.bodyImage),
    `You see a body photo. The client will apply a ${input.designStyle} tattoo named "${input.designName}". In under 120 words, note skin tone, lighting direction, body curvature, and how a healed tattoo should sit in the marked region.`,
  );
  return generateWithGptImage1({
    ...input,
    designName: `${input.designName}. Placement notes: ${notes}`,
  });
}
