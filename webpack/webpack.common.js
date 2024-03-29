const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')
const WebpackBar = require('webpackbar')
const WasmPackPlugin = require('@wasm-tool/wasm-pack-plugin')

const srcDir = '../src'
const htmlFiles = require('../src/frontend/html/pages')

module.exports = {
  entry: {
    popup: path.join(__dirname, `${srcDir}/frontend/ui/popup/popup.tsx`),
    settings: path.join(
      __dirname,
      `${srcDir}/frontend/ui/settings/settings.tsx`
    ),
    stats: path.join(__dirname, `${srcDir}/frontend/ui/stats/stats.ts`),
    background: path.join(__dirname, `${srcDir}/backend/background.ts`),
    yt: path.join(__dirname, `${srcDir}/backend/sites/youtube.ts`),
    cosmetics: path.join(__dirname, `${srcDir}/backend/sites/cosmetic.ts`),
    blocked: path.join(__dirname, `${srcDir}/frontend/ui/blocked/blocked.ts`),
  },

  output: {
    path: path.join(__dirname, '../dist'),
    filename: '[name].js',
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              import: false,
              modules: true,
            },
          },
        ],
        include: /\.module\.css$/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
        exclude: /\.module\.css$/,
      },
      {
        test: /\.woff(2)?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000,
              name: './font/[name].[ext]',
              mimetype: 'application/font-woff',
            },
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path][name].[ext]',
            },
          },
        ],
      },
      {
        test: /\.svg$/,
        loader: 'svg-inline-loader',
      },
      {
        test: /\.worker.js$/,
        loader: 'worker-loader',
      },
    ],
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },

  plugins: [
    new CopyPlugin({
      patterns: [
        // Move all of the icons from the icons folder to public. This is for
        // any icons specified in the manifest file
        { from: './frontend/icons', to: './icons', context: 'src' },

        // Copy all of the html files in the html folder to public
        ...htmlFiles.map((file) => ({
          from: `./frontend/html/${file}`,
          to: `./${file}`,
          context: 'src',
        })),

        // Copy the manifest file to public
        {
          from: './constants/manifest.json',
          to: './manifest.json',
          context: 'src',
        },
      ],
    }),

    // Rust stuff
    // new WasmPackPlugin({
    //   crateDirectory: path.join(__dirname, srcDir, 'backend', 'rust'),
    // }),

    // Nice clean progress bar for webpack
    new WebpackBar(),
  ],

  // The .wasm 'glue' code generated by Emscripten requires these node builtins,
  // but won't actually use them in a web environment. We tell Webpack to not resolve those
  // require statements since we know we won't need them.
  externals: {
    fs: true,
    path: true,
  },

  // Web assembly experiments to enable it
  experiments: {
    asyncWebAssembly: true,
  },
}
