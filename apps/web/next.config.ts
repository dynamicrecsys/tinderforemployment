import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@tfe/shared'],
};

export default nextConfig;
