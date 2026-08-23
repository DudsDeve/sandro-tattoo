import {
  categoryToSpecialty,
  cmsArtistToArtist,
  cmsItemToTattoo,
} from "@/lib/cms/types";
import { getCmsStore } from "@/lib/cms/store";
import { sanityClient } from "@/lib/sanity/client";
import { artistsQuery, postsQuery, productsQuery, tattoosQuery } from "@/lib/sanity/queries";
import type { Artist, BlogPost, Product, Specialty, TattooWork, Testimonial } from "@/lib/types";

async function fromCms() {
  try {
    return await getCmsStore();
  } catch {
    return null;
  }
}

export async function getSpecialties(): Promise<Specialty[]> {
  const cms = await fromCms();
  if (!cms?.categories?.length) return [];
  return [...cms.categories]
    .sort((a, b) => a.order - b.order)
    .map((c) =>
      categoryToSpecialty({
        ...c,
        image:
          c.image ||
          cms.items.find((item) => item.categoryId === c.id && item.image)?.image ||
          "",
      }),
    );
}

export async function getArtists(): Promise<Artist[]> {
  const cms = await fromCms();
  if (cms) {
    return cms.artists.filter((a) => a.available !== false).map(cmsArtistToArtist);
  }
  if (!sanityClient) return [];
  try {
    const data = await sanityClient.fetch<Artist[]>(artistsQuery);
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const cms = await fromCms();
  if (!cms?.testimonials?.length) return [];
  return [...cms.testimonials]
    .sort((a, b) => a.order - b.order)
    .map((t) => {
      const artist = cms.artists.find((a) => a.id === t.artistId);
      return {
        id: t.id,
        title: t.title,
        description: t.description,
        name: t.name,
        artistId: t.artistId,
        artistSlug: artist?.slug,
        artistName: artist?.name,
        image: t.image,
        video: t.video,
        youtubeUrl: t.youtubeUrl,
      };
    });
}

export async function getArtist(slug: string): Promise<Artist | undefined> {
  const all = await getArtists();
  return all.find((a) => a.slug === slug);
}

export async function getGallery(): Promise<TattooWork[]> {
  const cms = await fromCms();
  if (cms) {
    return cms.items.map((item) => cmsItemToTattoo(item, cms));
  }
  if (!sanityClient) return [];
  try {
    const data = await sanityClient.fetch<TattooWork[]>(tattoosQuery);
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getPosts(): Promise<BlogPost[]> {
  const cms = await fromCms();
  if (cms) {
    return cms.posts
      .filter((p) => p.published !== false)
      .map((p) => ({
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt || "",
        category: p.category,
        date: p.date || "",
        readTime: p.readTime || "",
        cover: p.cover || "",
        content: typeof p.content === "string" ? p.content : "",
        seoTitle: p.seoTitle,
        seoDescription: p.seoDescription,
      }));
  }
  if (!sanityClient) return [];
  try {
    const data = await sanityClient.fetch<BlogPost[]>(postsQuery);
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getPost(slug: string): Promise<BlogPost | undefined> {
  const all = await getPosts();
  return all.find((p) => p.slug === slug);
}

export async function getProducts(): Promise<Product[]> {
  if (!sanityClient) return [];
  try {
    const data = await sanityClient.fetch<Product[]>(productsQuery);
    return data?.length ? data : [];
  } catch {
    return [];
  }
}

/** @deprecated */
export async function getArtistFromSanity(slug: string) {
  return getArtist(slug);
}
