export type ArticleSection = {
  id: string;
  title: string;
  body: string;
};

function slugify(value: string, index: number) {
  const slug = value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || `section-${index + 1}`;
}

export function parseArticle(content: string): { intro: string; sections: ArticleSection[] } {
  const parts = content.split(/^##\s+/m);
  const intro = (parts[0] || "").replace(/^#\s+.+\n+/, "").trim();
  const seen = new Set<string>();
  const sections = parts.slice(1).map((chunk, i) => {
    const nl = chunk.indexOf("\n");
    const title = (nl === -1 ? chunk : chunk.slice(0, nl)).trim();
    const body = (nl === -1 ? "" : chunk.slice(nl + 1)).trim();
    let id = slugify(title, i);
    if (seen.has(id)) id = `${id}-${i + 1}`;
    seen.add(id);
    return { id, title, body };
  });
  return { intro, sections };
}

export function splitBlocks(body: string) {
  return body
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);
}

export function isBulletBlock(block: string) {
  const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
  return lines.length > 0 && lines.every((l) => /^[-*•]\s+/.test(l) || /^\d+\.\s+/.test(l));
}

export function bulletLines(block: string) {
  return block
    .split("\n")
    .map((l) => l.replace(/^[-*•]\s+/, "").replace(/^\d+\.\s+/, "").trim())
    .filter(Boolean);
}

export const isListBlock = isBulletBlock;
export const listItems = bulletLines;
