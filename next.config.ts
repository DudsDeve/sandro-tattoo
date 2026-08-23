import type { NextConfig } from "next";

function supabaseHostnames() {
  const hosts = new Set<string>(["**.supabase.co"]);
  for (const raw of [process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_URL]) {
    if (!raw) continue;
    try {
      hosts.add(new URL(raw).hostname);
    } catch {
      /* ignore */
    }
  }
  return [...hosts];
}

const nextConfig: NextConfig = {
  transpilePackages: ["next-sanity", "sanity"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "oaidalleapiprodscus.blob.core.windows.net" },
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "public.blob.vercel-storage.com" },
      ...supabaseHostnames().map((hostname) => ({ protocol: "https" as const, hostname })),
    ],
  },
};

export default nextConfig;
