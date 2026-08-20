"use client";

import { Stage, Layer, Image as KImage, Group } from "react-konva";
import { useEffect, useRef, useState } from "react";
import type Konva from "konva";

function useHtmlImage(src: string | null) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!src) return;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => setImage(img);
  }, [src]);
  return image;
}

export function CanvasEditor({
  bodySrc,
  designSrc,
  opacity,
  rotation,
  scale,
  flip,
  registerExport,
}: {
  bodySrc: string;
  designSrc: string;
  opacity: number;
  rotation: number;
  scale: number;
  flip: boolean;
  registerExport: (fn: () => Promise<Blob | null>) => void;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const [size, setSize] = useState({ w: 600, h: 700 });
  const body = useHtmlImage(bodySrc);
  const design = useHtmlImage(designSrc);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setSize({ w: el.clientWidth, h: Math.max(480, el.clientHeight) });
    });
    ro.observe(el);
    setSize({ w: el.clientWidth, h: Math.max(480, el.clientHeight) });
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    registerExport(async () => {
      const uri = stageRef.current?.toDataURL({ pixelRatio: 2 });
      if (!uri) return null;
      const res = await fetch(uri);
      return res.blob();
    });
  }, [registerExport]);

  return (
    <div ref={wrap} className="h-full w-full">
      <Stage width={size.w} height={size.h} ref={stageRef}>
        <Layer>
          {body && (
            <KImage
              image={body}
              width={size.w}
              height={size.h}
              crop={undefined}
            />
          )}
          {design && (
            <Group
              x={size.w / 2}
              y={size.h / 2}
              offsetX={90}
              offsetY={90}
              draggable
              rotation={rotation}
              scaleX={(flip ? -1 : 1) * scale}
              scaleY={scale}
              opacity={opacity}
            >
              <KImage
                image={design}
                width={180}
                height={180}
                globalCompositeOperation="multiply"
              />
            </Group>
          )}
        </Layer>
      </Stage>
    </div>
  );
}
