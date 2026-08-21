import { generateText } from "ai";
import { hasLlmKey, llmModel } from "@/lib/ai/llm";
import { RESEARCH_SYSTEM_PROMPT } from "@/lib/blog-ai/research-prompt";
import { WRITER_SYSTEM_PROMPT } from "@/lib/blog-ai/writer-prompt";
import { buildCoverPrompt } from "@/lib/blog-ai/cover-prompt-builder";
import {
  getExistingTopics,
  isDuplicateTitle,
  leastUsedCategory,
  mapCategoryToCms,
} from "@/lib/blog-ai/dedup";
import { generateCoverImage } from "@/lib/cms/generate-post";
import { getCmsStore, mutateCmsStore, newId } from "@/lib/cms/store";
import { isEventTopic, researchTattooTrends } from "@/lib/cms/research";
import type { CmsPost } from "@/lib/cms/types";

export type BlogResearchPayload = {
  selectedTopic: string;
  headline: string;
  angle: string;
  whyNow: string;
  keyPoints: string[];
  sources: Array<{ title: string; url: string; snippet: string }>;
  suggestedCategory: string;
  suggestedTags: string[];
  imageSubject: string;
  eventScope?: string | null;
  rawResearch?: string;
};

export type BlogGeneratedPost = {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  readingTime: string;
  body: string;
  seoKeyword: string;
  seoTitle: string;
  imageSubject?: string;
};

function parseJson<T>(text: string): T {
  const clean = text.replace(/^```json\s*|\s*```$/g, "").trim();
  return JSON.parse(clean) as T;
}

export async function runBlogResearch(manualTopic?: string): Promise<BlogResearchPayload> {
  if (!hasLlmKey()) {
    throw new Error("Configure OPENAI_API_KEY or ANTHROPIC_API_KEY.");
  }

  const store = await getCmsStore();
  const existing = await getExistingTopics();
  const preferred = leastUsedCategory(store.posts);
  const topicHint =
    manualTopic?.trim() ||
    (Math.random() > 0.7 ? "tattoo festival convention events" : `tattoo trends ${new Date().getFullYear()}`);

  const research = await researchTattooTrends(manualTopic?.trim() || topicHint);

  if (!research.hits.length) {
    throw new Error("Web research returned no results. Try again in a moment.");
  }

  const researchBlock = research.hits
    .map(
      (h, i) =>
        `${i + 1}. ${h.title}\n   Source: ${h.source}\n   Region: ${h.region || "general"}\n   URL: ${h.url}\n   Snippet: ${h.snippet}`,
    )
    .join("\n\n");

  const { text } = await generateText({
    model: llmModel(),
    temperature: 0.6,
    system: RESEARCH_SYSTEM_PROMPT(
      existing.titles.map((t) => `- ${t}`).join("\n"),
      existing.categories.join(", "),
      preferred,
      manualTopic,
    ),
    prompt: `WEB RESEARCH RESULTS:\n${researchBlock}\n\n${
      manualTopic
        ? `Admin topic direction: "${manualTopic}". Pick a fresh current angle.`
        : "Pick the strongest fresh tattoo topic for our Dublin studio blog."
    }\nPrefer CMS category bucket: ${preferred}.\nEvent scope from search cascade: ${research.eventScope || "n/a"}.\nIs event topic: ${isEventTopic(manualTopic) || isEventTopic(topicHint)}.`,
  });

  const parsed = parseJson<BlogResearchPayload>(text);
  if (!parsed.selectedTopic || !parsed.headline) {
    throw new Error("Research model returned an incomplete topic.");
  }

  if (isDuplicateTitle(parsed.headline, existing.titles) || isDuplicateTitle(parsed.selectedTopic, existing.titles)) {
    throw new Error("Selected topic looks too similar to an existing post. Try again.");
  }

  return {
    ...parsed,
    sources: parsed.sources?.length
      ? parsed.sources
      : research.hits.slice(0, 6).map((h) => ({
          title: h.title,
          url: h.url,
          snippet: h.snippet,
        })),
    eventScope: research.eventScope,
    rawResearch: researchBlock,
  };
}

export async function runBlogWrite(research: BlogResearchPayload): Promise<BlogGeneratedPost> {
  if (!hasLlmKey()) {
    throw new Error("Configure OPENAI_API_KEY or ANTHROPIC_API_KEY.");
  }

  const { text } = await generateText({
    model: llmModel(),
    temperature: 0.7,
    system: WRITER_SYSTEM_PROMPT,
    prompt: `Write a complete blog post based on this research:\n\n${JSON.stringify(research)}\n\nRemember: write in ENGLISH, make it current and authoritative, follow all formatting rules exactly.`,
  });

  const post = parseJson<BlogGeneratedPost>(text);
  if (!post.title?.trim() || !post.body?.trim()) {
    throw new Error("Writer returned incomplete article.");
  }

  const existing = await getExistingTopics();
  if (isDuplicateTitle(post.title, existing.titles)) {
    throw new Error("Generated title overlaps an existing post. Re-run research.");
  }

  const slug =
    post.slug?.trim() ||
    post.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 80);

  return {
    ...post,
    slug,
    excerpt: (post.excerpt || "").slice(0, 160),
    readingTime: post.readingTime || "6 min",
    tags: post.tags || research.suggestedTags || [],
    seoTitle: post.seoTitle || post.title,
    imageSubject: post.imageSubject || research.imageSubject,
  };
}

export async function runBlogCover(imageSubject: string, slugHint = "cover"): Promise<string> {
  const prompt = buildCoverPrompt(imageSubject);
  return generateCoverImage(prompt, slugHint);
}

export async function publishBlogDraft(input: {
  post: BlogGeneratedPost;
  cover: string;
  sources?: string[];
  published?: boolean;
}): Promise<CmsPost> {
  const { post, cover, sources = [], published = false } = input;
  let saved: CmsPost | null = null;

  await mutateCmsStore((s) => {
    let slug = post.slug;
    const base = slug;
    let n = 2;
    while (s.posts.some((p) => p.slug === slug)) {
      slug = `${base}-${n++}`;
    }

    saved = {
      id: newId("post"),
      slug,
      title: post.title,
      excerpt: post.excerpt,
      category: mapCategoryToCms(post.category),
      date: new Date().toISOString().slice(0, 10),
      readTime: post.readingTime,
      cover,
      content: post.body,
      seoTitle: post.seoTitle || post.title,
      seoDescription: post.excerpt,
      published,
      sources,
    };
    s.posts.unshift(saved);
    return s;
  });

  if (!saved) throw new Error("Failed to save post.");
  return saved;
}

/** Full pipeline for cron / one-shot. */
export async function runFullBlogPipeline(options?: {
  manualTopic?: string;
  published?: boolean;
}) {
  const research = await runBlogResearch(options?.manualTopic);
  const post = await runBlogWrite(research);
  const cover = await runBlogCover(post.imageSubject || research.imageSubject, post.slug);
  const saved = await publishBlogDraft({
    post,
    cover,
    sources: research.sources.map((s) => s.url),
    published: options?.published ?? false,
  });
  return { research, post, cover, saved };
}
