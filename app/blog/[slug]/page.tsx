import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPost, getPosts } from "@/lib/content";
import { formatDate } from "@/lib/utils";
import { ReadingProgress } from "@/components/ui/ReadingProgress";
import { CursorLink } from "@/components/ui/CursorLink";

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  return { title: post?.title ?? "Artigo" };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const related = (await getPosts()).filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <article className="px-5 pb-28 pt-28 md:px-12">
      <ReadingProgress />
      <p className="label-mono">
        {formatDate(post.date)} · {post.readTime}
      </p>
      <h1 className="display-section mt-4 max-w-4xl">{post.title}</h1>
      <div className="relative my-12 aspect-[16/8] max-w-5xl overflow-hidden">
        <Image src={post.cover} alt="" fill className="object-cover" priority />
      </div>
      <div className="max-w-2xl space-y-6 text-lg text-ink-secondary">
        {post.content.split("\n\n").map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}
      </div>
      {related.length > 0 && (
        <aside className="mt-24 max-w-2xl border-t border-line pt-10">
          <p className="label-mono mb-4">Continua</p>
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
