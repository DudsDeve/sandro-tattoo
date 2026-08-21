export function buildCoverPrompt(imageSubject: string): string {
  const subject =
    imageSubject?.trim() ||
    "a modern tattoo studio still-life with tattoo machine, ink bottles and sterile tools arranged as a premium scene";

  return `Create a flat isometric illustration in 2.5D perspective.

SUBJECT: ${subject}

MANDATORY STYLE:
- Flat design isometric illustration, NOT a photograph, NOT 3D render, NOT photorealistic
- Clean geometric shapes with soft rounded corners
- Isometric 30-degree angle perspective
- Objects arranged in an organized scene composition
- Soft drop shadows for depth, NO hard shadows
- Completely smooth flat surfaces, NO textures or grain
- Modern editorial illustration style similar to Notion, Stripe, or Slack brand illustrations
- Professional, polished, premium quality

MANDATORY COLOR PALETTE — USE ONLY THESE COLORS:
- Background: deep black (#0A0A0A) or very dark gray (#111111)
- Primary elements: dark moss green (#4C5634)
- Secondary elements: medium olive green (#5C6B3F)
- Highlights and accents: sage green (#8B9A6B)
- Light accents for icons/details: pale green (#A8B88C)
- Dark support elements: very dark green (#3A4228)
- Neutral depth layers: dark grays (#1A1A1A, #2A2A2A, #333333)

DO NOT USE any blue, red, orange, yellow, pink, purple, or bright colors.
DO NOT USE white or light backgrounds.
The entire illustration must be in dark green and black tones only.

COMPOSITION: Centered, balanced, with adequate negative space around edges.
The illustration should work as a blog post cover image at 16:9 aspect ratio.
No text, logos, letters, numbers, watermarks, or UI in the image.`;
}
