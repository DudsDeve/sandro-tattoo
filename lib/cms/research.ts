export type ResearchHit = {
  title: string;
  url: string;
  snippet: string;
  source: string;
  region?: "dublin" | "ireland" | "europe" | "general";
};

export type ResearchResult = {
  hits: ResearchHit[];
  /** Escopo geográfico usado quando o tema é de eventos */
  eventScope?: "dublin" | "ireland" | "europe" | null;
  isEventTopic: boolean;
};

type LocaleOpts = { hl: string; gl: string; ceid: string; serperGl: string; serperHl: string };

const LOCALE_IE: LocaleOpts = {
  hl: "en-IE",
  gl: "IE",
  ceid: "IE:en",
  serperGl: "ie",
  serperHl: "en",
};

const LOCALE_EU: LocaleOpts = {
  hl: "en",
  gl: "GB",
  ceid: "GB:en",
  serperGl: "uk",
  serperHl: "en",
};

const LOCALE_BR: LocaleOpts = {
  hl: "pt-BR",
  gl: "BR",
  ceid: "BR:pt-419",
  serperGl: "br",
  serperHl: "pt-br",
};

export function isEventTopic(topicHint?: string) {
  const t = (topicHint || "").toLowerCase();
  return /evento|event|festival|convention|feira|congresso|ink.?fest|tattoo.?week|expo|encontro|convention/i.test(
    t,
  );
}

async function fromGoogleNews(query: string, locale: LocaleOpts): Promise<ResearchHit[]> {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${locale.hl}&gl=${locale.gl}&ceid=${encodeURIComponent(locale.ceid)}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "SandroTattooBot/1.0" },
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
      num: 8,
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

function dedupe(hits: ResearchHit[], limit = 12): ResearchHit[] {
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
  return dedupe(all, 12);
}

/** Pesquisa em cascata só para posts de eventos: Dublin → Irlanda → Europa. */
export async function researchTattooEvents(topicHint?: string): Promise<ResearchResult> {
  const year = new Date().getFullYear();
  const base = topicHint?.trim() || "tattoo festival convention event";

  const tiers: Array<{
    scope: "dublin" | "ireland" | "europe";
    locale: LocaleOpts;
    queries: string[];
  }> = [
    {
      scope: "dublin",
      locale: LOCALE_IE,
      queries: [
        `${base} Dublin Ireland ${year}`,
        `tattoo festival Dublin ${year}`,
        `tattoo convention Dublin ${year}`,
        `Dublin tattoo expo event ${year}`,
      ],
    },
    {
      scope: "ireland",
      locale: LOCALE_IE,
      queries: [
        `${base} Ireland ${year}`,
        `tattoo festival Ireland ${year}`,
        `tattoo convention Ireland Cork Galway ${year}`,
        `Irish tattoo event expo ${year}`,
      ],
    },
    {
      scope: "europe",
      locale: LOCALE_EU,
      queries: [
        `${base} Europe ${year}`,
        `tattoo festival Europe ${year}`,
        `tattoo convention Europe London Berlin Paris ${year}`,
        `European tattoo expo ${year}`,
      ],
    },
  ];

  for (const tier of tiers) {
    const hits = await searchQueries(tier.queries, tier.locale, tier.scope);
    if (hits.length >= 2) {
      return { hits, eventScope: tier.scope, isEventTopic: true };
    }
  }

  // Última tentativa: junta o que houver no último tier (mesmo que poucas)
  const last = tiers[tiers.length - 1]!;
  const hits = await searchQueries(last.queries, last.locale, last.scope);
  return { hits, eventScope: hits.length ? last.scope : null, isEventTopic: true };
}

export async function researchTattooTrends(topicHint?: string): Promise<ResearchResult> {
  if (isEventTopic(topicHint)) {
    return researchTattooEvents(topicHint);
  }

  const year = new Date().getFullYear();
  const queries = [
    topicHint?.trim() || `tattoo trends ${year}`,
    `tendências tatuagem ${year}`,
    `tattoo aftercare news ${year}`,
    `estilos de tatuagem em alta ${year}`,
  ];

  const hits = await searchQueries(queries, LOCALE_BR, "general");
  return { hits, eventScope: null, isEventTopic: false };
}
