import {
  artists as seedArtists,
  gallery as seedGallery,
  posts as seedPosts,
  products,
  specialties as seedSpecialties,
} from "@/lib/data/content";
import {
  categoryToSpecialty,
  cmsArtistToArtist,
  cmsItemToTattoo,
} from "@/lib/cms/types";
import { getCmsStore } from "@/lib/cms/store";
import { sanityClient } from "@/lib/sanity/client";
import { artistBySlugQuery, artistsQuery, postsQuery, productsQuery, tattoosQuery } from "@/lib/sanity/queries";
import type { Artist, BlogPost, Product, Specialty, TattooWork } from "@/lib/types";

async function fromCms() {
  try {
    return await getCmsStore();
  } catch {
    return null;
  }
}

export async function getSpecialties(): Promise<Specialty[]> {
  const cms = await fromCms();
  if (cms?.categories?.length) {
    return [...cms.categories]
      .sort((a, b) => a.order - b.order)
      .map(categoryToSpecialty);
  }
  return seedSpecialties;
}

export async function getArtists(): Promise<Artist[]> {
  const cms = await fromCms();
  if (cms?.artists?.length) {
    return cms.artists.filter((a) => a.available !== false).map(cmsArtistToArtist);
  }
  if (!sanityClient) return seedArtists;
  try {
    const data = await sanityClient.fetch<Artist[]>(artistsQuery);
    return data?.length ? data : seedArtists;
  } catch {
    return seedArtists;
  }
}

export async function getArtist(slug: string): Promise<Artist | undefined> {
  const all = await getArtists();
  return all.find((a) => a.slug === slug);
}

export async function getGallery(): Promise<TattooWork[]> {
  const cms = await fromCms();
  if (cms?.items?.length) {
    return cms.items.map((item) => cmsItemToTattoo(item, cms));
  }
  if (!sanityClient) return seedGallery;
  try {
    const data = await sanityClient.fetch<TattooWork[]>(tattoosQuery);
    return data?.length ? data : seedGallery;
  } catch {
    return seedGallery;
  }
}

export async function getPosts(): Promise<BlogPost[]> {
  const cms = await fromCms();
  if (cms?.posts?.length) {
    return cms.posts
      .filter((p) => p.published !== false)
      .map((p) => ({
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        category: p.category,
        date: p.date,
        readTime: p.readTime,
        cover: p.cover,
        content: p.content,
        seoTitle: p.seoTitle,
        seoDescription: p.seoDescription,
      }));
  }
  if (!sanityClient) return seedPosts;
  try {
    const data = await sanityClient.fetch<BlogPost[]>(postsQuery);
    return data?.length ? data : seedPosts;
  } catch {
    return seedPosts;
  }
}

export async function getPost(slug: string): Promise<BlogPost | undefined> {
  const all = await getPosts();
  return all.find((p) => p.slug === slug);
}

export async function getProducts(): Promise<Product[]> {
  if (!sanityClient) return products;
  try {
    const data = await sanityClient.fetch<Product[]>(productsQuery);
    return data?.length ? data : products;
  } catch {
    return products;
  }
}

/** @deprecated kept for callers that still import artistBySlugQuery path */
export async function getArtistFromSanity(slug: string) {
  if (!sanityClient) return seedArtists.find((a) => a.slug === slug);
  try {
    const data = await sanityClient.fetch<Artist | null>(artistBySlugQuery, { slug });
    return data ?? seedArtists.find((a) => a.slug === slug);
  } catch {
    return seedArtists.find((a) => a.slug === slug);
  }
}
