import type { BlogPost } from "@/lib/types";

function IconSpark() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
    </svg>
  );
}
function IconPen() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}
function IconGem() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M6 3h12l4 7-10 11L2 10Z" />
    </svg>
  );
}
function IconHeart() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M20 8.5c0 5-8 11-8 11S4 13.5 4 8.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 8 2.5Z" />
    </svg>
  );
}
function IconLeaf() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M5 19c8-1 14-7 14-14-7 0-13 6-14 14Z" />
      <path d="M5 19c3-6 8-11 14-14" />
    </svg>
  );
}

const ICONS = [IconSpark, IconGem, IconHeart, IconPen, IconLeaf];
const BY_SLUG: Record<string, typeof IconSpark> = {
  tendencias: IconSpark,
  estilo: IconGem,
  cuidados: IconHeart,
  bastidores: IconPen,
  ideias: IconLeaf,
};

export function CategoryIcon({ slug }: { slug: string }) {
  const Icon = BY_SLUG[slug] || ICONS[Math.abs(hash(slug)) % ICONS.length];
  return <Icon />;
}

function hash(value: string) {
  let n = 0;
  for (let i = 0; i < value.length; i++) n = (n * 31 + value.charCodeAt(i)) | 0;
  return n;
}

export { IconClock, IconCal };

function IconClock() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6l4 2" />
    </svg>
  );
}
function IconCal() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </svg>
  );
}

export function minutesOf(readTime: string) {
  const n = parseInt(readTime.replace(/\D/g, ""), 10);
  return Number.isFinite(n) && n > 0 ? n : 8;
}

export type { BlogPost };
