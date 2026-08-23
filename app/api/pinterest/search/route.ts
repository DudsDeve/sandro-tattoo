import { NextResponse } from "next/server";
import { isPinterestConfigured, searchPinterestPins } from "@/lib/pinterest/search";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim() || "";
  if (q.length < 2) {
    return NextResponse.json({ pins: [] });
  }
  if (!isPinterestConfigured()) {
    return NextResponse.json(
      { error: "Pinterest não configurado. Defina PINTEREST_ACCESS_TOKEN." },
      { status: 501 },
    );
  }
  try {
    const pins = await searchPinterestPins(q, 24);
    return NextResponse.json({ pins });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Falha na pesquisa Pinterest" },
      { status: 502 },
    );
  }
}
