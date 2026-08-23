import { promises as fs } from "fs";
import path from "path";
import { del, put } from "@vercel/blob";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";

export type MediaFolder =
  | "blog"
  | "gallery"
  | "artists"
  | "categories"
  | "testimonials"
  | "site"
  | "booking"
  | "tryout"
  | "wishlist"
  | "uploads";

const FOLDERS = new Set<string>([
  "blog",
  "gallery",
  "artists",
  "categories",
  "testimonials",
  "site",
  "booking",
  "tryout",
  "wishlist",
  "uploads",
]);

function mediaBucket() {
  return process.env.SUPABASE_MEDIA_BUCKET || "media";
}

export function normalizeMediaFolder(value?: string | null): MediaFolder {
  const raw = (value || "uploads").trim().toLowerCase();
  return FOLDERS.has(raw) ? (raw as MediaFolder) : "uploads";
}

function extFromName(name: string, contentType: string) {
  const fromName = name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]+$/.test(fromName) && fromName.length <= 5) return fromName;
  if (contentType.includes("jpeg")) return "jpg";
  if (contentType.includes("png")) return "png";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("gif")) return "gif";
  if (contentType.includes("mp4")) return "mp4";
  if (contentType.includes("webm")) return "webm";
  return "bin";
}

function mimeFromExt(ext: string, fallback: string) {
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    avif: "image/avif",
    mp4: "video/mp4",
    webm: "video/webm",
    mov: "video/quicktime",
  };
  return map[ext] || fallback || "application/octet-stream";
}

function uniqueName(original: string, contentType: string) {
  const ext = extFromName(original, contentType);
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
}

export function isStoredMediaUrl(url: string) {
  return (
    url.includes("/storage/v1/object/public/") ||
    url.includes("supabase.co") ||
    url.includes("blob.vercel-storage.com")
  );
}

function parseSupabaseObjectPath(url: string): { bucket: string; objectPath: string } | null {
  try {
    const u = new URL(url);
    const marker = "/storage/v1/object/public/";
    const i = u.pathname.indexOf(marker);
    if (i < 0) return null;
    const rest = u.pathname.slice(i + marker.length);
    const slash = rest.indexOf("/");
    if (slash < 0) return null;
    return { bucket: decodeURIComponent(rest.slice(0, slash)), objectPath: decodeURIComponent(rest.slice(slash + 1)) };
  } catch {
    return null;
  }
}

async function uploadToSupabase(bytes: Buffer, objectPath: string, contentType: string): Promise<string> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase Storage não configurado (URL + SUPABASE_SERVICE_ROLE_KEY).");

  const bucket = mediaBucket();
  const { error } = await supabase.storage.from(bucket).upload(objectPath, new Uint8Array(bytes), {
    contentType,
    upsert: true,
  });
  if (error) {
    throw new Error(`Supabase Storage: ${error.message}. Confira o bucket público "${bucket}".`);
  }
  const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
  return data.publicUrl;
}

async function uploadToBlob(bytes: Buffer, objectPath: string, contentType: string): Promise<string> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN ausente.");
  }
  const blob = await put(objectPath, bytes, { access: "public", contentType });
  return blob.url;
}

async function uploadLocal(bytes: Buffer, filename: string): Promise<string> {
  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, filename), bytes);
  return `/uploads/${filename}`;
}

/** Bytes → URL pública do bucket (Supabase Storage). O banco só guarda essa URL. */
export async function persistMediaBytes(
  bytes: Buffer,
  filename: string,
  contentType: string,
  folder: MediaFolder = "uploads",
): Promise<string> {
  const ext = extFromName(filename, contentType);
  const mime = mimeFromExt(ext, contentType);
  const safe = uniqueName(filename, mime);
  const objectPath = `${folder}/${safe}`;
  const onVercel = Boolean(process.env.VERCEL);

  if (isSupabaseConfigured()) {
    return uploadToSupabase(bytes, objectPath, mime);
  }

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return uploadToBlob(bytes, objectPath, mime);
  }

  if (onVercel) {
    throw new Error(
      "Em produção as imagens vão para o bucket. Configure SUPABASE_SERVICE_ROLE_KEY (Storage) ou BLOB_READ_WRITE_TOKEN.",
    );
  }

  return uploadLocal(bytes, safe);
}

export async function persistMediaFile(file: File, folder: MediaFolder = "uploads"): Promise<string> {
  const bytes = Buffer.from(await file.arrayBuffer());
  const contentType = file.type || "application/octet-stream";
  return persistMediaBytes(bytes, file.name, contentType, folder);
}

/** Data URL, URL temporária da IA, ou já-bucket → sempre URL estável do storage. */
export async function persistGeneratedImage(
  source: string,
  folder: MediaFolder,
  filenameHint = "generated.png",
): Promise<string> {
  if (!source) throw new Error("Imagem vazia.");
  if (isStoredMediaUrl(source) && !source.startsWith("data:")) return source;

  if (source.startsWith("data:")) {
    const match = source.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) throw new Error("Data URL inválida.");
    const bytes = Buffer.from(match[2], "base64");
    const mime = match[1];
    const ext = mime.includes("jpeg") || mime.includes("jpg") ? "jpg" : mime.includes("webp") ? "webp" : "png";
    const base = filenameHint.replace(/\.[^.]+$/, "");
    return persistMediaBytes(bytes, `${base}.${ext}`, mime, folder);
  }

  if (source.startsWith("http://") || source.startsWith("https://")) {
    const res = await fetch(source);
    if (!res.ok) throw new Error("Não foi possível baixar a imagem gerada.");
    const type = res.headers.get("content-type") || "image/png";
    const bytes = Buffer.from(await res.arrayBuffer());
    const ext = extFromName(filenameHint, type);
    return persistMediaBytes(bytes, filenameHint.endsWith(`.${ext}`) ? filenameHint : `${filenameHint}.${ext}`, type, folder);
  }

  if (source.startsWith("/uploads/")) {
    const local = path.join(process.cwd(), "public", source.replace(/^\/+/, ""));
    try {
      const bytes = await fs.readFile(local);
      return persistMediaBytes(bytes, path.basename(local), "application/octet-stream", folder);
    } catch {
      return source;
    }
  }

  return source;
}

export async function deleteStoredMedia(url: string) {
  if (!url) return;
  if (url.includes("vercel-storage.com") && process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      await del(url);
    } catch {
      /* ignore */
    }
  }
  const parsed = parseSupabaseObjectPath(url);
  if (parsed && isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      await supabase.storage.from(parsed.bucket).remove([parsed.objectPath]);
    }
  }
}
