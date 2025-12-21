const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@aurora-scholar/sdk'],
  // Next.js 16: serverComponentsExternalPackages is now stable as serverExternalPackages
  serverExternalPackages: ['@solana/web3.js'],
  // Next.js 15: fetch requests are no longer cached by default
  // If needed, use fetchCache = 'default-cache' or cache: 'force-cache' in fetch calls
  // Next.js 16: Turbopack is now default for dev and build
  webpack: (config, { isServer }) => {
    // Ignore filesystem access during build
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
};

module.exports = withNextIntl(nextConfig);
