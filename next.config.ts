import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';
const REPO_NAME = 'gestor-turnos-psi';

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },

  basePath: isProd ? `/${REPO_NAME}` : undefined,
  assetPrefix: isProd ? `/${REPO_NAME}/` : undefined,

  trailingSlash: true,
};

export default nextConfig;
