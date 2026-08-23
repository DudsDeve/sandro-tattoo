import { NextResponse } from "next/server";
import { generateWithGptImage1 } from "@/app/api/tryout/models/gpt-image-1";
import { generateWithDalle3 } from "@/app/api/tryout/models/dall-e-3";
import { generateWithDalle2 } from "@/app/api/tryout/models/dall-e-2";
import { generateWithGpt4o } from "@/app/api/tryout/models/gpt-4o";
import { generateWithGemini20, generateWithGemini25 } from "@/app/api/tryout/models/gemini";
import { generateWithImagen } from "@/lib/tryout/gemini";
import { getTryoutModelId } from "@/lib/tryout/keys";
import type { GenerateInput } from "@/lib/tryout/types";
import { findUserByEmail, logUsage, usageSnapshot } from "@/lib/tryon-auth/db";
import { persistGeneratedImage } from "@/lib/media/storage";
import { readSessionEmail } from "@/lib/tryon-auth/session";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const email = readSessionEmail(req);
    if (!email) {
      return NextResponse.json({ error: "Confirm your email to use Virtual Try-On." }, { status: 401 });
    }
    const user = await findUserByEmail(email);
    if (!user?.email_confirmed) {
      return NextResponse.json({ error: "Confirm your email to use Virtual Try-On." }, { status: 401 });
    }
    const usage = await usageSnapshot(email, user.id);
    if (!usage.canUse) {
      return NextResponse.json({ error: "Monthly try-on limit reached." }, { status: 429 });
    }

    const body = (await req.json()) as GenerateInput & { model?: string };
    const model = await getTryoutModelId();
    if (!body.bodyImage || !body.maskImage || !body.designImage) {
      return NextResponse.json({ error: "Foto, máscara e design são obrigatórios" }, { status: 400 });
    }

    const input: GenerateInput = {
      bodyImage: body.bodyImage,
      maskImage: body.maskImage,
      designImage: body.designImage,
      designName: body.designName || "custom",
      designStyle: body.designStyle || "custom",
      bodyPart: body.bodyPart,
    };

    let imageUrl: string;
    switch (model) {
      case "gemini-2.5-flash-image":
        imageUrl = await generateWithGemini25(input);
        break;
      case "gemini-2.0-flash-preview-image-generation":
        imageUrl = await generateWithGemini20(input);
        break;
      case "imagen-4.0-generate-001":
        imageUrl = await generateWithImagen(input);
        break;
      case "gpt-image-1":
        imageUrl = await generateWithGptImage1(input);
        break;
      case "dall-e-3":
        imageUrl = await generateWithDalle3(input);
        break;
      case "dall-e-2":
        imageUrl = await generateWithDalle2(input);
        break;
      case "gpt-4o":
        imageUrl = await generateWithGpt4o(input);
        break;
    }

    await logUsage(user.id, model, input.designName);

    try {
      imageUrl = await persistGeneratedImage(imageUrl, "tryout", "tryout.png");
    } catch (e) {
      console.error("[tryout] persist preview:", e instanceof Error ? e.message : e);
    }

    return NextResponse.json({ imageUrl, model });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Falha na geração";
    const status = /API_KEY|Configure/i.test(message) ? 400 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
