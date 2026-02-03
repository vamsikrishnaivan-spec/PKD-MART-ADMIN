/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.telegram.org",
        pathname: "/file/**",
      },
      {
        protocol: "https",
        hostname: "img.pkdmart.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
}

export default nextConfig
