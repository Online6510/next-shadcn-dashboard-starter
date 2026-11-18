import type { NextConfig } from 'next';

const config: NextConfig = {
  agentRules: false,
  devIndicators: false,
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined
};
export default config;
