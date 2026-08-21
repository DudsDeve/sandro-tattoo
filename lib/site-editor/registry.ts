import type { SitePageDef } from "@/lib/site-editor/types";

export const SITE_PAGES: SitePageDef[] = [
  {
    path: "/",
    label: "Home",
    description: "Hero, about, specialties, artists, testimonials, CTA",
    fields: [
      { id: "home.hero.eyebrow", label: "Hero · eyebrow", type: "text", defaultValue: "Dublin · EST. 2012", section: "Hero" },
      { id: "home.hero.title", label: "Hero · title", type: "text", defaultValue: "ART CARVED IN SKIN", section: "Hero" },
      { id: "home.hero.subtitle", label: "Hero · subtitle", type: "textarea", defaultValue: "An authorial studio. Five artists. Pieces that age with you — from the first line to a beautiful heal.", section: "Hero" },
      { id: "home.hero.ctaQuiz", label: "Hero · CTA quiz", type: "text", defaultValue: "Find your style", section: "Hero" },
      { id: "home.hero.ctaBook", label: "Hero · CTA book", type: "text", defaultValue: "Book a session", section: "Hero" },
      { id: "home.hero.video1", label: "Hero · video 1", type: "video", defaultValue: "/videos/hero-1.mp4", section: "Hero" },
      { id: "home.hero.video2", label: "Hero · video 2", type: "video", defaultValue: "/videos/hero-2.mp4", section: "Hero" },
      { id: "home.about.label", label: "About · label", type: "text", defaultValue: "About the studio", section: "About" },
      { id: "home.about.title", label: "About · title", type: "text", defaultValue: "An atelier, not an assembly line.", section: "About" },
      { id: "home.about.body", label: "About · body", type: "textarea", defaultValue: "Sandro Tattoo was born from refusing the catalog. Every piece is drawn for a specific body, with consultation time, stencil, and healing treated as part of the art — not aftersales.", section: "About" },
      { id: "home.about.yearsLabel", label: "About · years label", type: "text", defaultValue: "years of skin and craft", section: "About" },
      { id: "home.about.image", label: "About · image", type: "image", defaultValue: "", section: "About" },
      { id: "home.specialties.label", label: "Specialties · label", type: "text", defaultValue: "Specialties", section: "Specialties" },
      { id: "home.specialties.title", label: "Specialties · title", type: "text", defaultValue: "Languages we actually speak.", section: "Specialties" },
      { id: "home.artists.label", label: "Artists · label", type: "text", defaultValue: "Artists", section: "Artists" },
      { id: "home.artists.title", label: "Artists · title", type: "text", defaultValue: "Who holds the needle.", section: "Artists" },
      { id: "home.artists.seeAll", label: "Artists · see all", type: "text", defaultValue: "See all", section: "Artists" },
      { id: "home.testimonials.label", label: "Testimonials · label", type: "text", defaultValue: "Testimonials", section: "Testimonials" },
      { id: "home.testimonials.title", label: "Testimonials · title", type: "text", defaultValue: "Skin that comes back. And refers.", section: "Testimonials" },
      { id: "home.cta.title", label: "CTA · title", type: "text", defaultValue: "Ready to mark your story?", section: "CTA" },
      { id: "home.cta.body", label: "CTA · body", type: "textarea", defaultValue: "Consultation, design, and session — in the same place. Or start with the quiz if you still don’t know the artist.", section: "CTA" },
      { id: "home.cta.book", label: "CTA · book", type: "text", defaultValue: "Book a session", section: "CTA" },
      { id: "home.cta.talk", label: "CTA · talk", type: "text", defaultValue: "Talk to us", section: "CTA" },
      { id: "home.cta.image", label: "CTA · background image", type: "image", defaultValue: "", section: "CTA" },
    ],
  },
  {
    path: "/artistas",
    label: "Artistas",
    description: "Cabeçalho da página de artistas",
    fields: [
      { id: "page.artists.label", label: "Label", type: "text", defaultValue: "Residents", section: "Header" },
      { id: "page.artists.title", label: "Title", type: "textarea", defaultValue: "Different hands. One standard: the piece has to last.", section: "Header" },
    ],
  },
  {
    path: "/galeria",
    label: "Galeria",
    description: "Cabeçalho da galeria",
    fields: [
      { id: "page.gallery.label", label: "Label", type: "text", defaultValue: "Portfolio", section: "Header" },
      { id: "page.gallery.title", label: "Title", type: "text", defaultValue: "Living archive.", section: "Header" },
    ],
  },
  {
    path: "/processo",
    label: "Processo",
    description: "Cabeçalho do processo",
    fields: [
      { id: "page.process.title", label: "Title", type: "text", defaultValue: "How a piece is born.", section: "Header" },
    ],
  },
  {
    path: "/loja",
    label: "Loja",
    description: "Cabeçalho da loja",
    fields: [
      { id: "page.shop.label", label: "Label", type: "text", defaultValue: "Shop", section: "Header" },
      { id: "page.shop.title", label: "Title", type: "text", defaultValue: "Take a piece of the atelier home.", section: "Header" },
    ],
  },
  {
    path: "/blog",
    label: "Blog",
    description: "Cabeçalho do blog",
    fields: [
      { id: "page.blog.label", label: "Label", type: "text", defaultValue: "Archive", section: "Header" },
      { id: "page.blog.title", label: "Title", type: "text", defaultValue: "Reading for people who take skin seriously.", section: "Header" },
    ],
  },
  {
    path: "/agendar",
    label: "Agendar",
    description: "Cabeçalho do booking",
    fields: [
      { id: "page.book.label", label: "Label", type: "text", defaultValue: "Booking", section: "Header" },
      { id: "page.book.title", label: "Title", type: "text", defaultValue: "Six steps. Zero catalog.", section: "Header" },
    ],
  },
  {
    path: "/simular",
    label: "Simulador",
    description: "Cabeçalho do simulador",
    fields: [
      { id: "page.sim.label", label: "Label", type: "text", defaultValue: "Simulator", section: "Header" },
      { id: "page.sim.title", label: "Title", type: "text", defaultValue: "The piece on your skin.", section: "Header" },
      { id: "page.sim.body", label: "Body", type: "textarea", defaultValue: "Upload a photo, place a design, and feel the scale before the needle.", section: "Header" },
    ],
  },
  {
    path: "/quiz",
    label: "Quiz",
    description: "Cabeçalho do quiz",
    fields: [
      { id: "page.quiz.label", label: "Label", type: "text", defaultValue: "Style quiz", section: "Header" },
    ],
  },
];

export function getSitePage(path: string) {
  const normalized = path === "" ? "/" : path.startsWith("/") ? path : `/${path}`;
  return SITE_PAGES.find((p) => p.path === normalized) ?? null;
}

export function getFieldDef(fieldId: string) {
  for (const page of SITE_PAGES) {
    const field = page.fields.find((f) => f.id === fieldId);
    if (field) return { page, field };
  }
  return null;
}

export function resolveFieldValue(fieldId: string, content: Record<string, string> | undefined) {
  if (content?.[fieldId] != null && content[fieldId] !== "") return content[fieldId];
  const hit = getFieldDef(fieldId);
  return hit?.field.defaultValue ?? "";
}
