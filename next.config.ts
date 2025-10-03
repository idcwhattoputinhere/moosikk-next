import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // forceSwcTransforms: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.ytimg.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
  serverExternalPackages:["cheerio", "yt-search"],
};

export default nextConfig;
