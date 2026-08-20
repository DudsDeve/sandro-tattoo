import { artists } from "@/lib/data/content";
import type { Artist, StyleVector } from "@/lib/types";

export function mergeWeights(answers: StyleVector[]): StyleVector {
  return answers.reduce<StyleVector>((acc, weights) => {
    for (const [key, value] of Object.entries(weights)) {
      acc[key] = (acc[key] ?? 0) + value;
    }
    return acc;
  }, {});
}

function cosine(a: StyleVector, b: StyleVector) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (const key of keys) {
    const va = a[key] ?? 0;
    const vb = b[key] ?? 0;
    dot += va * vb;
    magA += va * va;
    magB += vb * vb;
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

export interface ArtistMatch {
  artist: Artist;
  score: number;
  percent: number;
}

export function matchArtists(preference: StyleVector, pool: Artist[] = artists): ArtistMatch[] {
  const raw = pool.map((artist) => ({
    artist,
    score: cosine(preference, artist.styleVector),
  }));
  const max = Math.max(...raw.map((item) => item.score), 0.0001);
  return raw
    .map((item) => ({
      ...item,
      percent: Math.round(Math.min(99, Math.max(62, (item.score / max) * 96 + 4))),
    }))
    .sort((a, b) => b.percent - a.percent);
}

export function topStyles(preference: StyleVector, n = 3) {
  return Object.entries(preference)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name]) => name);
}
