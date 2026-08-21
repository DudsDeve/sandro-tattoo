"use client";

import {
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";
import { getFieldDef } from "@/lib/site-editor/registry";
import { useSiteEditor } from "@/components/site-editor/SiteContentProvider";
import { cn } from "@/lib/utils";

function notifyParent(payload: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (window.parent === window) return;
  window.parent.postMessage(payload, window.location.origin);
}

function useEditableHandlers(fieldId: string) {
  const { visualEdit, selectedId, setSelectedId, get } = useSiteEditor();
  const def = getFieldDef(fieldId);

  function onClick(e: MouseEvent) {
    if (!visualEdit) return;
    e.preventDefault();
    e.stopPropagation();
    setSelectedId(fieldId);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    notifyParent({
      type: "site-edit-select",
      fieldId,
      fieldType: def?.field.type || "text",
      label: def?.field.label || fieldId,
      value: get(fieldId, def?.field.defaultValue || ""),
      pagePath: def?.page.path,
      rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
    });
  }

  return {
    visualEdit,
    selected: selectedId === fieldId,
    onClick,
    attrs: visualEdit
      ? {
          "data-site-edit": fieldId,
          "data-site-edit-type": def?.field.type || "text",
        }
      : {},
  };
}

export function EditableText({
  id,
  as: Tag = "span",
  className,
  children,
  render,
  style,
  ...rest
}: {
  id: string;
  as?: ElementType;
  className?: string;
  /** Fallback string (and default displayed value). */
  children: string;
  /** Optional custom render of the resolved value. */
  render?: (value: string) => ReactNode;
  style?: CSSProperties;
} & Omit<HTMLAttributes<HTMLElement>, "id" | "children" | "onClick">) {
  const { get } = useSiteEditor();
  const { visualEdit, selected, onClick, attrs } = useEditableHandlers(id);
  const value = get(id, children);

  return (
    <Tag
      {...rest}
      {...attrs}
      className={cn(
        className,
        visualEdit && "site-edit-target relative cursor-pointer outline-offset-2",
        visualEdit && selected && "outline outline-2 outline-[#8b9a6b]",
        visualEdit && !selected && "hover:outline hover:outline-1 hover:outline-[#4c5634]/80",
      )}
      style={style}
      onClick={onClick}
    >
      {render ? render(value) : value}
      {visualEdit && (
        <span className="pointer-events-none absolute -left-1 -top-5 z-[60] rounded bg-[#4c5634] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-white opacity-90">
          text
        </span>
      )}
    </Tag>
  );
}

export function EditableMedia({
  id,
  type,
  className,
  children,
}: {
  id: string;
  type: "image" | "video";
  className?: string;
  children: (src: string) => ReactNode;
}) {
  const { get } = useSiteEditor();
  const { visualEdit, selected, onClick, attrs } = useEditableHandlers(id);
  const def = getFieldDef(id);
  const src = get(id, def?.field.defaultValue || "");

  return (
    <div
      {...attrs}
      className={cn(
        "relative",
        className,
        visualEdit && "site-edit-target cursor-pointer outline-offset-2",
        visualEdit && selected && "outline outline-2 outline-[#8b9a6b]",
        visualEdit && !selected && "hover:outline hover:outline-1 hover:outline-[#4c5634]/80",
      )}
      onClick={onClick}
    >
      {children(src)}
      {visualEdit && (
        <span className="pointer-events-none absolute left-2 top-2 z-[60] rounded bg-[#4c5634] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-white">
          {type}
        </span>
      )}
    </div>
  );
}
