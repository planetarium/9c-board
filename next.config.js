/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/9c-main/:path*",
        destination: "/odin/:path*",
        permanent: true,
      },
      {
        source: "/9c-internal/:path*",
        destination: "/odin-internal/:path*",
        permanent: true,
      },
      {
        source: "/agent/:address",
        destination: "/9c-main/agent/:address",
        permanent: true,
      },
      {
        source: "/avatar/:address",
        destination: "/9c-main/avatar/:address",
        permanent: true,
      },
      {
        source: "/rank",
        destination: "/9c-main/rank",
        permanent: true,
      }
    ]
  },
  webpack: (config) => {
    config.resolve.fallback = { ...config.resolve.fallback, fs: false };

    return config;
  },
}

module.exports = nextConfig
