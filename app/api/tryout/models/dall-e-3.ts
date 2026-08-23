import { ensureDataUrl } from "@/lib/tryout/image-utils";
import { openaiImageGenerate, openaiVisionText } from "@/lib/tryout/openai";
import { buildTattooPromptForDalle3, type GenerateInput } from "@/app/api/tryout/prompts/tattoo-prompt";

export async function generateWithDalle3(input: GenerateInput): Promise<string> {
  const [bodyDescription, designDescription] = await Promise.all([
    openaiVisionText(
      ensureDataUrl(input.bodyImage),
      "Describe this body photo in precise detail: which side of the body is shown, left vs right limb, skin tone, lighting, background, angle. Under 160 words.",
    ),
    openaiVisionText(
      ensureDataUrl(input.designImage),
      "Describe this tattoo design in precise visual detail (motifs, text, orientation). Do not call it a flower unless it is clearly floral. Under 120 words.",
    ),
  ]);
  return openaiImageGenerate({
    model: "dall-e-3",
    prompt: buildTattooPromptForDalle3(bodyDescription, input, designDescription),
    size: "1024x1024",
    quality: "hd",
  });
}
