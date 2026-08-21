"use client";

import { useEffect, useState } from "react";
import { MediaField } from "@/components/admin/MediaField";
import { useAdminStore } from "@/components/admin/AdminStoreProvider";
import type { CmsPost } from "@/lib/cms/types";
import type { BlogGeneratedPost, BlogResearchPayload } from "@/lib/blog-ai/pipeline";

type ScheduleInfo = {
  timezone: string;
  now: { date: string; hour: number };
  slots: number[];
  topics: string[];
  done: number[];
  remaining: number[];
  lastTitles: string[];
  postsPerDay: number;
};

type Stage = "idle" | "research" | "write" | "cover" | "ready" | "saving";

function fmtHour(h: number) {
  return `${String(h).padStart(2, "0")}:00`;
}

const STAGE_LABEL: Record<Stage, string> = {
  idle: "",
  research: "Searching the web for latest tattoo news…",
  write: "Writing article based on findings…",
  cover: "Generating isometric cover illustration…",
  ready: "Ready for review",
  saving: "Saving to CMS…",
};

export default function AdminBlogPage() {
  const { store, setStore, loading } = useAdminStore();
  const [topic, setTopic] = useState("");
  const [stage, setStage] = useState<Stage>("idle");
  const [msg, setMsg] = useState("");
  const [schedule, setSchedule] = useState<ScheduleInfo | null>(null);
  const [refreshingTopics, setRefreshingTopics] = useState(false);

  const [research, setResearch] = useState<BlogResearchPayload | null>(null);
  const [post, setPost] = useState<BlogGeneratedPost | null>(null);
  const [cover, setCover] = useState("");

  async function loadSchedule() {
    const res = await fetch("/api/admin/blog/schedule");
    const data = await res.json();
    if (data.slots) setSchedule(data as ScheduleInfo);
  }

  useEffect(() => {
    void loadSchedule().catch(() => undefined);
  }, [store?.updatedAt]);

  async function refreshTopics() {
    setRefreshingTopics(true);
    const res = await fetch("/api/admin/blog/schedule", { method: "POST" });
    const data = await res.json();
    setRefreshingTopics(false);
    if (!res.ok) {
      setMsg(data.error || "Could not refresh topics");
      return;
    }
    setSchedule(data as ScheduleInfo);
    setMsg("Fresh tattoo topics drawn from current research.");
  }

  async function runPipeline() {
    setMsg("");
    setResearch(null);
    setPost(null);
    setCover("");
    try {
      setStage("research");
      const rRes = await fetch("/api/admin/blog-ai/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manualTopic: topic || undefined }),
      });
      const rData = await rRes.json();
      if (!rRes.ok) throw new Error(rData.error || "Research failed");
      setResearch(rData.research);

      setStage("write");
      const wRes = await fetch("/api/admin/blog-ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ research: rData.research }),
      });
      const wData = await wRes.json();
      if (!wRes.ok) throw new Error(wData.error || "Write failed");
      setPost(wData.post);

      setStage("cover");
      const cRes = await fetch("/api/admin/blog-ai/generate-cover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageSubject: wData.post.imageSubject || rData.research.imageSubject,
          slug: wData.post.slug,
        }),
      });
      const cData = await cRes.json();
      if (!cRes.ok) throw new Error(cData.error || "Cover failed");
      setCover(cData.imageUrl);
      setStage("ready");
      setMsg("Draft ready — review in English, then save as draft or publish.");
    } catch (e) {
      setStage("idle");
      setMsg(e instanceof Error ? e.message : "Pipeline failed");
    }
  }

  async function regenerateCover() {
    if (!post && !research) return;
    setStage("cover");
    setMsg("Regenerating cover…");
    const cRes = await fetch("/api/admin/blog-ai/generate-cover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageSubject: post?.imageSubject || research?.imageSubject || "tattoo studio isometric scene",
        slug: post?.slug || "cover",
      }),
    });
    const cData = await cRes.json();
    setStage("ready");
    if (!cRes.ok) {
      setMsg(cData.error || "Cover failed");
      return;
    }
    setCover(cData.imageUrl);
    setMsg("New cover generated.");
  }

  async function save(publishNow: boolean) {
    if (!post || !cover) {
      setMsg("Need article + cover before saving.");
      return;
    }
    setStage("saving");
    const res = await fetch("/api/admin/blog-ai/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        post,
        cover,
        sources: research?.sources?.map((s) => s.url) || [],
        published: publishNow,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setStage("ready");
      setMsg(data.error || "Save failed");
      return;
    }
    setStore(data.store);
    setStage("idle");
    setResearch(null);
    setPost(null);
    setCover("");
    setMsg(publishNow ? "Published to the site." : "Saved as draft in CMS.");
  }

  async function remove(id: string) {
    if (!confirm("Delete post?")) return;
    const res = await fetch(`/api/admin/posts?id=${id}`, { method: "DELETE" });
    if (res.ok) setStore(await res.json());
  }

  async function togglePublish(p: CmsPost) {
    const res = await fetch("/api/admin/posts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...p, published: !p.published }),
    });
    if (res.ok) setStore(await res.json());
  }

  if (loading || !store) return <p className="text-[#a09b95]">Loading…</p>;

  const busy = stage !== "idle" && stage !== "ready";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-4xl">Blog + AI</h1>
        <p className="mt-2 max-w-2xl text-[#a09b95]">
          Research current tattoo news → write a full English article → generate an isometric moss-green
          cover → save as draft for review. Daily automation still publishes 2 posts at random hours.
        </p>
      </div>

      {schedule && (
        <div className="border border-[#4c5634]/50 bg-[#111] p-5">
          <p className="font-mono text-[0.65rem] tracking-[0.18em] text-[#8b9a6b]">
            AUTOMATION TODAY · {schedule.timezone}
          </p>
          <p className="mt-3 text-sm text-[#e8e4df]">
            Slots:{" "}
            {schedule.slots.map((h, i) => (
              <span key={h} className="mr-3 inline-block">
                <span className={schedule.done.includes(h) ? "text-[#8b9a6b] line-through" : "text-white"}>
                  {fmtHour(h)}
                </span>
                {schedule.topics[i] ? <span className="ml-1 text-[#5c5955]">({schedule.topics[i]})</span> : null}
              </span>
            ))}
          </p>
          <p className="mt-2 text-xs text-[#a09b95]">
            Now: {fmtHour(schedule.now.hour)} · published today: {schedule.done.length}/{schedule.postsPerDay}
          </p>
          {schedule.done.length === 0 && (
            <button
              type="button"
              disabled={refreshingTopics}
              onClick={() => void refreshTopics()}
              className="mt-4 border border-[#4c5634] px-3 py-2 text-xs text-[#8b9a6b]"
            >
              {refreshingTopics ? "Researching…" : "Redraw current topics"}
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3 border border-[#1a1a1a] bg-[#111] p-5 sm:flex-row sm:items-end">
        <label className="flex-1">
          <span className="font-mono text-[0.65rem] tracking-[0.18em] text-[#8b9a6b]">
            ANGLE / TOPIC (OPTIONAL)
          </span>
          <input
            className="mt-2 w-full border border-[#1a1a1a] bg-black px-3 py-3"
            placeholder="e.g. fine line trends 2026, Dublin tattoo conventions…"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={busy}
          />
        </label>
        <button
          type="button"
          disabled={busy}
          onClick={() => void runPipeline()}
          className="bg-[#4c5634] px-5 py-3 text-sm text-white"
        >
          {busy ? STAGE_LABEL[stage] || "Working…" : "Research + Generate Post"}
        </button>
      </div>

      {stage !== "idle" && stage !== "ready" && (
        <p className="font-mono text-sm text-[#8b9a6b]">{STAGE_LABEL[stage]}</p>
      )}
      {msg && <p className="text-sm text-[#8b9a6b]">{msg}</p>}

      {post && (
        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="space-y-3 border border-[#1a1a1a] bg-[#111] p-5">
            <input
              className="w-full border border-[#1a1a1a] bg-black px-3 py-3"
              value={post.title}
              onChange={(e) => setPost({ ...post, title: e.target.value })}
            />
            <input
              className="w-full border border-[#1a1a1a] bg-black px-3 py-3"
              value={post.seoTitle}
              onChange={(e) => setPost({ ...post, seoTitle: e.target.value })}
              placeholder="SEO title"
            />
            <textarea
              className="w-full border border-[#1a1a1a] bg-black px-3 py-3"
              rows={2}
              value={post.excerpt}
              onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
            />
            <div className="grid gap-3 sm:grid-cols-3">
              <input
                className="border border-[#1a1a1a] bg-black px-3 py-3"
                value={post.slug}
                onChange={(e) => setPost({ ...post, slug: e.target.value })}
              />
              <input
                className="border border-[#1a1a1a] bg-black px-3 py-3"
                value={post.category}
                onChange={(e) => setPost({ ...post, category: e.target.value })}
              />
              <input
                className="border border-[#1a1a1a] bg-black px-3 py-3"
                value={post.readingTime}
                onChange={(e) => setPost({ ...post, readingTime: e.target.value })}
              />
            </div>
            <input
              className="w-full border border-[#1a1a1a] bg-black px-3 py-3"
              value={(post.tags || []).join(", ")}
              onChange={(e) =>
                setPost({
                  ...post,
                  tags: e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                })
              }
              placeholder="tags, comma separated"
            />
            <textarea
              className="w-full border border-[#1a1a1a] bg-black px-3 py-3 font-mono text-sm"
              rows={18}
              value={post.body}
              onChange={(e) => setPost({ ...post, body: e.target.value })}
            />
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={busy || !cover}
                onClick={() => void save(false)}
                className="border border-[#4c5634] px-4 py-3 text-sm text-[#8b9a6b]"
              >
                Publish as Draft
              </button>
              <button
                type="button"
                disabled={busy || !cover}
                onClick={() => void save(true)}
                className="bg-[#4c5634] px-4 py-3 text-sm text-white"
              >
                Publish Now
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <MediaField label="Cover" value={cover} accept="image/*" onChange={setCover} />
            <button
              type="button"
              disabled={busy}
              onClick={() => void regenerateCover()}
              className="border border-[#4c5634] px-3 py-2 text-xs text-[#8b9a6b]"
            >
              Regenerate cover
            </button>
            {!!research?.sources?.length && (
              <div className="border border-[#1a1a1a] bg-black p-4">
                <p className="font-mono text-[0.65rem] tracking-[0.18em] text-[#8b9a6b]">SOURCES</p>
                <ul className="mt-3 space-y-2 text-xs text-[#a09b95]">
                  {research.sources.slice(0, 8).map((r) => (
                    <li key={r.url}>
                      <a href={r.url} target="_blank" rel="noreferrer" className="text-[#8b9a6b] underline">
                        {r.title}
                      </a>
                    </li>
                  ))}
                </ul>
                {research.whyNow && <p className="mt-3 text-xs text-[#5c5955]">{research.whyNow}</p>}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <p className="font-mono text-[0.65rem] tracking-[0.18em] text-[#8b9a6b]">EXISTING POSTS</p>
        {store.posts.map((p) => (
          <div key={p.id} className="flex items-center gap-3 border border-[#1a1a1a] p-3">
            <div
              className="h-14 w-20 shrink-0 bg-cover bg-center"
              style={{ backgroundImage: p.cover ? `url(${p.cover})` : undefined }}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-serif text-lg">{p.title}</p>
              <p className="text-xs text-[#5c5955]">
                {p.category} · {p.published === false ? "draft" : "published"}
              </p>
            </div>
            <button type="button" className="text-sm text-[#8b9a6b]" onClick={() => void togglePublish(p)}>
              {p.published === false ? "Publish" : "Unpublish"}
            </button>
            <button type="button" className="text-sm text-[#8f4a4a]" onClick={() => void remove(p.id)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
