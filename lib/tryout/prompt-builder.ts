import type { GenerateInput } from "@/lib/tryout/types";

export type { GenerateInput };

export function buildTattooPrompt(input: GenerateInput): string {
  return `PHOTO EDITING TASK — not image generation.

You are given:
1) the CLIENT'S original photograph (same person, same limb, same camera crop)
2) a mask (transparent / white hole = the selected tattoo area)
3) the tattoo artwork
4) a coverage guide: the artwork already scaled to COVER the whole selected area

HARD RULES:
- The output MUST be the same photograph. Same skin, hairs, lighting, background, framing, body side.
- The tattoo MUST FILL the entire selected/masked area. Scale it up until it covers that region edge to edge.
- Do NOT leave a pale empty rectangle, sticker border, or unused skin inside the selection.
- Do NOT shrink the design to sit in the middle of the box. COVER the mask (crop artwork if needed).
- Blend ink into surrounding skin at the mask edges so there is no visible box.
- Outside the mask, the photo stays identical.
- Do NOT generate a different arm or a stock tattoo photo.

Style: ${input.designStyle}. Name: ${input.designName}.
${input.bodyPart ? `Body part: ${input.bodyPart}.` : ""}`;
}

export function buildTattooPromptForDalle3(bodyDescription: string, input: GenerateInput, designDescription?: string): string {
  return `Photorealistic photograph of ${bodyDescription}

Apply this EXACT tattoo design (do not replace with a flower or another motif): ${designDescription || input.designName} (${input.designStyle}).
Place it ONLY where the client marked — same side of the body, same limb. Healed matte ink in the skin, natural lighting, no watermarks.`;
}
