/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["i.scdn.co"],
  },
  experimental: {
    scrollRestoration: true,
  },
}

export default nextConfig
