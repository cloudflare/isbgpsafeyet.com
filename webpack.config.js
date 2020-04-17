const path = require('path');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const PurgeCSSPlugin = require('purgecss-webpack-plugin');

module.exports = {
  entry: [
    './src/js/index.js',
    './src/css/index.css',
  ],
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
      path: path.resolve(__dirname, 'public'),
    }),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
    }),
    new HtmlWebpackPlugin({
      template: 'src/404.html', 
      filename: '404.html',
    }),
    new CopyPlugin([
      'resources/*',
    ]),
  ],
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'public'),
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
  optimization: {
    minimizer: [
      new TerserPlugin(),
      new PurgeCSSPlugin({
        paths: ['./src/index.html', './src/404.html'],
        variables: true,

        /* Created by index.js */
        whitelistPattern: '/svg/',
      }),
    ],
  },
};
