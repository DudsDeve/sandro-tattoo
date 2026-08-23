"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useT } from "@/lib/i18n/LanguageProvider";

function renderText(text: string) {
  const pattern = /(\[[^\]]+\]\([^)]+\)|https?:\/\/[^\s<]+|\/agendar)/g;
  const nodes: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = pattern.exec(text))) {
    if (match.index > last) {
      nodes.push(<span key={`t-${i++}`}>{text.slice(last, match.index)}</span>);
    }
    const token = match[0];
    const md = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (md) {
      const [, label, href] = md;
      nodes.push(linkEl(`l-${i++}`, href!, label!));
    } else {
      const label = token.includes("wa.me") ? "WhatsApp" : token.startsWith("/agendar") ? "Book a session" : token;
      nodes.push(linkEl(`l-${i++}`, token, label));
    }
    last = match.index + token.length;
  }
  if (last < text.length) nodes.push(<span key={`t-${i}`}>{text.slice(last)}</span>);
  return nodes;
}

function linkEl(key: string, href: string, label: string) {
  const external = href.startsWith("http");
  const className = "text-moss underline underline-offset-2";
  if (external) {
    return (
      <a key={key} href={href} target="_blank" rel="noreferrer" className={className}>
        {label}
      </a>
    );
  }
  return (
    <Link key={key} href={href} className={className}>
      {label}
    </Link>
  );
}

export function ChatMessage({ role, text }: { role: "user" | "assistant"; text: string }) {
  const t = useT();
  return (
    <div className={role === "user" ? "ml-8 text-right" : "mr-8"}>
      <p className="label-mono mb-1">{role === "user" ? t.ai.you : t.ai.studio}</p>
      <div
        className={
          role === "user"
            ? "inline-block bg-bg-accent/40 px-4 py-3 text-left text-sm whitespace-pre-wrap"
            : "border border-line bg-bg-tertiary px-4 py-3 text-sm text-ink-secondary whitespace-pre-wrap"
        }
      >
        {role === "assistant" ? renderText(text) : text}
      </div>
    </div>
  );
}
