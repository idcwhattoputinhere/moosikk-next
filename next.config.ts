import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // forceSwcTransforms: true,
    serverComponentsExternalPackages: ['yt-search', 'cheerio'],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.ytimg.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
};

export default nextConfig;
