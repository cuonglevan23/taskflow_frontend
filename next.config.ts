import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./config/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ FIX: Disable experimental features that cause HMR issues
  experimental: {
    // reactCompiler: true, // ✅ DISABLED: Causes Fast Refresh issues
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // ✅ FIX: Simplified webpack config to avoid dev issues
  webpack: (config, { dev, isServer }) => {
    // ✅ FIX: Only apply alias in production to avoid HMR conflicts
    if (!dev && !isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': require('path').resolve(__dirname, './src'),
      };
    }
    return config;
  },

  // ✅ FIX: Add CORS and dev server configs
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
