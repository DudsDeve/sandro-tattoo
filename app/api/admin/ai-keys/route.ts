import { NextResponse } from "next/server";
import { aiKeyStatus, saveGeminiApiKey, saveTryoutModelId } from "@/lib/tryout/keys";
import { AI_MODELS, isModelId } from "@/lib/tryout/models";

export async function GET() {
  const status = await aiKeyStatus();
  return NextResponse.json({
    ...status,
    models: AI_MODELS.map((m) => ({ id: m.id, name: m.name, description: m.description })),
  });
}

export async function PUT(req: Request) {
  const body = (await req.json()) as { geminiApiKey?: string; tryoutModelId?: string };
  const key = body.geminiApiKey?.trim();
  const modelId = body.tryoutModelId?.trim();

  if (modelId) {
    if (!isModelId(modelId)) {
      return NextResponse.json({ error: "Modelo inválido" }, { status: 400 });
    }
    await saveTryoutModelId(modelId);
  }

  if (key) {
    await saveGeminiApiKey(key);
  }

  if (!key && !modelId) {
    return NextResponse.json({ error: "Nada para salvar" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, ...(await aiKeyStatus()) });
}
