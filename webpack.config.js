const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development';

const filename = (ext) => (isDev ? `[name].${ext}` : `[name].[contenthash].${ext}`);

const optimization = (config) =>
  isDev
    ? config
    : {
        ...config,
        minimizer: [new OptimizeCssAssetsWebpackPlugin(), new TerserWebpackPlugin()],
      };

const cssLoaders = (loaders = []) => [
  {
    loader: MiniCssExtractPlugin.loader,
    options: {
      hmr: isDev,
      reloadAll: true,
    },
  },
  'css-loader',
  ...loaders,
];

const jsLoaders = (loaders = [], plugins = []) => [
  {
    loader: 'babel-loader',
    options: {
      presets: ['@babel/preset-env', '@babel/preset-react'],
      plugins: ['@babel/plugin-proposal-class-properties', ...plugins],
    },
  },
  {
    loader: 'eslint-loader',
  },
  ...loaders,
];

module.exports = {
  mode: 'development',
  entry: ['@babel/polyfill', './src/index.js'],
  output: {
    filename: filename('js'),
    path: path.resolve(__dirname, 'build'),
  },
  resolve: {
    alias: {
      '@public': path.resolve(__dirname, 'public'),
    },
  },
  optimization: optimization({
    splitChunks: {
      chunks: 'all',
    },
  }),
  devServer: {
    port: 3000,
    hot: isDev,
  },
  devtool: isDev ? 'source-map' : '',
  plugins: [
    new HTMLWebpackPlugin({
      template: './public/index.html',
      minify: { collapseWhitespace: !isDev },
    }),
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, 'public/favicon.ico'),
        to: path.resolve(__dirname, 'build'),
      },
      {
        from: path.resolve(__dirname, 'public/manifest.json'),
        to: path.resolve(__dirname, 'build'),
      },
      {
        from: path.resolve(__dirname, 'public/robots.txt'),
        to: path.resolve(__dirname, 'build'),
      },
      {
        from: path.resolve(__dirname, 'public/logo192.png'),
        to: path.resolve(__dirname, 'build'),
      },
      {
        from: path.resolve(__dirname, 'public/logo512.png'),
        to: path.resolve(__dirname, 'build'),
      },
    ]),
    new MiniCssExtractPlugin({
      filename: filename('css'),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: cssLoaders(),
      },
      {
        test: /\.s[ac]ss$/,
        use: cssLoaders(['sass-loader']),
      },
      {
        test: /\.less$/,
        use: cssLoaders(['less-loader']),
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: jsLoaders(),
      },
      {
        test: /\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$/,
        use: ['file-loader'],
      },
      {
        test: /\.xml$/,
        use: ['xml-loader'],
      },
    ],
  },
};
