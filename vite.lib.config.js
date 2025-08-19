import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  // Put final files directly into /lib so publish surface stays the same
  build: {
    outDir: 'lib',
    emptyOutDir: false,           // don't wipe if you pre-copied assets
    lib: {
      // Library entry (source)
      entry: path.resolve(__dirname, 'src/components/app/index.js'),
      // We want a CJS main (matches your package.json "main")
      formats: ['cjs'],
      // Vite's 'fileName' is ignored when using rollupOptions.entryFileNames;
      // we set the exact path in rollupOptions below.
      fileName: () => 'components/app/index.js',
    },
    rollupOptions: {
      // Do not bundle host React et al.
      external: [
        'react',
        'react-dom',
        // anything else you previously externalized
        'plotly.js-dist-min',
      ],
      output: {
        // Ensure the entry lands at lib/components/app/index.js
        entryFileNames: 'components/app/index.js',

        // Keep chunk names tidy if any are produced (usually minimal due to lib mode)
        chunkFileNames: 'chunks/[name].js',

        // Send CSS to exactly the path consumers expect
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || '';
          if (name.endsWith('.css')) {
            return 'styles/styles.min.css';
          }
          // keep other assets under assets/
          return 'assets/[name][extname]';
        },

        // CJS export detection (usually not needed but harmless)
        exports: 'auto',
      },
    },
    // Smaller, deterministic output
    minify: true,
    sourcemap: false,
    // Make sure we don't inject a base path (we publish files directly under /lib)
    // (default base is fine; just don't set it to anything else)
  },

  // Avoid duplicate React (especially when testing lib-build in a Vite app)
  resolve: {
    dedupe: ['react', 'react-dom'],
  },

  define: {
    'process.env': {}, // keep parity with your app config
  },
});
