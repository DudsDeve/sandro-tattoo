import { NextResponse } from "next/server";
import { getArtists, getSpecialties, getTestimonials } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function GET() {
  const [specialties, artists, testimonials] = await Promise.all([
    getSpecialties(),
    getArtists(),
    getTestimonials(),
  ]);
  return NextResponse.json({ specialties, artists, testimonials });
}
