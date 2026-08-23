import type { Metadata } from "next";
import { BlogLanding } from "@/components/blog/BlogLanding";
import { getBlogCategories, getPosts } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description: "Aftercare, trends and studio notes from VERSUS.",
};

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([getPosts(), getBlogCategories()]);
  const covers = posts.map((p) => p.cover).filter((src): src is string => Boolean(src?.trim()));
  const heroCover = covers.length ? covers[Math.floor(Math.random() * covers.length)] : undefined;
  return (
    <div className="page-shell">
      <BlogLanding posts={posts} heroCover={heroCover} categories={categories} />
    </div>
  );
}
