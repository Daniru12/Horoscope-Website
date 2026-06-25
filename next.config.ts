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

  // Aggressive HTTP caching for static assets
  async headers() {
    return [
      {
        source: "/(.*\\.(?:js|css|woff2|woff|ttf|otf|svg|png|jpg|jpeg|webp|avif|ico))",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // API routes: no cache / short TTL
        source: "/api/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
