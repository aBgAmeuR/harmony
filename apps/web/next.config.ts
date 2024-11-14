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
};

export default nextConfig;
