import type { Metadata } from "next";
import { getArtists } from "@/lib/content";
import { ArtistsGrid } from "@/components/artists/ArtistsGrid";
import { ArtistsPageHeader } from "@/components/ui/PageHeaders";

export const metadata: Metadata = {
  title: "Artists",
  description: "Meet the resident artists at Sandro Tattoo and find the hand that fits you.",
};

export default async function ArtistasPage() {
  const list = await getArtists();
  return (
    <div className="px-4 pb-28 pt-28 sm:px-5 md:px-12 md:pt-32">
      <ArtistsPageHeader />
      <ArtistsGrid artists={list} />
    </div>
  );
}
