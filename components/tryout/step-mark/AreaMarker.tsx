"use client";

import { useEffect, useRef, useState } from "react";
import { Ellipse, Image as KImage, Layer, Rect, Stage } from "react-konva";
import { isMarkShape, type DrawPath, type Tool } from "@/lib/tryout/types";

function shapeFrom(tool: Tool, start: { x: number; y: number }, p: { x: number; y: number }): DrawPath {
  const kind = tool === "ellipse" ? "ellipse" : "rectangle";
  return {
    type: kind,
    x: Math.min(start.x, p.x),
    y: Math.min(start.y, p.y),
    width: Math.abs(p.x - start.x),
    height: Math.abs(p.y - start.y),
  };
}

function MarkShape({ path }: { path: DrawPath }) {
  if (!isMarkShape(path)) return null;
  if (path.type === "rectangle") {
    return (
      <Rect
        x={path.x}
        y={path.y}
        width={path.width}
        height={path.height}
        fill="#4C5634"
        opacity={0.35}
        stroke="#8b9a6b"
        strokeWidth={1.5}
      />
    );
  }
  return (
    <Ellipse
      x={path.x + path.width / 2}
      y={path.y + path.height / 2}
      radiusX={Math.abs(path.width / 2)}
      radiusY={Math.abs(path.height / 2)}
      fill="#4C5634"
      opacity={0.35}
      stroke="#8b9a6b"
      strokeWidth={1.5}
    />
  );
}

export function AreaMarker({
  photo,
  paths,
  tool,
  onSet,
  onSize,
}: {
  photo: string;
  paths: DrawPath[];
  tool: Tool;
  onSet: (path: DrawPath | null) => void;
  onSize?: (size: { w: number; h: number }) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const onSizeRef = useRef(onSize);
  onSizeRef.current = onSize;
  const [size, setSize] = useState({ w: 480, h: 480 });
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [draft, setDraft] = useState<DrawPath | null>(null);
  const drawing = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const draftRef = useRef<DrawPath | null>(null);
  const stageRef = useRef<import("konva/lib/Stage").Stage | null>(null);

  function setLive(path: DrawPath | null) {
    draftRef.current = path;
    setDraft(path);
  }

  useEffect(() => {
    const img = new window.Image();
    let ro: ResizeObserver | null = null;

    const fit = () => {
      const boxW = Math.max(160, wrapRef.current?.clientWidth || 480);
      const boxH = Math.max(160, wrapRef.current?.clientHeight || 480);
      const iw = img.naturalWidth || img.width || 1;
      const ih = img.naturalHeight || img.height || 1;
      const scale = Math.min(boxW / iw, boxH / ih);
      const next = { w: Math.round(iw * scale), h: Math.round(ih * scale) };
      setSize(next);
      onSizeRef.current?.(next);
    };

    img.onload = () => {
      setImage(img);
      fit();
      if (wrapRef.current && typeof ResizeObserver !== "undefined") {
        ro = new ResizeObserver(fit);
        ro.observe(wrapRef.current);
      }
    };
    img.src = photo;
    return () => {
      ro?.disconnect();
    };
  }, [photo]);

  function pointerFromEvent(clientX: number, clientY: number) {
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };
    const rect = stage.container().getBoundingClientRect();
    const sx = stage.width() / Math.max(1, rect.width);
    const sy = stage.height() / Math.max(1, rect.height);
    return { x: (clientX - rect.left) * sx, y: (clientY - rect.top) * sy };
  }

  useEffect(() => {
    const move = (e: MouseEvent | TouchEvent) => {
      if (!drawing.current) return;
      const pt = "touches" in e ? e.touches[0] : e;
      if (!pt) return;
      if ("cancelable" in e && e.cancelable) e.preventDefault();
      setLive(shapeFrom(tool, start.current, pointerFromEvent(pt.clientX, pt.clientY)));
    };
    const up = () => {
      if (!drawing.current) return;
      drawing.current = false;
      const current = draftRef.current;
      draftRef.current = null;
      setDraft(null);
      const ok = current && isMarkShape(current) && Math.abs(current.width) > 8 && Math.abs(current.height) > 8;
      onSet(ok ? current : null);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };
  }, [tool, onSet]);

  const visible = draft ?? paths[0] ?? null;

  return (
    <div
      ref={wrapRef}
      className="flex h-[min(70svh,36rem)] w-full items-center justify-center overflow-hidden rounded-[1.5rem] border border-line bg-black lg:h-[min(72svh,40rem)]"
    >
      <Stage
        ref={(node) => {
          stageRef.current = node;
        }}
        width={size.w}
        height={size.h}
        onMouseDown={(e) => {
          const p = e.target.getStage()?.getPointerPosition() ?? { x: 0, y: 0 };
          drawing.current = true;
          start.current = p;
          onSet(null);
          setLive(shapeFrom(tool, p, p));
        }}
        onTouchStart={(e) => {
          const touch = e.evt.touches[0];
          if (!touch) return;
          const p = pointerFromEvent(touch.clientX, touch.clientY);
          drawing.current = true;
          start.current = p;
          onSet(null);
          setLive(shapeFrom(tool, p, p));
        }}
      >
        <Layer>
          {image && <KImage image={image} width={size.w} height={size.h} />}
          {visible ? <MarkShape path={visible} /> : null}
        </Layer>
      </Stage>
    </div>
  );
}

export function scalePaths(paths: DrawPath[], fromW: number, fromH: number, toW: number, toH: number): DrawPath[] {
  const sx = toW / fromW;
  const sy = toH / fromH;
  return paths.map((path) => {
    if (path.type === "brush" || path.type === "eraser") {
      return {
        ...path,
        brushSize: path.brushSize * ((sx + sy) / 2),
        points: path.points.map((v, i) => (i % 2 === 0 ? v * sx : v * sy)),
      };
    }
    if (!isMarkShape(path)) return path;
    return { ...path, x: path.x * sx, y: path.y * sy, width: path.width * sx, height: path.height * sy };
  });
}
