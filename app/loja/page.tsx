import type { Metadata } from "next";
import { ShopGrid } from "@/components/gallery/ShopGrid";
import { getProducts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Loja",
  description: "Merch, prints e kit de cicatrização do Sandro Tattoo.",
};

export default async function LojaPage() {
  const products = await getProducts();
  return (
    <div className="px-4 pb-28 pt-28 sm:px-5 md:px-12 md:pt-32">
      <p className="label-mono">Loja</p>
      <h1 className="display-section mt-4">Leva um pedaço do ateliê.</h1>
      <ShopGrid products={products} />
    </div>
  );
}
