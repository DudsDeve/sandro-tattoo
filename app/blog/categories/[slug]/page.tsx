import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogCategoryPosts } from "@/components/blog/BlogCategoryPosts";
import { getBlogCategories, getPostsByCategory } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getBlogCategories();
  const category = categories.find((c) => c.slug === slug);
  return { title: category?.name || "Category" };
}

export default async function BlogCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const categories = await getBlogCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();
  const posts = await getPostsByCategory(slug);
  return <BlogCategoryPosts category={category} categories={categories} posts={posts} />;
}
