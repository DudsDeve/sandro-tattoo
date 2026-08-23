import { dataUrlToBuffer, openaiImageEdit } from "@/lib/tryout/openai";
import { buildTattooPrompt, type GenerateInput } from "@/app/api/tryout/prompts/tattoo-prompt";

export async function generateWithGptImage1(input: GenerateInput): Promise<string> {
  return openaiImageEdit({
    model: "gpt-image-1",
    prompt: buildTattooPrompt(input),
    image: dataUrlToBuffer(input.bodyImage),
    mask: dataUrlToBuffer(input.maskImage),
    size: "1024x1024",
  });
}
