import type { Metadata } from "next";
import { WishlistGrid } from "@/components/wishlist/WishlistGrid";
import { WishlistPageHeader } from "@/components/ui/PageHeaders";
import { getArtists, getWishlistItems } from "@/lib/content";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "VERSUS wishlist — projects with studio discount.",
};

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const [items, artists] = await Promise.all([getWishlistItems(), getArtists()]);
  return (
    <div className="page-shell">
      <WishlistPageHeader />
      <WishlistGrid items={items} artists={artists} />
    </div>
  );
}
