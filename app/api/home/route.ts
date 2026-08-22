import { NextResponse } from "next/server";
import { getArtists, getSpecialties } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function GET() {
  const [specialties, artists] = await Promise.all([getSpecialties(), getArtists()]);
  return NextResponse.json({ specialties, artists });
}
