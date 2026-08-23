export type ResearchHit = {
  title: string;
  url: string;
  snippet: string;
  source: string;
  region?: "dublin" | "ireland" | "europe" | "general";
};

export type ResearchResult = {
  hits: ResearchHit[];
  eventScope?: "dublin" | "ireland" | "europe" | null;
  isEventTopic: boolean;
};

type LocaleOpts = { hl: string; gl: string; ceid: string; serperGl: string; serperHl: string };

const LOCALE_IE: LocaleOpts = {
  hl: "en",
  gl: "IE",
  ceid: "IE:en",
  serperGl: "ie",
  serperHl: "en",
};

const LOCALE_US: LocaleOpts = {
  hl: "en",
  gl: "US",
  ceid: "US:en",
  serperGl: "us",
  serperHl: "en",
};

export function isEventTopic(topicHint?: string) {
  const t = (topicHint || "").toLowerCase();
  return /festival|convention|expo|ink.?fest|tattoo.?week/i.test(t);
}

async function fromGoogleNews(query: string, locale: LocaleOpts): Promise<ResearchHit[]> {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${locale.hl}&gl=${locale.gl}&ceid=${encodeURIComponent(locale.ceid)}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "VersusStudioBot/1.0" },
    next: { revalidate: 0 },
  });
  if (!res.ok) return [];
  const xml = await res.text();
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 8);
  return items
    .map((m) => {
      const block = m[1];
      const title =
        block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/)?.[1] ||
        block.match(/<title>(.*?)<\/title>/)?.[1] ||
        "";
      const link = block.match(/<link>(.*?)<\/link>/)?.[1] || "";
      const desc =
        block.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] ||
        block.match(/<description>(.*?)<\/description>/)?.[1] ||
        "";
      const clean = desc.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      return {
        title: title.replace(/<!\[CDATA\[|\]\]>/g, "").trim(),
        url: link.trim(),
        snippet: clean.slice(0, 280),
        source: "Google News",
      };
    })
    .filter((h) => h.title && h.url);
}

async function fromSerper(query: string, locale: LocaleOpts): Promise<ResearchHit[]> {
  const key = process.env.SERPER_API_KEY;
  if (!key) return [];
  const res = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "X-API-KEY": key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      q: query,
      gl: locale.serperGl,
      hl: locale.serperHl,
      num: 10,
    }),
  });
  if (!res.ok) return [];
  const data = (await res.json()) as {
    organic?: Array<{ title?: string; link?: string; snippet?: string }>;
    news?: Array<{ title?: string; link?: string; snippet?: string; source?: string }>;
  };
  const hits: ResearchHit[] = [];
  for (const n of data.news ?? []) {
    if (n.title && n.link) {
      hits.push({
        title: n.title,
        url: n.link,
        snippet: n.snippet || "",
        source: n.source || "Serper News",
      });
    }
  }
  for (const o of data.organic ?? []) {
    if (o.title && o.link) {
      hits.push({
        title: o.title,
        url: o.link,
        snippet: o.snippet || "",
        source: "Serper",
      });
    }
  }
  return hits.slice(0, 10);
}

function dedupeHits(hits: ResearchHit[], limit = 12): ResearchHit[] {
  const seen = new Set<string>();
  return hits
    .filter((h) => {
      const key = h.url || h.title;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, limit);
}

async function searchQueries(
  queries: string[],
  locale: LocaleOpts,
  region: ResearchHit["region"],
): Promise<ResearchHit[]> {
  const all: ResearchHit[] = [];
  for (const q of queries) {
    const [serper, news] = await Promise.all([fromSerper(q, locale), fromGoogleNews(q, locale)]);
    all.push(...serper.map((h) => ({ ...h, region })), ...news.map((h) => ({ ...h, region })));
  }
  return dedupeHits(all, 12);
}

/** Client-focused English research (Ireland locale, US fallback for global trends). */
export async function researchClientQueries(queries: string[]): Promise<ResearchResult> {
  const q = queries.map((s) => s.trim()).filter(Boolean);
  if (!q.length) {
    return { hits: [], eventScope: null, isEventTopic: false };
  }

  let hits = await searchQueries(q, LOCALE_IE, "ireland");
  if (hits.length < 3) {
    const us = await searchQueries(q, LOCALE_US, "general");
    hits = dedupeHits([...hits, ...us], 12);
  }

  return { hits, eventScope: null, isEventTopic: false };
}

export async function researchTattooTrends(topicHint?: string): Promise<ResearchResult> {
  const year = new Date().getFullYear();
  const hint = topicHint?.trim();
  const queries = hint
    ? [hint, `${hint} tattoo ideas ${year}`, `${hint} tattoo inspiration`]
    : [`tattoo ideas ${year}`, `first tattoo tips`, `tattoo aftercare tips`];
  return researchClientQueries(queries);
}
