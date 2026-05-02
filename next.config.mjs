/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Forcing dev server to bind cleanly after sandbox-level zombie state
  reactStrictMode: false,
}

export default nextConfig
