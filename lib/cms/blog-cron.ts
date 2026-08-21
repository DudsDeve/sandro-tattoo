import { promises as fs } from "fs";
import path from "path";
import { list, put } from "@vercel/blob";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { readBlogCronFromSupabase, writeBlogCronToSupabase } from "@/lib/supabase/blog-cron";

export type BlogCronState = {
  /** YYYY-MM-DD no fuso America/Sao_Paulo */
  date: string;
  /** Duas horas (0–23) sorteadas para o dia */
  slots: [number, number];
  /** Horas já publicadas hoje */
  done: number[];
  /** Temas reservados para cada slot */
  topics: [string, string];
  lastRunAt?: string;
  lastTitles?: string[];
};

const LOCAL_PATH = path.join(process.cwd(), "content", "blog-cron.json");
const BLOB_KEY = "cms/blog-cron.json";
const TZ = "America/Sao_Paulo";

export function nowInSaoPaulo() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "0";
  const hourRaw = Number(get("hour"));
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    hour: hourRaw === 24 ? 0 : hourRaw,
  };
}

/** Sorteia 2 horas distintas entre 8h e 21h. */
export function pickRandomSlots(seed: string): [number, number] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const hours: number[] = [];
  for (let hour = 8; hour <= 21; hour++) hours.push(hour);
  const pick = () => {
    h = (h * 1664525 + 1013904223) >>> 0;
    const idx = h % hours.length;
    return hours.splice(idx, 1)[0]!;
  };
  const a = pick();
  const b = pick();
  return a < b ? [a, b] : [b, a];
}

async function readLocal(): Promise<BlogCronState | null> {
  try {
    const raw = await fs.readFile(LOCAL_PATH, "utf8");
    return JSON.parse(raw) as BlogCronState;
  } catch {
    return null;
  }
}

async function writeLocal(state: BlogCronState) {
  await fs.mkdir(path.dirname(LOCAL_PATH), { recursive: true });
  await fs.writeFile(LOCAL_PATH, JSON.stringify(state, null, 2), "utf8");
}

async function readBlob(): Promise<BlogCronState | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  try {
    const { blobs } = await list({ prefix: BLOB_KEY, limit: 1 });
    const hit = blobs.find((b) => b.pathname === BLOB_KEY) ?? blobs[0];
    if (!hit) return null;
    const res = await fetch(hit.url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as BlogCronState;
  } catch {
    return null;
  }
}

async function writeBlob(state: BlogCronState) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;
  await put(BLOB_KEY, JSON.stringify(state, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

export async function getBlogCronState(): Promise<BlogCronState | null> {
  const fromSupabase = await readBlogCronFromSupabase();
  if (fromSupabase) return fromSupabase;

  const fromBlob = await readBlob();
  if (fromBlob) {
    if (isSupabaseConfigured()) await writeBlogCronToSupabase(fromBlob);
    return fromBlob;
  }

  return readLocal();
}

export async function saveBlogCronState(state: BlogCronState) {
  const wrote = await writeBlogCronToSupabase(state);
  if (!wrote) {
    await writeLocal(state);
    await writeBlob(state);
  } else {
    try {
      await writeLocal(state);
    } catch {
      /* ignore */
    }
  }
  return state;
}

/** Próximo slot pendente cujo horário já chegou (permite catch-up). */
export function nextDueSlot(state: BlogCronState, currentHour: number): number | null {
  for (const slot of state.slots) {
    if (state.done.includes(slot)) continue;
    if (currentHour >= slot) return slot;
  }
  return null;
}
