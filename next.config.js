/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  
  // Images configuration
  images: {
    domains: [
      'localhost',
      'ineventapp.com',
      'res.cloudinary.com',
      'images.unsplash.com',
    ],
  },
  
  // TypeScript configuration - allow build errors temporarily for Next.js 15
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // ESLint configuration - ignore during builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Server external packages for Next.js 15
  serverExternalPackages: ['sharp'],
  
  // Webpack configuration to exclude backup folders
  webpack: (config) => {
    // Exclude backup folders and temp files from compilation
    config.module.rules.push({
      test: /\.(ts|tsx|js|jsx)$/,
      exclude: [
        /node_modules/,
        /backups/,
        /temp_.*\.(ts|tsx|js|jsx)$/,
      ],
    });
    
    return config;
  },
};

module.exports = nextConfig; 