import type { Artist, BlogPost, Specialty, TattooWork } from "@/lib/types";

export type CmsCategory = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  video?: string;
  order: number;
};

export type CmsWorkItem = {
  id: string;
  title: string;
  categoryId: string;
  artistId?: string;
  image: string;
  video?: string;
  hours?: number;
  bodyPart?: string;
};

export type CmsArtistWork = {
  id: string;
  title: string;
  image: string;
  video?: string;
};

export type CmsArtist = {
  id: string;
  slug: string;
  name: string;
  role: string;
  specialty: string;
  specialtyIds: string[];
  years: number;
  bio: string;
  bioLong: string;
  instagram: string;
  image: string;
  available: boolean;
  works: CmsArtistWork[];
};

export type CmsPost = BlogPost & {
  id: string;
  seoTitle?: string;
  seoDescription?: string;
  published: boolean;
  sources?: string[];
};

export type CmsStore = {
  version: 1;
  updatedAt: string;
  categories: CmsCategory[];
  items: CmsWorkItem[];
  artists: CmsArtist[];
  posts: CmsPost[];
  /** Visual site editor overrides: fieldId → value */
  siteContent?: Record<string, string>;
};

export function emptyStore(): CmsStore {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    categories: [],
    items: [],
    artists: [],
    posts: [],
    siteContent: {},
  };
}

export function categoryToSpecialty(c: CmsCategory): Specialty {
  return {
    slug: c.slug as Specialty["slug"],
    name: c.name,
    description: c.description,
    image: c.image,
  };
}

export function cmsArtistToArtist(a: CmsArtist): Artist {
  return {
    slug: a.slug,
    name: a.name,
    role: a.role,
    specialty: a.specialty,
    specialties: a.specialtyIds as Artist["specialties"],
    years: a.years,
    bio: a.bio,
    bioLong: a.bioLong,
    instagram: a.instagram,
    image: a.image,
    works: a.works.map((w) => w.image),
    styleVector: {},
    available: a.available,
  };
}

export function cmsItemToTattoo(
  item: CmsWorkItem,
  store: CmsStore,
): TattooWork {
  const category = store.categories.find((c) => c.id === item.categoryId);
  const artist = store.artists.find((a) => a.id === item.artistId);
  return {
    id: item.id,
    title: item.title,
    artistSlug: artist?.slug ?? "estudio",
    artistName: artist?.name ?? "Estúdio",
    style: (category?.slug ?? "blackwork") as TattooWork["style"],
    image: item.image,
    hours: item.hours ?? 4,
    bodyPart: item.bodyPart ?? "—",
  };
}
