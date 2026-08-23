export {
  isDuplicate as isDuplicateTitle,
  leastUsedCmsCategory as leastUsedCategory,
  mapCategoryToCms,
  postsToExisting,
} from "@/lib/cms/dedup";

import { getCmsStore } from "@/lib/cms/store";

export async function getExistingTopics() {
  const store = await getCmsStore();
  const posts = store.posts || [];
  return {
    titles: posts.map((p) => p.title),
    slugs: posts.map((p) => p.slug),
    categories: posts.map((p) => p.category),
    topics: posts.map((p) => `${p.title} — ${p.excerpt}`),
  };
}
