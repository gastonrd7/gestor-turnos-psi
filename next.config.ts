import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';

// ⚠️ Cambiá esto por el nombre EXACTO de tu repo (si NO es usuario.github.io)
const REPO_NAME = 'gestor-turnos-psi';

const nextConfig: NextConfig = {
  // 🔑 Le decimos a Next: “voy a exportar estático”
  output: 'export',

  // GitHub Pages no hace Image Optimization de Next:
  images: { unoptimized: true },

  // Si vas a publicar en https://usuario.github.io/REPO (no en raíz),
  // necesitás prefijar rutas a /REPO
  basePath: isProd ? `/${REPO_NAME}` : undefined,
  assetPrefix: isProd ? `/${REPO_NAME}/` : undefined,

  // Ayuda a GitHub Pages a resolver rutas como carpetas
  trailingSlash: true,
};

export default nextConfig;
