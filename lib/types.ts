export type SpecialtySlug = string;

export type StyleVector = Record<string, number>;

export interface Artist {
  slug: string;
  name: string;
  role: string;
  specialty: string;
  specialties: SpecialtySlug[];
  years: number;
  bio: string;
  bioLong: string;
  instagram: string;
  image: string;
  works: string[];
  styleVector: StyleVector;
  available: boolean;
}

export interface TattooWork {
  id: string;
  title: string;
  artistSlug: string;
  artistName: string;
  style: SpecialtySlug;
  image: string;
  hours: number;
  bodyPart: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: "cuidados" | "tendencias" | "bastidores" | "estilo";
  date: string;
  readTime: string;
  cover: string;
  content: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface Product {
  slug: string;
  name: string;
  price: number;
  category: "apparel" | "print" | "aftercare" | "gift";
  image: string;
  images: string[];
  description: string;
  sizes?: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
  workImage?: string;
}

export interface Specialty {
  slug: SpecialtySlug;
  name: string;
  description: string;
  image: string;
}

export interface ProcessStep {
  id: string;
  number: string;
  title: string;
  body: string;
  detail: string;
}

export type QuizOption = {
  id: string;
  label: string;
  image?: string;
  icon?: string;
  weights: StyleVector;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  hint?: string;
  type: "image" | "text";
  options: QuizOption[];
};
