import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  // Compress responses
  compress: true,

  // Optimize images from external domains
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
    formats: ["image/avif", "image/webp"], // prefer modern formats
    minimumCacheTTL: 86400,               // cache images 24h
  },

  // HTTP caching.
  // JS/CSS are left to Next.js: in production its files have content hashes and are
  // already cached as immutable. Forcing "immutable" on every .js file made browsers
  // keep stale scripts in development (filenames there never change).
  async headers() {
    const rules = [
      {
        // API routes: no cache
        source: "/api/(.*)",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
    ];
    if (process.env.NODE_ENV === "production") {
      rules.push({
        // Files in /public keep their names when replaced, so cache for a day, not a year.
        source: "/:file*(svg|png|jpg|jpeg|webp|avif|ico|mp4|woff2)",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      });
    }
    return rules;
  },
};

export default nextConfig;
