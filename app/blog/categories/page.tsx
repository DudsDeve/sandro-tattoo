import type { Metadata } from "next";
import { BlogCategoriesIndex } from "@/components/blog/BlogCategoriesIndex";
import { getBlogCategories } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Categories",
  description: "All VERSUS blog categories.",
};

export default async function BlogCategoriesPage() {
  const categories = await getBlogCategories();
  return <BlogCategoriesIndex categories={categories} />;
}
