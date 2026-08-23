import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogArticle } from "@/components/blog/BlogArticle";
import { ReadingProgress } from "@/components/ui/ReadingProgress";
import { getPost, getPosts } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Article" };
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const all = await getPosts();
  const index = all.findIndex((p) => p.slug === post.slug);
  const related = all.filter((p) => p.slug !== post.slug).slice(0, 3);
  const prev = index > 0 ? all[index - 1] : null;
  const next = index >= 0 && index < all.length - 1 ? all[index + 1] : null;

  return (
    <>
      <ReadingProgress />
      <BlogArticle post={post} related={related} prev={prev} next={next} />
    </>
  );
}
