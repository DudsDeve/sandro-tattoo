import { getCmsStore } from "@/lib/cms/store";
import { leastUsedCmsCategory, postsToExisting, type ExistingPost } from "@/lib/cms/dedup";
import {
  CONTENT_PILLARS,
  getNextUnusedPillar,
  pillarToCmsCategory,
  withCurrentYearQueries,
  type ContentPillar,
} from "@/lib/cms/seo-keywords";

export type TopicSelection = {
  pillar: ContentPillar;
  existingPosts: ExistingPost[];
  usedKeywords: string[];
  leastUsedCategory: string;
};

function usedKeywordsFrom(posts: ExistingPost[]) {
  return posts.map((p) => p.seoKeyword).filter(Boolean);
}

export async function selectTopic(
  manualTopic?: string,
  excludeIds: string[] = [],
): Promise<TopicSelection> {
  const store = await getCmsStore();
  const existingPosts = postsToExisting(store.posts || []);
  const usedKeywords = usedKeywordsFrom(existingPosts);
  const leastUsedCategory = leastUsedCmsCategory(store.posts || []);

  if (manualTopic?.trim()) {
    const q = manualTopic.trim().toLowerCase();
    const matchingPillar = CONTENT_PILLARS.find(
      (p) =>
        p.primaryKeyword.toLowerCase().includes(q) ||
        q.includes(p.primaryKeyword.toLowerCase()) ||
        p.id.replace(/-/g, " ").includes(q),
    );

    if (
      matchingPillar &&
      !usedKeywords.map((k) => k.toLowerCase()).includes(matchingPillar.primaryKeyword.toLowerCase())
    ) {
      return {
        pillar: withCurrentYearQueries(matchingPillar),
        existingPosts,
        usedKeywords,
        leastUsedCategory,
      };
    }

    const adHoc: ContentPillar = {
      id: `manual-${Date.now()}`,
      category: "ideas",
      primaryKeyword: manualTopic.trim(),
      searchIntent: `Client searching for: ${manualTopic.trim()}`,
      suggestedTitle: "",
      searchQueries: [
        `${manualTopic.trim()} tattoo ideas ${new Date().getFullYear()}`,
        `${manualTopic.trim()} tattoo designs`,
        `${manualTopic.trim()} tattoo inspiration`,
      ],
      relatedKeywords: [manualTopic.trim()],
      targetAudience: "Potential tattoo clients",
    };
    return { pillar: adHoc, existingPosts, usedKeywords, leastUsedCategory };
  }

  const unused = getNextUnusedPillar(usedKeywords, {
    excludeIds,
    preferCmsCategory: leastUsedCategory,
  });

  if (!unused) {
    const pool = CONTENT_PILLARS.filter((p) => !excludeIds.includes(p.id));
    const recycled = pool[Math.floor(Math.random() * pool.length)] ?? CONTENT_PILLARS[0]!;
    return {
      pillar: withCurrentYearQueries(recycled),
      existingPosts,
      usedKeywords,
      leastUsedCategory,
    };
  }

  return {
    pillar: withCurrentYearQueries(unused),
    existingPosts,
    usedKeywords,
    leastUsedCategory,
  };
}

export { pillarToCmsCategory };
