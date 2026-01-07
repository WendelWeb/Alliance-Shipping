/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'placeholder.com'],
    formats: ['image/avif', 'image/webp'],
  },
  // External packages for server components
  serverExternalPackages: ['@neondatabase/serverless'],
}

module.exports = nextConfig
