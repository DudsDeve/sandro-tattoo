import type { Metadata } from "next";
import { getArtists } from "@/lib/content";
import { ArtistsGrid } from "@/components/artists/ArtistsGrid";

export const metadata: Metadata = {
  title: "Artistas",
  description: "Conheça os artistas residentes do Sandro Tattoo e encontre o traço que combina com você.",
};

export default async function ArtistasPage() {
  const list = await getArtists();
  return (
    <div className="px-4 pb-28 pt-28 sm:px-5 md:px-12 md:pt-32">
      <p className="label-mono">Residentes</p>
      <h1 className="display-section mt-4 max-w-4xl">Mãos diferentes. Um mesmo critério: a peça precisa durar.</h1>
      <ArtistsGrid artists={list} />
    </div>
  );
}
