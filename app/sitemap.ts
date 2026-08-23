import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sandro-tattoo.vercel.app";
  const routes = ["", "/artistas", "/galeria", "/processo", "/loja", "/referencias", "/blog", "/wishlist", "/agendar", "/quiz", "/virtual-tryout"];
  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
  }));
}
