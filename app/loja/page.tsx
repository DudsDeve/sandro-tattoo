import type { Metadata } from "next";
import { ShopGrid } from "@/components/gallery/ShopGrid";
import { ShopPageHeader } from "@/components/ui/PageHeaders";
import { getProducts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Shop",
  description: "Merch, prints and healing kit from Sandro Tattoo.",
};

export default async function LojaPage() {
  const products = await getProducts();
  return (
    <div className="px-4 pb-28 pt-28 sm:px-5 md:px-12 md:pt-32">
      <ShopPageHeader />
      <ShopGrid products={products} />
    </div>
  );
}
