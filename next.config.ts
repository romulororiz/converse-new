import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['book-chat-redesign.cluster-3.preview.emergentcf.cloud', 'book-chat-redesign.preview.emergentagent.com'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  webpack: config => {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      '@': path.resolve(__dirname),
    };
    return config;
  },
};

export default nextConfig;
