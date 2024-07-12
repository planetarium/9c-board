/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
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
      },
      {
        source: '/odin-main/:path*',
        destination: "/odin/:path*",
        permanent: true
      },
      {
        source: '/heimdall-main/:path*',
        destination: "/heimdall/:path*",
        permanent: true
      }
    ]
  }
}

module.exports = nextConfig
