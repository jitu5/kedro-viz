import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig({
  base: './',
  define: { 'process.env': {} },
  plugins: [
    react({
      // Use babel to transform JSX - this is more reliable for library builds
      babel: {
        presets: ['@babel/preset-react'],
        plugins: [
          ['@babel/plugin-proposal-class-properties', { loose: true }],
          ['@babel/plugin-proposal-private-property-in-object', { loose: true }],
          ['@babel/plugin-proposal-private-methods', { loose: true }]
        ]
      }
    }),
    // Generate type definitions for consumers of the library
    dts({ insertTypesEntry: true })
  ],
  server: {
    port: 4141,
    proxy: {
      '/api': {
        target: 'http://localhost:4142',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    manifest: true,
    // Configure library build: output both ES and CJS formats
    lib: {
      entry: 'src/index.js',
      name: 'KedroViz',
      fileName: (format) => (format === 'es' ? 'index.mjs' : 'index.cjs'),
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      // Mark React as a peer dependency so it's not bundled into the lib
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    },
    // Emit worker chunks into a dedicated folder
    worker: {
      format: 'es',
      rollupOptions: {
        output: {
          chunkFileNames: 'workers/[name]-[hash].js'
        }
      }
    },
    sourcemap: true,
    minify: 'esbuild'
  }
});