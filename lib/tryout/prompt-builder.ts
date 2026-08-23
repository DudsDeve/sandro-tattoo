import type { GenerateInput } from "@/lib/tryout/types";

export type { GenerateInput };

export function buildTattooPrompt(input: GenerateInput): string {
  return `You are editing a photo of real skin. A tattoo stencil/artwork is ALREADY placed exactly inside the masked (transparent) region.

CRITICAL:
- Reproduce THAT artwork only — it is the client's design (may be a dragon, lettering, flash, etc.).
- Do NOT invent a different tattoo. No substitute flowers, mandalas, or generic flash unless that is what the artwork shows.
- Do NOT move the tattoo to the other limb or the other side of the body. Keep it in the masked pixels only.
- Outside the mask, the photo must stay identical.

Make the already-placed artwork look like a REAL HEALED tattoo (3–4 weeks old): ink in the skin, matte, following pores, lighting and muscle curvature.
Style label: ${input.designStyle}. File/name: ${input.designName}.
${input.bodyPart ? `Body part: ${input.bodyPart}.` : ""}`;
}

export function buildTattooPromptForDalle3(bodyDescription: string, input: GenerateInput, designDescription?: string): string {
  return `Photorealistic photograph of ${bodyDescription}

Apply this EXACT tattoo design (do not replace with a flower or another motif): ${designDescription || input.designName} (${input.designStyle}).
Place it ONLY where the client marked — same side of the body, same limb. Healed matte ink in the skin, natural lighting, no watermarks.`;
}
