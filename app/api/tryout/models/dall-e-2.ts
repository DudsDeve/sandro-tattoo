import { dataUrlToBuffer, openaiImageEdit } from "@/lib/tryout/openai";
import { buildTattooPrompt, type GenerateInput } from "@/app/api/tryout/prompts/tattoo-prompt";

export async function generateWithDalle2(input: GenerateInput): Promise<string> {
  return openaiImageEdit({
    model: "dall-e-2",
    prompt: buildTattooPrompt(input),
    image: dataUrlToBuffer(input.bodyImage),
    mask: dataUrlToBuffer(input.maskImage),
    size: "1024x1024",
  });
}
