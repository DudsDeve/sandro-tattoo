import type { Metadata } from "next";
import { CursorLink } from "@/components/ui/CursorLink";
import { BlogPageHeader } from "@/components/ui/PageHeaders";
import { getPosts } from "@/lib/content";
import { BlogCategoryLabel } from "@/components/blog/BlogCategoryLabel";
import { LocalizedDate } from "@/components/ui/LocalizedDate";
import { MediaImage } from "@/components/ui/MediaImage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description: "Aftercare, trends and studio notes from VERSUS.",
};

export default async function BlogPage() {
  const posts = await getPosts();
  return (
    <div className="page-shell">
      <BlogPageHeader />
      {!posts.length ? (
        <p className="text-sm text-ink-muted">Nenhum post ainda. Gere no admin em Blog + IA.</p>
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          {posts.map((post) => (
            <CursorLink key={post.slug} href={`/blog/${post.slug}`} className="group block">
              <div className="relative aspect-[16/10] overflow-hidden">
                <MediaImage
                  src={post.cover}
                  alt={post.title}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                  sizes="50vw"
                />
              </div>
              <p className="label-mono mt-4">
                <BlogCategoryLabel category={post.category} /> · {post.readTime} ·{" "}
                <LocalizedDate iso={post.date} />
              </p>
              <h2 className="font-display mt-2 text-3xl">{post.title}</h2>
              <p className="mt-2 text-sm text-ink-secondary">{post.excerpt}</p>
            </CursorLink>
          ))}
        </div>
      )}
    </div>
  );
}
