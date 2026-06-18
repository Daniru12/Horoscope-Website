import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // @ts-expect-error - eslint is a valid Next.js config option but causes type issues in some versions
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
