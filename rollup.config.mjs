// rollup.config.mjs
import path from 'node:path';

import webWorkerLoader from 'rollup-plugin-web-worker-loader';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import postcss from 'rollup-plugin-postcss';
import babel from '@rollup/plugin-babel';

/**
 * Custom plugin to transform worker imports from Vite format to Rollup format
 */
const transformWorkerImports = () => ({
  name: 'transform-worker-imports',
  transform(code, id) {
    if (id.includes('worker.js')) {
      // Transform Vite worker import to Rollup web-worker format
      const transformed = code.replace(
        /import\s+(\w+)\s+from\s+['"`]\.\/graph-worker\.js\?worker['"`];?/g,
        "import $1 from 'web-worker:./graph-worker.js';"
      );
      return transformed;
    }
    return null;
  }
});

/**
 * Externalize React, Babel runtime helpers, and a set of tiny CommonJS utilities
 * that often trip CommonJS interop in Rollup (we want consumers to resolve them).
 */
const external = (id) =>
  id === 'react' ||
  id === 'react-dom' ||
  /@babel\/runtime/.test(id) ||
  /^(react-is|object-assign|prop-types|use-sync-external-store|object-path)(\/|$)/.test(id);

/** Plugin stack (order matters) */
const plugins = [
  // 0) Transform worker imports first
  transformWorkerImports(),

  // 1) Worker plugin FIRST (you are importing: web-worker:./graph-worker.js)
  webWorkerLoader({
    targetPlatform: 'browser',
    inline: false, // emit a separate worker file
    fileName: 'utils/[name]-[hash].worker.js'
  }),

  // 2) Resolver before CommonJS; dedupe react to avoid duplicate trees
  resolve({
    browser: true,
    preferBuiltins: false,
    extensions: ['.mjs', '.js', '.jsx', '.json'],
    dedupe: ['react', 'react-dom']
  }),

  // 3) CommonJS interop for node_modules (non-aggressive settings)
  commonjs({
    include: /node_modules/,
    transformMixedEsModules: true,
    requireReturnsDefault: 'auto',
    ignoreDynamicRequires: true,
    defaultIsModuleExports: 'auto',
    strictRequires: false
  }),

  // 4) JSON imports (used by some deps)
  json(),

  // 5) Extract CSS to legacy path so deep import stays: /lib/styles/styles.min.css
  postcss({
    extract: path.resolve('lib/styles/styles.min.css'),
    minimize: true,
    sourceMap: true,
    modules: false,
    use: { sass: {} } // enable SCSS
  }),

  // 6) Babel with runtime helpers (standard for libraries)
  babel({
    babelHelpers: 'runtime',
    babelrc: false,
    configFile: false,
    extensions: ['.js', '.jsx'],
    presets: [
      ['@babel/preset-env', { modules: false }],
      ['@babel/preset-react', { runtime: 'automatic' }]
    ],
    plugins: [
      ['@babel/plugin-transform-runtime', {
        helpers: true,
        regenerator: false,
        useESModules: true
      }]
    ]
  })
];

// eslint-disable-next-line import/no-anonymous-default-export
export default [{
  // IMPORTANT: this is the library entry, NOT your app bootstrap.
  // If you created src/public-api.js, point to that instead.
  input: 'src/lib-entry.js',

  external,
  plugins,

  output: [
    {
      dir: 'lib',
      entryFileNames: 'index.cjs',
      format: 'cjs',
      sourcemap: true,
      chunkFileNames: 'chunks/[name]-[hash].js',
      assetFileNames: 'assets/[name]-[hash][extname]'
    },
    {
      dir: 'lib',
      entryFileNames: 'index.mjs',
      format: 'es',
      sourcemap: true,
      chunkFileNames: 'chunks/[name]-[hash].js',
      assetFileNames: 'assets/[name]-[hash][extname]'
    }
  ],

  // Quieten harmless warnings
  onwarn(warning, warn) {
    if (warning.code === 'CIRCULAR_DEPENDENCY') {return;}
    if (warning.code === 'THIS_IS_UNDEFINED') {return;}
    if (warning.code === 'MISSING_GLOBAL_NAME') {return;} // only relevant for UMD/IIFE
    warn(warning);
  }
}];
