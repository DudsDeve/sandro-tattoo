"use client";

import { cn } from "@/lib/utils";
import type { Tool } from "@/lib/tryout/types";
import { useT } from "@/lib/i18n/LanguageProvider";

function RectangleIcon() {
  return (
    <svg width="36" height="28" viewBox="0 0 36 28" fill="none" aria-hidden>
      <rect x="3.5" y="5.5" width="29" height="17" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function EllipseIcon() {
  return (
    <svg width="36" height="28" viewBox="0 0 36 28" fill="none" aria-hidden>
      <ellipse cx="18" cy="14" rx="14" ry="8.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function DrawingTools({ tool, onTool }: { tool: Tool; onTool: (t: Tool) => void }) {
  const t = useT();
  const tools: { id: Tool; label: string; icon: typeof RectangleIcon }[] = [
    { id: "rectangle", label: t.tryout.rectangle, icon: RectangleIcon },
    { id: "ellipse", label: t.tryout.ellipse, icon: EllipseIcon },
  ];
  return (
    <div className="flex flex-row items-stretch gap-2">
      {tools.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onTool(item.id)}
            aria-label={item.label}
            aria-pressed={tool === item.id}
            className={cn(
              "flex flex-1 items-center justify-center border py-3",
              tool === item.id ? "border-line-accent bg-bg-accent text-ink" : "border-line text-ink-secondary",
            )}
          >
            <Icon />
          </button>
        );
      })}
    </div>
  );
}
