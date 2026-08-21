import type { Metadata } from "next";
import { Suspense } from "react";
import { GalleryExperience } from "@/components/gallery/GalleryExperience";
import { GalleryPageHeader } from "@/components/ui/PageHeaders";
import { getGallery, getSpecialties } from "@/lib/content";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Sandro Tattoo portfolio — real pieces, filtered by style and artist.",
};

export const dynamic = "force-dynamic";

export default async function GaleriaPage() {
  const [works, specialties] = await Promise.all([getGallery(), getSpecialties()]);
  return (
    <div className="px-4 pb-24 pt-28 sm:px-5 md:px-12 md:pt-32">
      <GalleryPageHeader />
      <Suspense>
        <GalleryExperience works={works} specialties={specialties} />
      </Suspense>
    </div>
  );
}
