import type { NextConfig } from 'next';

const config: NextConfig = {
  experimental: { serverActions: { bodySizeLimit: '32mb' } },
  agentRules: false,
  devIndicators: false,
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined
};
export default config;
