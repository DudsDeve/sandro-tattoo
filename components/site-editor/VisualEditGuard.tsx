"use client";

import { useEffect } from "react";
import { useSiteEditor } from "@/components/site-editor/SiteContentProvider";

/** Blocks navigation / Lenis quirks while visual editing inside the iframe. */
export function VisualEditGuard() {
  const { visualEdit } = useSiteEditor();

  useEffect(() => {
    if (!visualEdit) return;

    function onClickCapture(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const editable = target.closest("[data-site-edit]");
      if (editable) return;
      // Prevent leaving the page via links while editing
      const link = target.closest("a");
      if (link) {
        e.preventDefault();
        e.stopPropagation();
      }
    }

    document.addEventListener("click", onClickCapture, true);
    return () => document.removeEventListener("click", onClickCapture, true);
  }, [visualEdit]);

  if (!visualEdit) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[200] border-b border-[#4c5634] bg-[#0a0a0a]/95 px-4 py-2 text-center font-mono text-[10px] tracking-[0.2em] text-[#8b9a6b]">
      MODO EDIÇÃO VISUAL · clique em textos, imagens ou vídeos
    </div>
  );
}
