import type { DrawPath } from "@/lib/tryout/types";

function paintPaths(ctx: CanvasRenderingContext2D, paths: DrawPath[], fill: string, erase: string) {
  paths.forEach((path) => {
    if (path.type === "brush" || path.type === "eraser") {
      ctx.strokeStyle = path.type === "eraser" ? erase : fill;
      ctx.lineWidth = path.brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      if (path.points.length < 4) return;
      ctx.beginPath();
      ctx.moveTo(path.points[0], path.points[1]);
      for (let i = 2; i < path.points.length; i += 2) ctx.lineTo(path.points[i], path.points[i + 1]);
      ctx.stroke();
      return;
    }
    ctx.fillStyle = fill;
    if (path.type === "rectangle") {
      ctx.fillRect(path.x, path.y, path.width, path.height);
      return;
    }
    ctx.beginPath();
    ctx.ellipse(
      path.x + path.width / 2,
      path.y + path.height / 2,
      Math.abs(path.width / 2),
      Math.abs(path.height / 2),
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  });
}

/** Black = keep, white = tattoo area. */
export function generateMask(drawingPaths: DrawPath[], imageWidth: number, imageHeight: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = imageWidth;
  canvas.height = imageHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, imageWidth, imageHeight);
  paintPaths(ctx, drawingPaths, "#FFFFFF", "#000000");
  return canvas.toDataURL("image/png");
}

/** OpenAI edits: fully transparent pixels are the region to change. */
export function generateOpenAIMask(drawingPaths: DrawPath[], imageWidth: number, imageHeight: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = imageWidth;
  canvas.height = imageHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, imageWidth, imageHeight);
  ctx.globalCompositeOperation = "destination-out";
  paintPaths(
    ctx,
    drawingPaths.filter((p) => p.type !== "eraser"),
    "#ffffff",
    "#ffffff",
  );
  ctx.globalCompositeOperation = "source-over";
  paintPaths(
    ctx,
    drawingPaths.filter((p) => p.type === "eraser"),
    "#000000",
    "#000000",
  );
  return canvas.toDataURL("image/png");
}

export function hasMarkedArea(paths: DrawPath[]) {
  return paths.some((p) => (p.type === "brush" || p.type === "eraser" ? p.points.length >= 4 : Math.abs(p.width) > 8 && Math.abs(p.height) > 8));
}
