import { NextResponse } from "next/server";
import { getCmsStore } from "@/lib/cms/store";

export async function GET() {
  const store = await getCmsStore();
  return NextResponse.json(store);
}
