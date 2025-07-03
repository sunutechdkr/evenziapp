/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  
  images: {
    domains: [
      'localhost',
      'studio.evenzi.io',
      'evenzi.vercel.app',
      'res.cloudinary.com',
      'images.unsplash.com',
    ],
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  serverExternalPackages: ['sharp'],
  
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(ts|tsx|js|jsx)$/,
      exclude: [/node_modules/, /backups/, /temp_.*\.(ts|tsx|js|jsx)$/],
    });
    return config;
  },
};

module.exports = nextConfig;
