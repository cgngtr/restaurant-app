/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'xnvthkktqmrwqrxnzlwg.supabase.co'],
    unoptimized: process.env.NODE_ENV === 'development',
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  webpack: (config, { dev, isServer }) => {
    // Optimize webpack configuration
    if (dev && !isServer) {
      config.watchOptions = {
        ignored: ['**/node_modules', '**/.git', '**/.next'],
        aggregateTimeout: 300,
        poll: false,
      }
    }

    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    }

    return config
  },
  // Development settings
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 60 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 5,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  }
}

module.exports = nextConfig 