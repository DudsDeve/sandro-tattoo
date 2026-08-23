export type PinterestPin = {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string;
};

type PinPayload = {
  id?: string;
  title?: string;
  description?: string;
  link?: string;
  media?: {
    media_type?: string;
    images?: Record<string, { url?: string; width?: number; height?: number }>;
  };
};

function pinImage(pin: PinPayload) {
  const images = pin.media?.images || {};
  return (
    images["600x"]?.url ||
    images["400x300"]?.url ||
    images["236x"]?.url ||
    Object.values(images).find((i) => i?.url)?.url ||
    ""
  );
}

function mapPin(pin: PinPayload): PinterestPin | null {
  const imageUrl = pinImage(pin);
  const id = pin.id || imageUrl;
  if (!id || !imageUrl) return null;
  return {
    id,
    title: pin.title?.trim() || "Pin",
    description: pin.description?.trim() || "",
    url: pin.link || `https://www.pinterest.com/pin/${id}/`,
    imageUrl,
  };
}

function token() {
  return process.env.PINTEREST_ACCESS_TOKEN?.trim() || "";
}

async function pinterestGet(path: string, query: Record<string, string>) {
  const key = token();
  if (!key) throw new Error("Configure PINTEREST_ACCESS_TOKEN no .env / Vercel.");
  const url = new URL(`https://api.pinterest.com/v5${path}`);
  for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    next: { revalidate: 0 },
  });
  const json = (await res.json()) as { items?: PinPayload[]; message?: string; code?: number };
  if (!res.ok) {
    throw new Error(json.message || `Pinterest ${res.status}`);
  }
  return json;
}

/** Public pin search (partner beta) with fallback to the authenticated user's pins. */
export async function searchPinterestPins(term: string, limit = 12): Promise<PinterestPin[]> {
  const q = term.trim();
  if (!q) return [];
  const country = process.env.PINTEREST_COUNTRY_CODE?.trim() || "IE";
  const locale = process.env.PINTEREST_LOCALE?.trim() || "en-IE";
  const pageSize = String(Math.min(25, Math.max(1, limit)));

  try {
    const partner = await pinterestGet("/search/partner/pins", {
      term: q,
      country_code: country,
      locale,
      limit: pageSize,
    });
    const pins = (partner.items ?? []).map(mapPin).filter((p): p is PinterestPin => Boolean(p));
    if (pins.length) return pins.slice(0, limit);
  } catch {
    /* partner search is beta — fall through to account search */
  }

  const own = await pinterestGet("/search/pins", {
    query: q,
    limit: pageSize,
  });
  return (own.items ?? []).map(mapPin).filter((p): p is PinterestPin => Boolean(p)).slice(0, limit);
}

export function isPinterestConfigured() {
  return Boolean(token());
}
