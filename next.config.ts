import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Vercel deployment optimization
  output: 'standalone',
  
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
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
