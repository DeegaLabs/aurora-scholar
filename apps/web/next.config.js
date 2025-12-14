const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@aurora-scholar/sdk'],
  experimental: {
    serverComponentsExternalPackages: ['@solana/web3.js'],
  },
};

module.exports = withNextIntl(nextConfig);
