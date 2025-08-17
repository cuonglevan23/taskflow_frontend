import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable React StrictMode to reduce duplicate renders/API calls
  reactStrictMode: false,
  
  // Additional optimizations
  experimental: {
    optimizePackageImports: ['@/components', '@/hooks', '@/contexts'],
  },
};

export default nextConfig;
