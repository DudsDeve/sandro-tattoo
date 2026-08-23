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
    const ok = type.startsWith("image/") || /\.(jpe?g|png|webp|gif)$/i.test(file.name);
    if (!ok) {
      return NextResponse.json({ error: "Envie uma imagem" }, { status: 400 });
    }
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "Imagem até 8MB." }, { status: 400 });
    }

    const url = await uploadMedia(file, "booking");
    return NextResponse.json({ url });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Falha no upload";
    console.error("[booking/upload]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
