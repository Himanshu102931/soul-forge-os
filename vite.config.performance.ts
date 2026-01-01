import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

// Performance-optimized Vite configuration
// Includes bundle analysis and code splitting

export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer - generates stats.html
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Enable source maps for debugging (disable in production)
    sourcemap: false,
    
    // Optimize chunks
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-accordion', '@radix-ui/react-dialog', '@radix-ui/react-tabs'],
          'animation-vendor': ['framer-motion'],
          'query-vendor': ['@tanstack/react-query'],
          'chart-vendor': ['recharts'],
          'dnd-vendor': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
          
          // Feature chunks
          'analytics': [
            'src/components/analytics',
            'src/hooks/useAnalytics.ts',
            'src/hooks/useAdvancedAnalytics.ts',
          ],
          'achievements': [
            'src/components/achievements',
            'src/hooks/useGamification.ts',
          ],
        },
        
        // Optimize chunk naming
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    
    // Increase chunk size warning limit (we know about it)
    chunkSizeWarningLimit: 1000,
    
    // Minification settings
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug'],
      },
    },
  },
  
  // Performance settings
  server: {
    hmr: {
      overlay: false, // Disable error overlay for better performance
    },
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'framer-motion',
    ],
  },
});
