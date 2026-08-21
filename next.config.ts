import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["next-sanity", "sanity"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "oaidalleapiprodscus.blob.core.windows.net" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
