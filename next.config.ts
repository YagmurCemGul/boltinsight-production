import type { NextConfig } from 'next';
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  // Empty turbopack config required when webpack config exists (Next.js 16)
  turbopack: {},

  // Production source maps disabled for smaller bundles
  productionBrowserSourceMaps: false,

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },

  // Compression enabled
  compress: true,

  // Experimental optimizations - tree shake large icon libraries
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  // Webpack optimizations for code splitting
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          // Separate Tiptap into its own chunk
          tiptap: {
            test: /[\\/]node_modules[\\/](@tiptap)[\\/]/,
            name: 'tiptap',
            chunks: 'all',
            priority: 20,
          },
          // Separate Radix UI into its own chunk
          radix: {
            test: /[\\/]node_modules[\\/](@radix-ui)[\\/]/,
            name: 'radix',
            chunks: 'all',
            priority: 20,
          },
          // Separate Yjs collaboration libs
          collaboration: {
            test: /[\\/]node_modules[\\/](yjs|y-prosemirror|y-websocket|y-indexeddb|@hocuspocus)[\\/]/,
            name: 'collaboration',
            chunks: 'all',
            priority: 20,
          },
          // Separate export libraries (jsPDF, docx, pptxgenjs)
          exports: {
            test: /[\\/]node_modules[\\/](jspdf|docx|pptxgenjs|file-saver)[\\/]/,
            name: 'exports',
            chunks: 'all',
            priority: 20,
          },
        },
      };
    }
    return config;
  },
};

export default withBundleAnalyzer(nextConfig);
