/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
  // Compressão gzip automática
  compress: true,
  // Evita rebuild em arquivos não alterados
  poweredByHeader: false,
};

export default nextConfig;
