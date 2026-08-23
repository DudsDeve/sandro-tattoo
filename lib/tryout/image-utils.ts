export function stripDataUrl(dataUrl: string) {
  return dataUrl.replace(/^data:image\/\w+;base64,/, "");
}

export function ensureDataUrl(value: string, mime = "image/png") {
  if (value.startsWith("data:")) return value;
  return `data:${mime};base64,${value}`;
}

export function resizeImage(dataUrl: string, maxDim: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const ratio = Math.min(1, maxDim / img.width, maxDim / img.height);
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(img.width * ratio));
      c.height = Math.max(1, Math.round(img.height * ratio));
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL("image/jpeg", 0.9));
    };
    img.onerror = () => reject(new Error("Falha ao ler a imagem"));
    img.src = dataUrl;
  });
}

export function drawToSize(dataUrl: string, w: number, h: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      c.getContext("2d")!.drawImage(img, 0, 0, w, h);
      resolve(c.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error("Falha ao ajustar a foto"));
    img.src = dataUrl;
  });
}

export function makeSquare(dataUrl: string, size: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = size;
      c.height = size;
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, size, size);
      const { x, y, w, h } = fitRect(img.width, img.height, size);
      ctx.drawImage(img, x, y, w, h);
      resolve(c.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error("Falha ao quadrar a imagem"));
    img.src = dataUrl;
  });
}

/** Same crop as makeSquare, but keeps mask holes (transparent = edit). Letterbox stays opaque. */
export function makeSquareMask(dataUrl: string, size: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = size;
      c.height = size;
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, size, size);
      const { x, y, w, h } = fitRect(img.width, img.height, size);
      ctx.clearRect(x, y, w, h);
      ctx.drawImage(img, x, y, w, h);
      resolve(c.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error("Falha ao quadrar a máscara"));
    img.src = dataUrl;
  });
}

function fitRect(iw: number, ih: number, size: number) {
  const scale = Math.min(size / iw, size / ih);
  const w = iw * scale;
  const h = ih * scale;
  return { x: (size - w) / 2, y: (size - h) / 2, w, h };
}

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Falha ao ler imagem"));
    img.src = src;
  });
}

/** Paste the design into the transparent mask region so the model cannot invent another motif. */
export async function placeDesignInMask(bodyUrl: string, maskUrl: string, designUrl: string): Promise<string> {
  const [body, mask, design] = await Promise.all([loadImg(bodyUrl), loadImg(maskUrl), loadImg(designUrl)]);
  const w = body.width;
  const h = body.height;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(body, 0, 0, w, h);

  const mc = document.createElement("canvas");
  mc.width = w;
  mc.height = h;
  const mctx = mc.getContext("2d")!;
  mctx.drawImage(mask, 0, 0, w, h);
  const pixels = mctx.getImageData(0, 0, w, h).data;

  let minX = w;
  let minY = h;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const a = pixels[(y * w + x) * 4 + 3];
      if (a < 128) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX <= minX || maxY <= minY) return bodyUrl;

  const boxW = maxX - minX + 1;
  const boxH = maxY - minY + 1;
  const scale = Math.max(boxW / design.width, boxH / design.height);
  const dw = design.width * scale;
  const dh = design.height * scale;
  const dx = minX + (boxW - dw) / 2;
  const dy = minY + (boxH - dh) / 2;

  const layer = document.createElement("canvas");
  layer.width = w;
  layer.height = h;
  const lctx = layer.getContext("2d")!;
  lctx.drawImage(design, dx, dy, dw, dh);
  lctx.globalCompositeOperation = "destination-in";
  const hole = document.createElement("canvas");
  hole.width = w;
  hole.height = h;
  const hctx = hole.getContext("2d")!;
  const holeData = hctx.createImageData(w, h);
  for (let i = 0; i < pixels.length; i += 4) {
    holeData.data[i] = 255;
    holeData.data[i + 1] = 255;
    holeData.data[i + 2] = 255;
    holeData.data[i + 3] = pixels[i + 3] < 128 ? 255 : 0;
  }
  hctx.putImageData(holeData, 0, 0);
  lctx.drawImage(hole, 0, 0);

  ctx.drawImage(layer, 0, 0);
  return c.toDataURL("image/png");
}

export async function urlToDataUrl(url: string): Promise<string> {
  if (url.startsWith("data:")) return url;
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Falha ao carregar o design"));
    reader.readAsDataURL(blob);
  });
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Falha no upload"));
    reader.readAsDataURL(file);
  });
}
