import { NextResponse } from "next/server";
import {
  getBlogCronState,
  nextDueSlot,
  nowInSaoPaulo,
  pickRandomSlots,
  saveBlogCronState,
  type BlogCronState,
} from "@/lib/cms/blog-cron";
import { pickFreshTattooTopics } from "@/lib/cms/generate-post";
import { runFullBlogPipeline } from "@/lib/blog-ai/pipeline";

export const runtime = "nodejs";
export const maxDuration = 300;

function authorized(req: Request) {
  const secret = process.env.CRON_SECRET || process.env.ADMIN_PASSWORD || "sandroadmin";
  const header = req.headers.get("authorization") || "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : "";
  const query = new URL(req.url).searchParams.get("secret") || "";
  return bearer === secret || query === secret;
}

async function ensureDayState(): Promise<BlogCronState> {
  const { date } = nowInSaoPaulo();
  const existing = await getBlogCronState();
  if (existing?.date === date && existing.slots?.length === 2) {
    if (existing.topics?.length === 2) {
      return { ...existing, done: existing.done || [] };
    }
    const topics = (await pickFreshTattooTopics(2, date)) as [string, string];
    const next = { ...existing, topics, done: existing.done || [] };
    await saveBlogCronState(next);
    return next;
  }
  const slots = pickRandomSlots(`${date}-${Date.now()}`);
  const topics = (await pickFreshTattooTopics(2, date)) as [string, string];
  const fresh: BlogCronState = { date, slots, topics, done: [], lastTitles: [] };
  await saveBlogCronState(fresh);
  return fresh;
}

async function runCron() {
  const { date, hour } = nowInSaoPaulo();
  let state = await ensureDayState();

  if (state.done.length >= 2) {
    return {
      ok: true,
      skipped: true,
      reason: "Already published 2 posts today",
      date,
      hour,
      slots: state.slots,
      done: state.done,
    };
  }

  const due = nextDueSlot(state, hour);
  if (due == null) {
    return {
      ok: true,
      skipped: true,
      reason: "Scheduled hour not reached yet",
      date,
      hour,
      slots: state.slots,
      done: state.done,
      next: state.slots.find((s) => !state.done.includes(s)) ?? null,
    };
  }

  const slotIndex = state.slots.indexOf(due);
  const topic = state.topics[slotIndex] || state.topics[0];
  const result = await runFullBlogPipeline({ manualTopic: topic, published: true });

  state = {
    ...state,
    done: [...state.done, due],
    lastRunAt: new Date().toISOString(),
    lastTitles: [...(state.lastTitles || []), result.post.title].slice(-6),
  };
  await saveBlogCronState(state);

  return {
    ok: true,
    published: true,
    date,
    hour,
    slot: due,
    post: { title: result.post.title, slug: result.saved.slug, topic },
    slots: state.slots,
    done: state.done,
  };
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await runCron();
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Blog cron failed" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  return GET(req);
}
