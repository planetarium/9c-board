/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
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
  }
}

module.exports = nextConfig
