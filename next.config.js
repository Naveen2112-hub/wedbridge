/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /src[\\/]pages[\\/].*\.(ts|tsx|js|jsx)$/,
      loader: "ignore-loader",
    });
    return config;
  },
};
module.exports = nextConfig;
