import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sandrotattoo.com";
  const routes = ["", "/artistas", "/galeria", "/processo", "/loja", "/blog", "/agendar", "/quiz", "/simular"];
  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
  }));
}
