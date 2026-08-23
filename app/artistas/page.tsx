import type { Metadata } from "next";
import { getArtists } from "@/lib/content";
import { ArtistsGrid } from "@/components/artists/ArtistsGrid";
import { ArtistsPageHeader } from "@/components/ui/PageHeaders";

export const metadata: Metadata = {
  title: "Artists",
  description: "Meet the resident artists at VERSUS and find the hand that fits you.",
};

export default async function ArtistasPage() {
  const list = await getArtists();
  return (
    <div className="page-shell">
      <ArtistsPageHeader />
      <ArtistsGrid artists={list} />
    </div>
  );
}
