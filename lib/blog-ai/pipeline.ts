import { generateText } from "ai";
import { hasLlmKey, llmModel } from "@/lib/ai/llm";
import { buildResearchPrompt, WRITER_PROMPT_CLIENT_SEO } from "@/lib/cms/blog-prompts";
import { isDuplicate, mapCategoryToCms } from "@/lib/cms/dedup";
import { buildCoverPrompt } from "@/lib/blog-ai/cover-prompt-builder";
import { generateCoverImage } from "@/lib/cms/generate-post";
import { mutateCmsStore, newId } from "@/lib/cms/store";
import { researchClientQueries } from "@/lib/cms/research";
import { selectTopic } from "@/lib/cms/topic-engine";
import type { ContentPillar } from "@/lib/cms/seo-keywords";
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
  seoKeyword: string;
  eventScope?: string | null;
  rawResearch?: string;
  pillarId?: string;
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

async function researchOnePillar(pillar: ContentPillar, existingTitles: string) {
  const research = await researchClientQueries(pillar.searchQueries);
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
    temperature: 0.55,
    system: buildResearchPrompt(existingTitles, pillar),
    prompt: `WEB RESEARCH RESULTS:\n${researchBlock}\n\nWrite the JSON brief for keyword "${pillar.primaryKeyword}".`,
  });

  const parsed = parseJson<BlogResearchPayload>(text);
  if (!parsed.selectedTopic || !parsed.headline) {
    throw new Error("Research model returned an incomplete topic.");
  }

  return {
    parsed: {
      ...parsed,
      seoKeyword: parsed.seoKeyword || pillar.primaryKeyword,
      sources: parsed.sources?.length
        ? parsed.sources
        : research.hits.slice(0, 6).map((h) => ({
            title: h.title,
            url: h.url,
            snippet: h.snippet,
          })),
      eventScope: research.eventScope,
      rawResearch: researchBlock,
      pillarId: pillar.id,
    },
  };
}

export async function runBlogResearch(manualTopic?: string): Promise<BlogResearchPayload> {
  if (!hasLlmKey()) {
    throw new Error("Configure OPENAI_API_KEY or ANTHROPIC_API_KEY.");
  }

  const excludeIds: string[] = [];
  let lastError = "Could not find a unique topic.";

  for (let attempt = 0; attempt < 5; attempt++) {
    const selection = await selectTopic(manualTopic, excludeIds);
    const existingTitles = selection.existingPosts.map((p) => `- ${p.title}`).join("\n");

    try {
      const { parsed } = await researchOnePillar(selection.pillar, existingTitles);
      const dup = isDuplicate(parsed.headline, parsed.seoKeyword, selection.existingPosts);
      const dupTopic = isDuplicate(parsed.selectedTopic, parsed.seoKeyword, selection.existingPosts);
      if (dup.duplicate || dupTopic.duplicate) {
        lastError = dup.reason || dupTopic.reason;
        excludeIds.push(selection.pillar.id);
        continue;
      }
      return parsed;
    } catch (e) {
      lastError = e instanceof Error ? e.message : lastError;
      excludeIds.push(selection.pillar.id);
    }
  }

  throw new Error(lastError);
}

export async function runBlogWrite(research: BlogResearchPayload): Promise<BlogGeneratedPost> {
  if (!hasLlmKey()) {
    throw new Error("Configure OPENAI_API_KEY or ANTHROPIC_API_KEY.");
  }

  const { text } = await generateText({
    model: llmModel(),
    temperature: 0.7,
    system: WRITER_PROMPT_CLIENT_SEO,
    prompt: `Write a complete blog post based on this research brief:\n\n${JSON.stringify(research)}\n\nPrimary keyword: ${research.seoKeyword}. Write in ENGLISH. Follow all SEO and FAQ rules exactly.`,
  });

  const post = parseJson<BlogGeneratedPost>(text);
  if (!post.title?.trim() || !post.body?.trim()) {
    throw new Error("Writer returned incomplete article.");
  }

  const selection = await selectTopic();
  const dup = isDuplicate(post.title, post.seoKeyword || research.seoKeyword, selection.existingPosts);
  if (dup.duplicate) {
    throw new Error(`Generated title overlaps an existing post (${dup.reason}). Re-run research.`);
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
    excerpt: (post.excerpt || "").slice(0, 155),
    readingTime: post.readingTime || "6 min",
    tags: post.tags || research.suggestedTags || [],
    seoKeyword: post.seoKeyword || research.seoKeyword,
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
      seoKeyword: post.seoKeyword,
      tags: post.tags,
      published,
      sources,
    };
    s.posts.unshift(saved);
    return s;
  });

  if (!saved) throw new Error("Failed to save post.");
  return saved;
}

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
