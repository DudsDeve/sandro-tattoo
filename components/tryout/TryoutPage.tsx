"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { StepIndicator } from "@/components/tryout/StepIndicator";
import { TryoutDisclaimer, TryoutHeader } from "@/components/tryout/shared/TryoutHeader";
import { BodyUpload } from "@/components/tryout/step-upload/BodyUpload";
import { BrushSettings, DrawingTools } from "@/components/tryout/step-mark/DrawingTools";
import { DesignPicker } from "@/components/tryout/step-design/DesignPicker";
import { GeneratingAnimation } from "@/components/tryout/step-generate/ModelSelector";
import { CompareSlider } from "@/components/tryout/step-preview/CompareSlider";
import { useDrawingCanvas } from "@/hooks/useDrawingCanvas";
import { useImageGeneration } from "@/hooks/useImageGeneration";
import { useTryoutFlow } from "@/hooks/useTryoutFlow";
import { generateOpenAIMask, hasMarkedArea } from "@/lib/tryout/mask-utils";
import { drawToSize, makeSquare, makeSquareMask, placeDesignInMask, urlToDataUrl } from "@/lib/tryout/image-utils";
import { DEFAULT_TRYOUT_MODEL } from "@/lib/tryout/models";
import { saveTryoutToSession } from "@/lib/tryout/session-storage";
import type { TryoutDesign } from "@/lib/tryout/types";
import { LanguageProvider, useT } from "@/lib/i18n/LanguageProvider";
import { TRYOUT_LOCALE_STORAGE_KEY } from "@/lib/i18n/config";
import { UsageMeter } from "@/components/tryout/auth/UsageMeter";
import { EmailInput } from "@/components/tryout/auth/EmailInput";
import { ConfirmationSent } from "@/components/tryout/auth/ConfirmationSent";
import { LimitReached } from "@/components/tryout/auth/LimitReached";
import { isUnlimitedEmail } from "@/lib/tryon-auth/constants";

const AreaMarker = dynamic(() => import("@/components/tryout/step-mark/AreaMarker").then((m) => m.AreaMarker), {
  ssr: false,
});

export function TryoutPage() {
  return (
    <LanguageProvider storageKey={TRYOUT_LOCALE_STORAGE_KEY} defaultLocale="en" persistHtml={false}>
      <TryoutPageInner />
    </LanguageProvider>
  );
}

function TryoutPageInner() {
  const t = useT();
  const router = useRouter();
  const flow = useTryoutFlow();
  const draw = useDrawingCanvas();
  const gen = useImageGeneration();
  const [photo, setPhoto] = useState("");
  const [stage, setStage] = useState({ w: 1, h: 1 });
  const [design, setDesign] = useState<TryoutDesign | null>(null);
  const [custom, setCustom] = useState(false);
  const [preview, setPreview] = useState("");
  const [modelUsed, setModelUsed] = useState(DEFAULT_TRYOUT_MODEL);
  const [authModal, setAuthModal] = useState<"email" | "sent" | "limit" | null>(null);
  const [gateEmail, setGateEmail] = useState("");
  const [devConfirmUrl, setDevConfirmUrl] = useState("");
  const [limitInfo, setLimitInfo] = useState({ resetsAt: "", email: "" });
  const [usage, setUsage] = useState<{ remaining: number; used: number; unlimited: boolean } | null>(null);
  const pendingGenerate = useRef(false);
  const pendingDesign = useRef<TryoutDesign | null>(null);

  async function refreshUsage() {
    const res = await fetch("/api/tryon-auth/check", { cache: "no-store" });
    const data = (await res.json()) as {
      authenticated?: boolean;
      remainingUses?: number;
      usesThisMonth?: number;
      isUnlimited?: boolean;
      canUse?: boolean;
      email?: string;
      resetsAt?: string;
    };
    if (data.authenticated) {
      setUsage({
        remaining: data.remainingUses ?? 0,
        used: data.usesThisMonth ?? 0,
        unlimited: Boolean(data.isUnlimited),
      });
    }
    return data;
  }

  async function ensureCanGenerate() {
    const data = await refreshUsage();
    if (data.authenticated && data.canUse) return true;
    pendingGenerate.current = true;
    if (data.authenticated && !data.canUse) {
      setLimitInfo({ resetsAt: data.resetsAt ?? "", email: data.email ?? "" });
      setAuthModal("limit");
      return false;
    }
    setAuthModal("email");
    return false;
  }

  async function handleEmailSubmit(submittedEmail: string) {
    setGateEmail(submittedEmail);
    const res = await fetch("/api/tryon-auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: submittedEmail }),
    });
    const data = (await res.json()) as {
      status?: string;
      remainingUses?: number;
      usesThisMonth?: number;
      error?: string;
      confirmUrl?: string;
    };
    if (!res.ok) throw new Error(data.error || "Failed to register");

    if (data.status === "already_confirmed") {
      const remaining = data.remainingUses ?? 0;
      const unlimited = isUnlimitedEmail(submittedEmail);
      setUsage({
        remaining,
        used: data.usesThisMonth ?? 0,
        unlimited,
      });
      if (remaining > 0 || unlimited) {
        setAuthModal(null);
        if (pendingGenerate.current) {
          pendingGenerate.current = false;
          await doGenerate();
        }
      } else {
        setLimitInfo({ resetsAt: "", email: submittedEmail });
        setAuthModal("limit");
      }
      return;
    }

    setDevConfirmUrl(data.confirmUrl || "");
    setAuthModal("sent");
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) draw.redo();
        else draw.undo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [draw]);

  useEffect(() => {
    void refreshUsage();
  }, []);

  async function doGenerate(nextDesign?: TryoutDesign | null) {
    const chosen = nextDesign ?? pendingDesign.current ?? design;
    if (!photo || !chosen) return;
    if (stage.w < 32 || stage.h < 32) {
      gen.setError(t.tryout.remark);
      return;
    }
    const mask = generateOpenAIMask(draw.paths, stage.w, stage.h);
    const bodyFit = await drawToSize(photo, stage.w, stage.h);
    const bodySq = await makeSquare(bodyFit, 1024);
    const maskSq = await makeSquareMask(mask, 1024);
    const designData = await urlToDataUrl(chosen.imageUrl);
    const placed = await placeDesignInMask(bodySq, maskSq, designData);
    try {
      const result = await gen.generate({
        bodyImage: placed,
        maskImage: maskSq,
        designImage: designData,
        designName: chosen.name,
        designStyle: chosen.style,
        bodyPart: "only the masked region — do not switch legs or sides",
      });
      setPreview(result.imageUrl);
      if (result.model) setModelUsed(result.model);
      flow.go("preview");
      await refreshUsage();
    } catch {
      /* error already on gen.error */
    }
  }

  async function runGenerate(nextDesign?: TryoutDesign | null) {
    if (nextDesign) pendingDesign.current = nextDesign;
    const ok = await ensureCanGenerate();
    if (!ok) return;
    await doGenerate(nextDesign);
  }

  return (
    <div className="page-shell">
      <TryoutHeader />
      {usage ? (
        <UsageMeter used={usage.used} remaining={usage.remaining} isUnlimited={usage.unlimited} />
      ) : null}
      <StepIndicator current={flow.index} />

      {flow.step === "upload" && (
        <BodyUpload
          onReady={(url) => {
            setPhoto(url);
            flow.go("mark");
          }}
        />
      )}

      {flow.step === "mark" && photo && (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_18.5rem]">
          <AreaMarker
            photo={photo}
            paths={draw.paths}
            tool={draw.tool}
            onSet={draw.setMark}
            onSize={setStage}
          />
          <aside className="border border-line bg-bg-secondary p-5">
            <p className="label-mono mb-4">{t.tryout.materials}</p>
            <p className="mb-4 text-sm text-ink-secondary">{t.tryout.markHint}</p>
            <DrawingTools tool={draw.tool} onTool={draw.setTool} />
            <BrushSettings
              onUndo={draw.undo}
              onRedo={draw.redo}
              onClear={draw.clear}
              canUndo={draw.canUndo}
              canRedo={draw.canRedo}
            />
            <div className="mt-8 flex flex-col gap-3">
              <button
                type="button"
                disabled={!hasMarkedArea(draw.paths)}
                className="min-h-11 bg-bg-accent px-5 py-3 text-sm disabled:opacity-40"
                onClick={() => flow.go("design")}
              >
                {t.tryout.continue}
              </button>
              <button type="button" className="min-h-11 text-sm text-ink-secondary" onClick={() => flow.go("upload")}>
                {t.tryout.swapPhoto}
              </button>
            </div>
          </aside>
        </div>
      )}

      {flow.step === "design" && (
        <div>
          <DesignPicker
            selectedId={design?.id}
            onSelect={(d) => {
              pendingDesign.current = d;
              setDesign(d);
              setCustom(false);
            }}
            onCustom={(url, name) => {
              const customDesign: TryoutDesign = {
                id: "custom",
                name,
                imageUrl: url,
                style: "Custom",
                artistName: "",
                artistSlug: "",
              };
              pendingDesign.current = customDesign;
              setDesign(customDesign);
              setCustom(true);
              void runGenerate(customDesign);
            }}
          />
          {gen.error && <p className="mt-4 text-sm text-error">{gen.error}</p>}
          <div className="mt-8 flex gap-4">
            <button type="button" className="text-sm text-ink-secondary" onClick={() => flow.go("mark")}>
              {t.tryout.back}
            </button>
            <button
              type="button"
              disabled={!design || gen.busy}
              className="bg-bg-accent px-5 py-3 text-sm disabled:opacity-40"
              onClick={() => void runGenerate(design)}
            >
              {t.tryout.generate}
            </button>
          </div>
        </div>
      )}

      {flow.step === "preview" && preview && (
        <div className="grid gap-8 lg:grid-cols-2">
          <CompareSlider before={photo} after={preview} />
          <div>
            <p className="label-mono">{t.tryout.preview}</p>
            <h2 className="font-display mt-2 text-3xl">{design?.name}</h2>
            <p className="mt-2 text-ink-secondary">{design?.style}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href={preview} download="versus-tryout.png" className="border border-line px-5 py-3 text-center text-sm">
                {t.tryout.download}
              </a>
              {gen.error && <p className="text-sm text-error">{gen.error}</p>}
              <button
                type="button"
                className="border border-line px-5 py-3 text-sm"
                disabled={gen.busy}
                onClick={() => void runGenerate(design)}
              >
                {t.tryout.regenerate}
              </button>
              <button type="button" className="border border-line px-5 py-3 text-sm" onClick={() => flow.go("design")}>
                {t.tryout.otherDesign}
              </button>
            </div>
            <button
              type="button"
              className="mt-6 w-full bg-bg-accent px-5 py-4 text-sm"
              onClick={() => {
                saveTryoutToSession({
                  previewImageUrl: preview,
                  originalBodyImage: photo,
                  designName: design?.name ?? "",
                  designStyle: design?.style ?? "",
                  designArtistSlug: design?.artistSlug ?? "",
                  isCustomDesign: custom,
                  modelUsed,
                  timestamp: Date.now(),
                });
                router.push("/agendar");
              }}
            >
              {t.tryout.bookThis}
            </button>
          </div>
        </div>
      )}

      {gen.busy ? (
        <div className="fixed inset-0 z-[65] flex items-center justify-center bg-black/80 px-6">
          <GeneratingAnimation />
        </div>
      ) : null}

      <TryoutDisclaimer />

      {authModal ? (
        <div className="fixed inset-0 z-[70] overflow-y-auto bg-black/85 px-4 py-10">
          <button
            type="button"
            className="mx-auto mb-4 block text-sm text-ink-muted"
            onClick={() => {
              pendingGenerate.current = false;
              setAuthModal(null);
            }}
          >
            Close
          </button>
          {authModal === "email" ? <EmailInput onSubmit={handleEmailSubmit} /> : null}
          {authModal === "sent" ? (
            <ConfirmationSent
              email={gateEmail}
              onResend={() => handleEmailSubmit(gateEmail)}
              devConfirmUrl={devConfirmUrl}
            />
          ) : null}
          {authModal === "limit" ? <LimitReached resetsAt={limitInfo.resetsAt} email={limitInfo.email} /> : null}
        </div>
      ) : null}
    </div>
  );
}
