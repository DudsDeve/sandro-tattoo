import { NextResponse } from "next/server";
import { uploadMedia } from "@/lib/cms/store";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Arquivo obrigatório" }, { status: 400 });
    }

    const type = file.type || "";
    const ok =
      type.startsWith("image/") ||
      type.startsWith("video/") ||
      /\.(jpe?g|png|webp|gif|mp4|webm|mov)$/i.test(file.name);

    if (!ok) {
      return NextResponse.json({ error: "Envie imagem ou vídeo" }, { status: 400 });
    }

    if (file.size > 12 * 1024 * 1024) {
      return NextResponse.json({ error: "Arquivo até 12MB. Comprima a foto e tente de novo." }, { status: 400 });
    }

    const url = await uploadMedia(file);
    return NextResponse.json({ url });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Falha no upload";
    console.error("[admin/upload]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
