import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Chunk splitting strategy for better caching
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          const normalizedId = id.replace(/\\/g, '/');

          // Vendor chunks
          if (normalizedId.includes('node_modules')) {
            // React Router
            if (normalizedId.includes('/node_modules/react-router') || normalizedId.includes('/node_modules/@remix-run/router')) {
              return 'vendor-router';
            }
            // React & React DOM
            if (
              normalizedId.includes('/node_modules/react/') ||
              normalizedId.includes('/node_modules/react-dom/') ||
              normalizedId.includes('/node_modules/scheduler/')
            ) {
              return 'vendor-react';
            }
            // UI libraries (Radix UI, shadcn/ui)
            if (
              normalizedId.includes('/node_modules/@radix-ui/') ||
              normalizedId.includes('/node_modules/class-variance-authority/') ||
              normalizedId.includes('/node_modules/clsx/') ||
              normalizedId.includes('/node_modules/tailwind-merge/')
            ) {
              return 'vendor-ui';
            }
            // TanStack Query
            if (normalizedId.includes('/node_modules/@tanstack/react-query/')) {
              return 'vendor-query';
            }
            // Icons (Lucide)
            if (normalizedId.includes('/node_modules/lucide-react/')) {
              return 'vendor-icons';
            }
            // Form libraries
            if (
              normalizedId.includes('/node_modules/react-hook-form/') ||
              normalizedId.includes('/node_modules/@hookform/') ||
              normalizedId.includes('/node_modules/zod/')
            ) {
              return 'vendor-forms';
            }
            if (normalizedId.includes('/node_modules/recharts/') || normalizedId.includes('/node_modules/d3-')) {
              return 'vendor-charts';
            }
            if (normalizedId.includes('/node_modules/@uiw/')) {
              return 'vendor-markdown-ui';
            }
            if (normalizedId.includes('/node_modules/@codemirror/')) {
              return 'vendor-codemirror';
            }
            if (normalizedId.includes('/node_modules/micromark')) {
              return 'vendor-micromark';
            }
            if (
              normalizedId.includes('/node_modules/mdast-') ||
              normalizedId.includes('/node_modules/hast-') ||
              normalizedId.includes('/node_modules/unist-') ||
              normalizedId.includes('/node_modules/vfile')
            ) {
              return 'vendor-markdown-ast';
            }
            if (
              normalizedId.includes('/node_modules/markdown') ||
              normalizedId.includes('/node_modules/remark') ||
              normalizedId.includes('/node_modules/rehype') ||
              normalizedId.includes('/node_modules/unified')
            ) {
              return 'vendor-markdown';
            }
            // Other vendors
            return 'vendor-others';
          }
        },
        // Optimize chunk file names
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()
            : 'chunk';
          return `js/${chunkInfo.name}-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext || '')) {
            return `images/[name]-[hash][extname]`;
          }
          if (/woff2?|eot|ttf|otf/i.test(ext || '')) {
            return `fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1100,
    // Source maps for production debugging (optional, can disable for smaller bundles)
    sourcemap: mode === 'development',
    // Vite 8 defaults to Oxc for minification.
    minify: 'oxc',
    // CSS code splitting
    cssCodeSplit: true,
    // Optimize assets
    assetsInlineLimit: 4096, // Inline assets < 4KB
  },
  // Optimize dependencies pre-bundling
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
    ],
    exclude: [],
  },
}));
