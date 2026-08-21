import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPost, getPosts } from "@/lib/content";
import { LocalizedDate } from "@/components/ui/LocalizedDate";
import { ContinuesLabel } from "@/components/ui/ContinuesLabel";
import { ReadingProgress } from "@/components/ui/ReadingProgress";
import { CursorLink } from "@/components/ui/CursorLink";
import { MediaImage } from "@/components/ui/MediaImage";

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Article" };
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.cover ? [{ url: post.cover }] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const related = (await getPosts()).filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <article className="px-4 pb-28 pt-28 sm:px-5 md:px-12">
      <ReadingProgress />
      <p className="label-mono">
        <LocalizedDate iso={post.date} /> · {post.readTime}
      </p>
      <h1 className="display-section mt-4 max-w-4xl">{post.title}</h1>
      <div className="relative my-12 aspect-[16/10] max-w-5xl overflow-hidden sm:aspect-[16/8]">
        <MediaImage src={post.cover} alt="" fill className="object-cover" priority />
      </div>
      <div className="max-w-2xl space-y-6 text-lg text-ink-secondary">
        {post.content.split("\n\n").map((block, i) => {
          const text = block.trim();
          if (!text) return null;
          if (text.startsWith("## ")) {
            return (
              <h2 key={i} className="font-display pt-4 text-3xl text-ink">
                {text.replace(/^##\s+/, "")}
              </h2>
            );
          }
          return <p key={i}>{text}</p>;
        })}
      </div>
      {related.length > 0 && (
        <aside className="mt-24 max-w-2xl border-t border-line pt-10">
          <ContinuesLabel />
          {related.map((r) => (
            <CursorLink key={r.slug} href={`/blog/${r.slug}`} className="mb-3 block font-display text-2xl">
              {r.title}
            </CursorLink>
          ))}
        </aside>
      )}
    </article>
  );
}
