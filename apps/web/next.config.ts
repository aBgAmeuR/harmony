import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        hostname: "avatars.githubusercontent.com",
      },
      {
        hostname: "i.scdn.co",
      },
    ],
  },
  transpilePackages: ["@repo/ui"],
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
};

export default nextConfig;
