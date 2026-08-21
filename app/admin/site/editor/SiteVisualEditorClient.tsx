"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MediaField } from "@/components/admin/MediaField";
import { getSitePage } from "@/lib/site-editor/registry";
import type { SiteFieldType } from "@/lib/site-editor/types";

type Selection = {
  fieldId: string;
  fieldType: SiteFieldType;
  label: string;
  value: string;
};

export default function SiteVisualEditorPage() {
  const search = useSearchParams();
  const path = search.get("path") || "/";
  const page = useMemo(() => getSitePage(path), [path]);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [selection, setSelection] = useState<Selection | null>(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [device, setDevice] = useState<"desktop" | "tablet">("desktop");
  const [content, setContent] = useState<Record<string, string>>({});

  const iframeSrc = `${path === "/" ? "/" : path}?visualEdit=1`;

  useEffect(() => {
    void fetch("/api/admin/site")
      .then((r) => r.json())
      .then((d: { siteContent?: Record<string, string> }) => setContent(d.siteContent || {}))
      .catch(() => undefined);
  }, []);

  const pushToIframe = useCallback((fieldId: string, value: string) => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "site-edit-update", fieldId, value },
      window.location.origin,
    );
  }, []);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data as {
        type?: string;
        fieldId?: string;
        fieldType?: SiteFieldType;
        label?: string;
        value?: string;
      };
      if (data?.type === "site-edit-select" && data.fieldId) {
        setSelection({
          fieldId: data.fieldId,
          fieldType: data.fieldType || "text",
          label: data.label || data.fieldId,
          value: data.value || "",
        });
        setDraft(data.value || "");
        setMsg("");
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  async function saveField(value: string) {
    if (!selection) return;
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/site", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fieldId: selection.fieldId, value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao salvar");
      pushToIframe(selection.fieldId, value);
      setSelection({ ...selection, value });
      setContent((prev) => ({ ...prev, [selection.fieldId]: value }));
      setMsg("Salvo no site.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  function applyLive(value: string) {
    setDraft(value);
    if (selection) pushToIframe(selection.fieldId, value);
  }

  if (!page) {
    return (
      <div className="space-y-4 p-8">
        <p className="text-[#a09b95]">Página não encontrada no registro do editor.</p>
        <Link href="/admin/site" className="text-[#8b9a6b]">
          ← Voltar
        </Link>
      </div>
    );
  }

  const isMedia = selection?.fieldType === "image" || selection?.fieldType === "video";

  return (
    <div className="flex h-[calc(100vh-4.5rem)] flex-col bg-[#0a0a0a]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1a1a1a] bg-black px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/site" className="text-sm text-[#a09b95] hover:text-white">
            ← Site
          </Link>
          <span className="text-[#5c5955]">/</span>
          <p className="font-serif text-lg">{page.label}</p>
          <span className="font-mono text-[0.65rem] text-[#8b9a6b]">{page.path}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDevice("desktop")}
            className={`px-3 py-1.5 text-xs ${device === "desktop" ? "bg-[#4c5634] text-white" : "text-[#a09b95]"}`}
          >
            Desktop
          </button>
          <button
            type="button"
            onClick={() => setDevice("tablet")}
            className={`px-3 py-1.5 text-xs ${device === "tablet" ? "bg-[#4c5634] text-white" : "text-[#a09b95]"}`}
          >
            Tablet
          </button>
          <a href={path} target="_blank" rel="noreferrer" className="ml-2 text-xs text-[#8b9a6b] underline">
            Abrir página
          </a>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 items-stretch justify-center bg-[#111] p-3">
          <div
            className={`overflow-hidden border border-[#1a1a1a] bg-black shadow-2xl transition-all ${
              device === "tablet" ? "w-[820px] max-w-full" : "w-full"
            }`}
          >
            <iframe
              ref={iframeRef}
              title={`Editar ${page.label}`}
              src={iframeSrc}
              className="h-full min-h-[calc(100vh-8rem)] w-full bg-black"
            />
          </div>
        </div>

        <aside className="flex w-full max-w-sm shrink-0 flex-col border-l border-[#1a1a1a] bg-[#0a0a0a]">
          <div className="border-b border-[#1a1a1a] px-4 py-3">
            <p className="font-mono text-[0.65rem] tracking-[0.18em] text-[#8b9a6b]">INSPECTOR</p>
            <p className="mt-1 text-sm text-[#a09b95]">Clique em um elemento no preview para editar.</p>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {!selection && (
              <div className="space-y-2">
                <p className="text-sm text-[#5c5955]">Campos desta página:</p>
                <ul className="space-y-1">
                  {page.fields.map((f) => (
                    <li key={f.id}>
                      <button
                        type="button"
                        className="w-full border border-[#1a1a1a] px-3 py-2 text-left text-sm text-[#a09b95] hover:border-[#4c5634] hover:text-white"
                        onClick={() => {
                          const value = content[f.id] ?? f.defaultValue;
                          setSelection({
                            fieldId: f.id,
                            fieldType: f.type,
                            label: f.label,
                            value,
                          });
                          setDraft(value);
                          iframeRef.current?.contentWindow?.postMessage(
                            { type: "site-edit-select", fieldId: f.id },
                            window.location.origin,
                          );
                        }}
                      >
                        <span className="font-mono text-[10px] text-[#8b9a6b]">{f.type}</span>
                        <br />
                        {f.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selection && (
              <div className="space-y-4">
                <div>
                  <p className="font-mono text-[0.65rem] tracking-[0.18em] text-[#8b9a6b]">
                    {selection.fieldType.toUpperCase()}
                  </p>
                  <p className="mt-1 font-serif text-xl">{selection.label}</p>
                  <p className="mt-1 font-mono text-[10px] text-[#5c5955]">{selection.fieldId}</p>
                </div>

                {isMedia ? (
                  <MediaField
                    label={selection.fieldType === "video" ? "Vídeo" : "Imagem"}
                    value={draft}
                    accept={selection.fieldType === "video" ? "video/*" : "image/*"}
                    onChange={(url) => {
                      applyLive(url);
                      void saveField(url);
                    }}
                  />
                ) : selection.fieldType === "textarea" ? (
                  <textarea
                    className="min-h-[160px] w-full border border-[#1a1a1a] bg-black px-3 py-3 text-sm"
                    value={draft}
                    onChange={(e) => applyLive(e.target.value)}
                  />
                ) : (
                  <input
                    className="w-full border border-[#1a1a1a] bg-black px-3 py-3 text-sm"
                    value={draft}
                    onChange={(e) => applyLive(e.target.value)}
                  />
                )}

                {!isMedia && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void saveField(draft)}
                    className="w-full bg-[#4c5634] px-4 py-3 text-sm text-white"
                  >
                    {saving ? "Salvando…" : "Salvar alteração"}
                  </button>
                )}

                <button
                  type="button"
                  className="w-full border border-[#1a1a1a] px-4 py-2 text-xs text-[#a09b95]"
                  onClick={() => {
                    setSelection(null);
                    setDraft("");
                  }}
                >
                  Limpar seleção
                </button>

                {msg && <p className="text-sm text-[#8b9a6b]">{msg}</p>}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
