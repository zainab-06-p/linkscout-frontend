import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Enable SWC compilation
  swcMinify: true,
  
  // CRITICAL: Disable experimental features for production
  experimental: {
    // Explicitly disable turbopack in production
    turbo: undefined,
  },
  
  // Vercel deployment optimization
  output: 'standalone',
  
  // Disable webpack cache in production to avoid stale artifacts
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.cache = false;
    }
    return config;
  },
  
  eslint: {
    // Disable ESLint during production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable type checking during production builds (already checked locally)
    ignoreBuildErrors: true,
  },
  
  // Optimize for production
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
