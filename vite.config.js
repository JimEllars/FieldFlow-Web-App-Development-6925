import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // Bundle analyzer for production builds
    mode === 'production' && visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ].filter(Boolean),
  
  base: './',
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  
  build: {
    outDir: 'dist',
    sourcemap: mode !== 'production',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production'
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['framer-motion', 'react-icons'],
          utils: ['date-fns', 'zustand']
        }
      },
      // Handle optional dependencies gracefully
      external: (id) => {
        // Don't externalize any dependencies - let them be bundled
        return false
      }
    },
    chunkSizeWarningLimit: 1000
  },
  
  server: {
    port: 3000,
    host: true
  },
  
  preview: {
    port: 4173,
    host: true
  },
  
  // Environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'date-fns',
      'zustand'
    ],
    exclude: ['web-vitals'] // Let this be loaded dynamically
  }
}))