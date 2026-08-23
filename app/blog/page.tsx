import type { Metadata } from "next";
import { BlogLanding } from "@/components/blog/BlogLanding";
import { getPosts } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description: "Aftercare, trends and studio notes from VERSUS.",
};

export default async function BlogPage() {
  const posts = await getPosts();
  return (
    <div className="page-shell">
      <BlogLanding posts={posts} />
    </div>
  );
}
