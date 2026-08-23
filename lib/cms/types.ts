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

export type CmsBlogCategory = {
  id: string;
  slug: string;
  name: string;
  namePt: string;
  order: number;
};

export type CmsPost = BlogPost & {
  id: string;
  seoTitle?: string;
  seoDescription?: string;
  published: boolean;
  sources?: string[];
  seoKeyword?: string;
  tags?: string[];
};

export type CmsTestimonial = {
  id: string;
  title: string;
  description: string;
  name: string;
  artistId: string;
  image?: string;
  video?: string;
  youtubeUrl?: string;
  order: number;
};

export type CmsWishlistItem = {
  id: string;
  title: string;
  image: string;
  discountPercent: number;
  artistId?: string;
  note?: string;
  visible: boolean;
  order: number;
};

export type CmsClient = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  instagram: string;
  artistSlug: string;
  artistName: string;
  idea: string;
  ideaLink: string;
  ideaImages: string[];
  bodyPart: string;
  size: string;
  firstTattoo: "sim" | "nao";
  slot: string;
  /** booking | chat */
  source?: string;
};

export type CmsStore = {
  version: 1;
  updatedAt: string;
  categories: CmsCategory[];
  items: CmsWorkItem[];
  artists: CmsArtist[];
  posts: CmsPost[];
  blogCategories: CmsBlogCategory[];
  testimonials: CmsTestimonial[];
  clients: CmsClient[];
  wishlistItems: CmsWishlistItem[];
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
    blogCategories: [],
    testimonials: [],
    clients: [],
    wishlistItems: [],
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
    styleVector: Object.fromEntries((a.specialtyIds || []).map((id) => [id, 3])),
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
    style: (category?.slug || "") as TattooWork["style"],
    image: item.image,
    hours: item.hours ?? 4,
    bodyPart: item.bodyPart ?? "—",
  };
}
