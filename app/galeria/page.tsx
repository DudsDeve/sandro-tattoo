import type { Metadata } from "next";
import { Suspense } from "react";
import { GalleryExperience } from "@/components/gallery/GalleryExperience";
import { GalleryPageHeader } from "@/components/ui/PageHeaders";
import { getArtists, getGallery, getSpecialties } from "@/lib/content";

export const metadata: Metadata = {
  title: "Gallery",
  description: "VERSUS portfolio — real pieces, filtered by style and artist.",
};

export const dynamic = "force-dynamic";

export default async function GaleriaPage() {
  const [works, specialties, artists] = await Promise.all([getGallery(), getSpecialties(), getArtists()]);
  return (
    <div className="page-shell">
      <GalleryPageHeader />
      <Suspense>
        <GalleryExperience works={works} specialties={specialties} artists={artists} />
      </Suspense>
    </div>
  );
}
