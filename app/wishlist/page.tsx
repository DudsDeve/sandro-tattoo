import type { Metadata } from "next";
import { WishlistGrid } from "@/components/wishlist/WishlistGrid";
import { WishlistPageHeader } from "@/components/ui/PageHeaders";
import { getWishlistItems } from "@/lib/content";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "VERSUS wishlist — projects with studio discount.",
};

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const items = await getWishlistItems();
  return (
    <div className="page-shell">
      <WishlistPageHeader />
      <WishlistGrid items={items} />
    </div>
  );
}
