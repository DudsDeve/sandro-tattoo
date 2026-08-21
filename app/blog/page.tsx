import type { Metadata } from "next";
import Image from "next/image";
import { CursorLink } from "@/components/ui/CursorLink";
import { BlogPageHeader } from "@/components/ui/PageHeaders";
import { getPosts } from "@/lib/content";
import { BlogCategoryLabel } from "@/components/blog/BlogCategoryLabel";
import { LocalizedDate } from "@/components/ui/LocalizedDate";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description: "Aftercare, trends and studio notes from Sandro Tattoo.",
};

export default async function BlogPage() {
  const posts = await getPosts();
  return (
    <div className="px-4 pb-28 pt-28 sm:px-5 md:px-12 md:pt-32">
      <BlogPageHeader />
      <div className="grid gap-8 md:grid-cols-2">
        {posts.map((post) => (
          <CursorLink key={post.slug} href={`/blog/${post.slug}`} className="group block">
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image
                src={post.cover}
                alt={post.title}
                fill
                className="object-cover transition duration-700 group-hover:scale-105"
                sizes="50vw"
              />
            </div>
            <p className="label-mono mt-4">
              <BlogCategoryLabel category={post.category} /> · {post.readTime} · <LocalizedDate iso={post.date} />
            </p>
            <h2 className="font-display mt-2 text-3xl">{post.title}</h2>
            <p className="mt-2 text-sm text-ink-secondary">{post.excerpt}</p>
          </CursorLink>
        ))}
      </div>
    </div>
  );
}
