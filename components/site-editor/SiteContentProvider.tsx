"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { resolveFieldValue } from "@/lib/site-editor/registry";
import type { SiteContentMap } from "@/lib/site-editor/types";

type Ctx = {
  content: SiteContentMap;
  visualEdit: boolean;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  get: (fieldId: string, fallback?: string) => string;
  setLocal: (fieldId: string, value: string) => void;
  ready: boolean;
};

const SiteEditorContext = createContext<Ctx | null>(null);

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContentMap>({});
  const [ready, setReady] = useState(false);
  const [visualEdit, setVisualEdit] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const enabled = params.get("visualEdit") === "1";
    setVisualEdit(enabled);
    if (enabled) {
      document.documentElement.classList.add("site-visual-edit");
    }
    return () => document.documentElement.classList.remove("site-visual-edit");
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/site-content", { cache: "no-store" });
        const data = (await res.json()) as { siteContent?: SiteContentMap };
        if (!cancelled) setContent(data.siteContent || {});
      } catch {
        /* keep defaults */
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!visualEdit) return;

    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; fieldId?: string; value?: string };
      if (data?.type === "site-edit-update" && data.fieldId && typeof data.value === "string") {
        setContent((prev) => ({ ...prev, [data.fieldId!]: data.value! }));
      }
      if (data?.type === "site-edit-select" && data.fieldId) {
        setSelectedId(data.fieldId);
      }
    }

    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: "site-edit-ready" }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, [visualEdit]);

  const get = useCallback(
    (fieldId: string, fallback?: string) => {
      const fromCms = content[fieldId];
      if (fromCms != null && fromCms !== "") return fromCms;
      if (fallback != null) return fallback;
      return resolveFieldValue(fieldId, content);
    },
    [content],
  );

  const setLocal = useCallback((fieldId: string, value: string) => {
    setContent((prev) => ({ ...prev, [fieldId]: value }));
  }, []);

  const value = useMemo(
    () => ({
      content,
      visualEdit,
      selectedId,
      setSelectedId,
      get,
      setLocal,
      ready,
    }),
    [content, visualEdit, selectedId, get, setLocal, ready],
  );

  return <SiteEditorContext.Provider value={value}>{children}</SiteEditorContext.Provider>;
}

export function useSiteEditor() {
  const ctx = useContext(SiteEditorContext);
  if (!ctx) throw new Error("useSiteEditor must be used within SiteContentProvider");
  return ctx;
}

export function useSiteValue(fieldId: string, fallback: string) {
  const { get } = useSiteEditor();
  return get(fieldId, fallback);
}
