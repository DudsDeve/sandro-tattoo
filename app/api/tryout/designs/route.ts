import { NextResponse } from "next/server";
import { getGallery, getSpecialties } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function GET() {
  const [works, specialties] = await Promise.all([getGallery(), getSpecialties()]);
  const designs = works
    .filter((w) => w.image)
    .map((w) => ({
      id: w.id,
      name: w.title,
      imageUrl: w.image,
      style: specialties.find((s) => s.slug === w.style)?.name || w.style || "Studio",
      artistName: w.artistName,
      artistSlug: w.artistSlug,
    }));
  return NextResponse.json({ designs });
}
