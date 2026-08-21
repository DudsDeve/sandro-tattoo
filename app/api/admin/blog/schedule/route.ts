import { NextResponse } from "next/server";
import { getBlogCronState, nowInSaoPaulo, pickRandomSlots, saveBlogCronState } from "@/lib/cms/blog-cron";
import { pickFreshTattooTopics } from "@/lib/cms/generate-post";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET() {
  const { date, hour } = nowInSaoPaulo();
  let state = await getBlogCronState();

  if (!state || state.date !== date) {
    const slots = pickRandomSlots(`${date}-${Date.now()}`);
    const topics = (await pickFreshTattooTopics(2, date)) as [string, string];
    state = { date, slots, topics, done: [] };
    await saveBlogCronState(state);
  } else if ((!state.topics || state.topics.length < 2) && state.done.length === 0) {
    state = {
      ...state,
      topics: (await pickFreshTattooTopics(2, date)) as [string, string],
    };
    await saveBlogCronState(state);
  }

  return NextResponse.json({
    timezone: "America/Sao_Paulo",
    now: { date, hour },
    slots: state.slots,
    topics: state.topics,
    done: state.done,
    remaining: state.slots.filter((s) => !state.done.includes(s)),
    lastRunAt: state.lastRunAt,
    lastTitles: state.lastTitles || [],
    postsPerDay: 2,
  });
}

/** Regenera só os temas do dia (se ainda não publicou). */
export async function POST() {
  const { date, hour } = nowInSaoPaulo();
  const existing = await getBlogCronState();
  if (existing?.date === date && existing.done.length > 0) {
    return NextResponse.json(
      { error: "Já houve publicação hoje — não dá para regenerar os temas." },
      { status: 409 },
    );
  }

  const slots = existing?.date === date ? existing.slots : pickRandomSlots(`${date}-${Date.now()}`);
  const topics = (await pickFreshTattooTopics(2, `${date}-refresh-${Date.now()}`)) as [string, string];
  const state = {
    date,
    slots,
    topics,
    done: [] as number[],
    lastRunAt: existing?.lastRunAt,
    lastTitles: existing?.lastTitles || [],
  };
  await saveBlogCronState(state);

  return NextResponse.json({
    timezone: "America/Sao_Paulo",
    now: { date, hour },
    slots: state.slots,
    topics: state.topics,
    done: state.done,
    remaining: state.slots,
    lastTitles: state.lastTitles,
    postsPerDay: 2,
    refreshed: true,
  });
}
