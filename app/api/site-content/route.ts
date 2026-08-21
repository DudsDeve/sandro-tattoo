import { NextResponse } from "next/server";
import { getCmsStore } from "@/lib/cms/store";

/** Public read of visual site overrides (no secrets). */
export async function GET() {
  const store = await getCmsStore();
  return NextResponse.json(
    { siteContent: store.siteContent || {} },
    { headers: { "Cache-Control": "no-store" } },
  );
}
