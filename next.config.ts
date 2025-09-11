import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable React StrictMode to reduce duplicate renders/API calls
  reactStrictMode: false,
  
  // Disable NextJS devtools overlay to prevent CORS issues
  experimental: {
    devOverlay: false,
    optimizePackageImports: ['@/components', '@/hooks', '@/contexts'],
  },

  // Add rewrites for API proxy to handle CORS
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/:path*`,
      },
      {
        source: '/ws/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/ws/:path*`,
      },
    ];
  },

  // Image configuration
  images: {
    remotePatterns: [
      // Allow all HTTPS URLs
      {
        protocol: 'https',
        hostname: '**',
      },
      // Allow localhost for development
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    // Keep common domains for better caching
    domains: [
      'localhost',
      'api.taskflow.app',
      'taskflow-app.vercel.app',
      'taskflow-app-git-*.vercel.app',
      'randomuser.me',
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com',
      's.gravatar.com',
      'www.gravatar.com',
      'ui-avatars.com'
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default nextConfig;
