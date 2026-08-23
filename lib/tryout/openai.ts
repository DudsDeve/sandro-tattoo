import { stripDataUrl } from "@/lib/tryout/image-utils";

function apiKey() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("Configure OPENAI_API_KEY para o provador virtual.");
  return key;
}

export function dataUrlToBuffer(dataUrl: string) {
  return Buffer.from(stripDataUrl(dataUrl), "base64");
}

export async function openaiImageEdit(opts: {
  model: string;
  prompt: string;
  image: Buffer;
  mask?: Buffer;
  size?: string;
}): Promise<string> {
  const form = new FormData();
  form.set("model", opts.model);
  form.set("prompt", opts.prompt);
  form.set("n", "1");
  form.set("size", opts.size ?? "1024x1024");
  form.set("image", new Blob([new Uint8Array(opts.image)], { type: "image/png" }), "body.png");
  if (opts.mask) form.set("mask", new Blob([new Uint8Array(opts.mask)], { type: "image/png" }), "mask.png");

  const res = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey()}` },
    body: form,
  });
  const json = (await res.json()) as {
    data?: Array<{ url?: string; b64_json?: string }>;
    error?: { message?: string };
  };
  const hit = json.data?.[0];
  if (hit?.url) return hit.url;
  if (hit?.b64_json) return `data:image/png;base64,${hit.b64_json}`;
  throw new Error(json.error?.message || `OpenAI edits falhou (HTTP ${res.status})`);
}

export async function openaiImageGenerate(opts: {
  model: string;
  prompt: string;
  size?: string;
  quality?: string;
}): Promise<string> {
  const body: Record<string, unknown> = {
    model: opts.model,
    prompt: opts.prompt,
    n: 1,
    size: opts.size ?? "1024x1024",
  };
  if (opts.quality) body.quality = opts.quality;

  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as {
    data?: Array<{ url?: string; b64_json?: string }>;
    error?: { message?: string };
  };
  const hit = json.data?.[0];
  if (hit?.url) return hit.url;
  if (hit?.b64_json) return `data:image/png;base64,${hit.b64_json}`;
  throw new Error(json.error?.message || `OpenAI generate falhou (HTTP ${res.status})`);
}

export async function openaiVisionText(imageDataUrl: string, prompt: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      max_tokens: 400,
      messages: [
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: imageDataUrl.startsWith("data:") ? imageDataUrl : `data:image/png;base64,${imageDataUrl}`, detail: "high" } },
            { type: "text", text: prompt },
          ],
        },
      ],
    }),
  });
  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    error?: { message?: string };
  };
  const text = json.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error(json.error?.message || "GPT-4o não descreveu a foto");
  return text;
}
