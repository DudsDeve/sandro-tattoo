import type { Metadata } from "next";
import { Suspense } from "react";
import { GalleryExperience } from "@/components/gallery/GalleryExperience";
import { getGallery } from "@/lib/content";

export const metadata: Metadata = {
  title: "Galeria",
  description: "Portfólio do Sandro Tattoo — peças reais, filtradas por estilo e artista.",
};

export default async function GaleriaPage() {
  const works = await getGallery();
  return (
    <div className="px-5 pb-24 pt-32 md:px-12">
      <p className="label-mono">Portfólio</p>
      <h1 className="display-section mt-4 mb-12">Arquivo vivo.</h1>
      <Suspense>
        <GalleryExperience works={works} />
      </Suspense>
    </div>
  );
}
