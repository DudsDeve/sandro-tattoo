import * as THREE from "three";

export const GLOBE_R = 100;

export function latLngTo3D(lat: number, lng: number, radius = GLOBE_R) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

export function easeInOutQuart(t: number) {
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
}

export function normAngle(from: number, to: number) {
  const d = (((to - from) % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
  return from + d;
}

type Ring = number[][];

interface TopoJSON {
  transform: { scale: [number, number]; translate: [number, number] };
  arcs: [number, number][][];
  objects: Record<
    string,
    {
      type: string;
      geometries?: Array<{ type: string; arcs: unknown }>;
      arcs?: unknown;
    }
  >;
}

export function decodeTopoJSON(topo: TopoJSON, objName: string): Ring[] {
  const {
    scale: [sx, sy],
    translate: [tx, ty],
  } = topo.transform;

  const arcs = topo.arcs.map((arc) => {
    let px = 0;
    let py = 0;
    return arc.map(([dx, dy]) => {
      px += dx;
      py += dy;
      return [px * sx + tx, py * sy + ty] as [number, number];
    });
  });

  function resolveRing(indices: number[]) {
    const coords: [number, number][] = [];
    indices.forEach((idx) => {
      const forward = idx >= 0;
      const arc = forward ? arcs[idx] : arcs[~idx].slice().reverse();
      const start = coords.length > 0 ? 1 : 0;
      for (let i = start; i < arc.length; i++) coords.push(arc[i]);
    });
    return coords;
  }

  const polygons: Ring[] = [];

  function walk(geom: { type: string; arcs?: unknown; geometries?: Array<{ type: string; arcs: unknown }> }) {
    if (geom.type === "Polygon") {
      polygons.push(resolveRing((geom.arcs as number[][])[0]));
    } else if (geom.type === "MultiPolygon") {
      (geom.arcs as number[][][]).forEach((poly) => polygons.push(resolveRing(poly[0])));
    } else if (geom.type === "GeometryCollection" && geom.geometries) {
      geom.geometries.forEach(walk);
    }
  }

  walk(topo.objects[objName] as { type: string; geometries?: Array<{ type: string; arcs: unknown }>; arcs?: unknown });
  return polygons;
}

export function generateEarthTexture(polygons: Ring[]) {
  const W = 2048;
  const H = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D indisponível");

  ctx.fillStyle = "#060606";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "rgba(76, 86, 52, 0.04)";
  for (let la = -80; la <= 80; la += 8) {
    for (let lo = -180; lo < 180; lo += 8) {
      const x = ((lo + 180) / 360) * W;
      const y = ((90 - la) / 180) * H;
      ctx.beginPath();
      ctx.arc(x, y, 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  polygons.forEach((coords) => {
    ctx.beginPath();
    coords.forEach(([lng, lat], i) => {
      const x = ((lng + 180) / 360) * W;
      const y = ((90 - lat) / 180) * H;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = "rgba(76, 86, 52, 0.18)";
    ctx.fill();
    ctx.strokeStyle = "rgba(139, 154, 107, 0.45)";
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  return new THREE.CanvasTexture(canvas);
}
