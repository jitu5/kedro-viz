const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const rules = [
  {
    test: /\.(js|jsx)$/,
    exclude: /node_modules/,
    use: {
      loader: 'babel-loader',
      options: {
        presets: [
          ['@babel/preset-env', { modules: false }],
          '@babel/preset-react',
        ],
      },
    },
  },
  {
    test: /\.scss$/,
    use: [
      MiniCssExtractPlugin.loader,
      { loader: 'css-loader', options: { importLoaders: 1 } },
      'postcss-loader',
      'sass-loader',
    ],
    sideEffects: true,
  },
  {
    test: /graph-worker\.js$/,
    use: [
      {
        loader: 'worker-loader',
        options: { inline: 'no-fallback', esModule: true, type: 'module' },
      },
    ],
  },
];

module.exports = [
  {
    mode: 'production',

    // IMPORTANT: build from src so aliasing works
    entry: {
      'components/app/index': './src/components/app/index.js',
    },

    output: {
      path: path.resolve(__dirname, 'lib'),
      filename: '[name].js', // → lib/components/app/index.js
      libraryTarget: 'commonjs2', // keep your CJS entry surface
    },

    module: { rules },

    resolve: {
      extensions: ['.js', '.jsx'],

      // ✅ FIX: alias belongs here, not top-level
      // Map the Vite-friendly worker wrapper → Blob wrapper ONLY for this build
      alias: {
        [path.resolve(__dirname, 'src/utils/worker.js')]: path.resolve(
          __dirname,
          'src/utils/worker.blob.js'
        ),
      },
    },

    plugins: [new MiniCssExtractPlugin({ filename: 'styles/styles.min.css' })],
  },
];
