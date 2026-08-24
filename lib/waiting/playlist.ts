import type { CmsStore } from "@/lib/cms/types";
import { youtubeVideoId } from "@/lib/utils";

export type WaitingSlide =
  | { kind: "image"; src: string; title?: string }
  | { kind: "video"; src: string; title?: string }
  | { kind: "youtube"; videoId: string; title?: string };

function pushUnique(list: WaitingSlide[], slide: WaitingSlide) {
  const key =
    slide.kind === "youtube" ? `yt:${slide.videoId}` : `${slide.kind}:${slide.src}`;
  if (list.some((s) => (s.kind === "youtube" ? `yt:${s.videoId}` : `${s.kind}:${s.src}`) === key)) {
    return;
  }
  list.push(slide);
}

export function buildWaitingPlaylist(store: CmsStore): WaitingSlide[] {
  const slides: WaitingSlide[] = [];

  for (const item of store.items || []) {
    if (item.video) pushUnique(slides, { kind: "video", src: item.video, title: item.title });
    if (item.image) pushUnique(slides, { kind: "image", src: item.image, title: item.title });
  }

  for (const artist of store.artists || []) {
    if (artist.image) pushUnique(slides, { kind: "image", src: artist.image, title: artist.name });
    for (const work of artist.works || []) {
      if (work.video) pushUnique(slides, { kind: "video", src: work.video, title: work.title });
      if (work.image) pushUnique(slides, { kind: "image", src: work.image, title: work.title });
    }
  }

  for (const wish of store.wishlistItems || []) {
    if (wish.visible === false) continue;
    if (wish.image) pushUnique(slides, { kind: "image", src: wish.image, title: wish.title });
  }

  for (const clip of [...(store.waitingVideos || [])].sort((a, b) => a.order - b.order)) {
    const id = youtubeVideoId(clip.youtubeUrl);
    if (id) pushUnique(slides, { kind: "youtube", videoId: id, title: clip.title });
  }

  for (const t of store.testimonials || []) {
    const id = t.youtubeUrl ? youtubeVideoId(t.youtubeUrl) : null;
    if (id) pushUnique(slides, { kind: "youtube", videoId: id, title: t.title });
    if (t.video) pushUnique(slides, { kind: "video", src: t.video, title: t.title });
    if (t.image) pushUnique(slides, { kind: "image", src: t.image, title: t.title });
  }

  return slides;
}
