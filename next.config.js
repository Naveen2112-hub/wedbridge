/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { serverActions: { bodySizeLimit: "2mb" } },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com" },
    ],
  },
};
module.exports = nextConfig;
