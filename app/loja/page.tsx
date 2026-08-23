import type { Metadata } from "next";
import { ShopGrid } from "@/components/gallery/ShopGrid";
import { ShopPageHeader } from "@/components/ui/PageHeaders";
import { getProducts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Shop",
  description: "Merch, prints and healing kit from VERSUS.",
};

export default async function LojaPage() {
  const products = await getProducts();
  return (
    <div className="page-shell">
      <ShopPageHeader />
      <ShopGrid products={products} />
    </div>
  );
}
