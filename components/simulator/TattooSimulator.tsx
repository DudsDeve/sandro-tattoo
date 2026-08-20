"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { BodyUpload } from "@/components/simulator/BodyUpload";
import { DesignPicker } from "@/components/simulator/DesignPicker";
import { ControlPanel } from "@/components/simulator/ControlPanel";
import { ResultExport } from "@/components/simulator/ResultExport";
import { flashDesigns } from "@/lib/data/content";

const CanvasEditor = dynamic(
  () => import("@/components/simulator/CanvasEditor").then((m) => m.CanvasEditor),
  { ssr: false, loading: () => <div className="flex h-full items-center justify-center text-ink-muted">Carregando canvas…</div> },
);

export function TattooSimulator() {
  const [body, setBody] = useState<string | null>(null);
  const [design, setDesign] = useState<string>(flashDesigns[0].image);
  const [opacity, setOpacity] = useState(0.85);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [flip, setFlip] = useState(false);
  const exportRef = useRef<(() => Promise<Blob | null>) | null>(null);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
      <div className="min-h-[50vh] border border-line bg-bg-secondary sm:min-h-[70vh]">
        {!body ? (
          <BodyUpload onFile={setBody} />
        ) : (
          <CanvasEditor
            bodySrc={body}
            designSrc={design}
            opacity={opacity}
            rotation={rotation}
            scale={scale}
            flip={flip}
            registerExport={(fn) => {
              exportRef.current = fn;
            }}
          />
        )}
      </div>
      <div className="flex flex-col gap-6">
        <DesignPicker selected={design} onSelect={setDesign} />
        <ControlPanel
          opacity={opacity}
          rotation={rotation}
          scale={scale}
          flip={flip}
          onOpacity={setOpacity}
          onRotation={setRotation}
          onScale={setScale}
          onFlip={() => setFlip((f) => !f)}
          onResetBody={() => setBody(null)}
        />
        <ResultExport
          disabled={!body}
          onExport={async () => {
            const blob = await exportRef.current?.();
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "sandro-preview.png";
            a.click();
          }}
        />
      </div>
    </div>
  );
}
