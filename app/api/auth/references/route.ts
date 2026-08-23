import { NextResponse } from "next/server";
import { listUserPins, removeUserPin, saveUserPin } from "@/lib/auth/accounts";
import { readUserSessionId } from "@/lib/auth/session";

async function currentUserId() {
  return readUserSessionId();
}

export async function GET() {
  const id = await currentUserId();
  if (!id) return NextResponse.json({ error: "Faça login para ver suas referências" }, { status: 401 });
  const pins = await listUserPins(id);
  return NextResponse.json({ pins });
}

export async function POST(req: Request) {
  const id = await currentUserId();
  if (!id) return NextResponse.json({ error: "Faça login para salvar a referência" }, { status: 401 });
  const body = (await req.json()) as { pinId?: string; title?: string; url?: string; imageUrl?: string };
  const imageUrl = body.imageUrl?.trim() || "";
  const pinId = body.pinId?.trim() || imageUrl;
  if (!imageUrl) return NextResponse.json({ error: "Imagem obrigatória" }, { status: 400 });
  const pins = await saveUserPin(id, {
    id: pinId,
    title: body.title?.trim() || "Referência",
    url: body.url?.trim() || imageUrl,
    imageUrl,
  });
  return NextResponse.json({ pins });
}

export async function DELETE(req: Request) {
  const id = await currentUserId();
  if (!id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const pinId = new URL(req.url).searchParams.get("id");
  if (!pinId) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });
  const pins = await removeUserPin(id, pinId);
  return NextResponse.json({ pins });
}
