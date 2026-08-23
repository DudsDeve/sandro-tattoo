"use client";

import { cn } from "@/lib/utils";
import type { Tool } from "@/lib/tryout/types";
import { useT } from "@/lib/i18n/LanguageProvider";

export function DrawingTools({ tool, onTool }: { tool: Tool; onTool: (t: Tool) => void }) {
  const t = useT();
  const tools: { id: Tool; label: string }[] = [
    { id: "rectangle", label: t.tryout.rectangle },
    { id: "ellipse", label: t.tryout.ellipse },
  ];
  return (
    <div className="flex flex-col gap-2">
      {tools.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onTool(item.id)}
          className={cn(
            "border px-3 py-2 text-sm",
            tool === item.id ? "border-line-accent bg-bg-accent text-ink" : "border-line text-ink-secondary",
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function BrushSettings({
  onUndo,
  onRedo,
  onClear,
  canUndo,
  canRedo,
}: {
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  canUndo: boolean;
  canRedo: boolean;
}) {
  const t = useT();
  return (
    <div className="mt-6 flex flex-col gap-3">
      <button type="button" disabled={!canUndo} onClick={onUndo} className="text-sm text-moss disabled:text-ink-muted">
        {t.tryout.undo}
      </button>
      <button type="button" disabled={!canRedo} onClick={onRedo} className="text-sm text-moss disabled:text-ink-muted">
        {t.tryout.redo}
      </button>
      <button type="button" onClick={onClear} className="text-sm text-error">
        {t.tryout.clear}
      </button>
    </div>
  );
}
