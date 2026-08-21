import {
  specialties as seedSpecialties,
} from "@/lib/data/content";
import {
  categoryToSpecialty,
  cmsArtistToArtist,
  cmsItemToTattoo,
} from "@/lib/cms/types";
import { getCmsStore } from "@/lib/cms/store";
import { sanityClient } from "@/lib/sanity/client";
import { artistsQuery, postsQuery, productsQuery, tattoosQuery } from "@/lib/sanity/queries";
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
  if (cms) {
    const fromCmsCats = [...cms.categories]
      .sort((a, b) => a.order - b.order)
      .map(categoryToSpecialty);
    if (fromCmsCats.length) return fromCmsCats;
  }
  // Fallback: category names only, no mock images
  return seedSpecialties.map((s) => ({ ...s, image: "" }));
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
