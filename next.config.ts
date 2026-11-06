import type { NextConfig } from 'next';
const config: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  poweredByHeader: false,
  reactStrictMode: true,
  productionBrowserSourceMaps: process.env.PROFILE_BUILD === 'true',
};
export default config;
