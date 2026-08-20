import { artists, gallery, posts, products } from "@/lib/data/content";
import { sanityClient } from "@/lib/sanity/client";
import { artistBySlugQuery, artistsQuery, postsQuery, productsQuery, tattoosQuery } from "@/lib/sanity/queries";
import type { Artist, BlogPost, Product, TattooWork } from "@/lib/types";

export async function getArtists(): Promise<Artist[]> {
  if (!sanityClient) return artists;
  try {
    const data = await sanityClient.fetch<Artist[]>(artistsQuery);
    return data?.length ? data : artists;
  } catch {
    return artists;
  }
}

export async function getArtist(slug: string): Promise<Artist | undefined> {
  if (!sanityClient) return artists.find((a) => a.slug === slug);
  try {
    const data = await sanityClient.fetch<Artist | null>(artistBySlugQuery, { slug });
    return data ?? artists.find((a) => a.slug === slug);
  } catch {
    return artists.find((a) => a.slug === slug);
  }
}

export async function getGallery(): Promise<TattooWork[]> {
  if (!sanityClient) return gallery;
  try {
    const data = await sanityClient.fetch<TattooWork[]>(tattoosQuery);
    return data?.length ? data : gallery;
  } catch {
    return gallery;
  }
}

export async function getPosts(): Promise<BlogPost[]> {
  if (!sanityClient) return posts;
  try {
    const data = await sanityClient.fetch<BlogPost[]>(postsQuery);
    return data?.length ? data : posts;
  } catch {
    return posts;
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
