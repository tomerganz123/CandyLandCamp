/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', '127.0.0.1'],
  },
  swcMinify: false,
  // Local development optimizations
  experimental: {
    optimizeCss: false, // Faster builds in development
  },
  // Enable source maps for better debugging
  productionBrowserSourceMaps: false,
  // Faster refresh in development
  reactStrictMode: true,
  // Local development server configuration
  async rewrites() {
    return [
      // Redirect root to public home page for local development
      {
        source: '/public-home',
        destination: '/home',
      },
    ]
  },
}

module.exports = nextConfig
