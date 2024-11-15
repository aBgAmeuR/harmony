/** @type {import('next').NextConfig} */
const nextConfig = {
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

module.exports = nextConfig;
