import type { NextConfig } from "next";

// Triggering config reload to refresh proxy/middleware cache

const nextConfig: NextConfig = {
  // Aktifkan kompresi gzip untuk semua response
  compress: true,
  
  // Gunakan SWC compiler untuk minifikasi yang lebih cepat (default di versi baru)
  // swcMinify: true,

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    root: __dirname,
  },

  experimental: {
    // Optimalkan import dari library besar agar hanya icon yang dipakai saja yang di-bundle
    // Ini mengurangi ukuran JS bundle secara signifikan
    optimizePackageImports: [
      "lucide-react", 
      "@radix-ui/react-icons", 
      "framer-motion",
      "date-fns"
    ],
  },
  
  // Optimasi caching image jika menggunakan next/image nantinya
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  async redirects() {
    return [
      {
        source: '/admin/login',
        destination: '/admin-login',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
