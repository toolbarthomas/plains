const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const config = require('./bin/environment-config').init();

module.exports = {
  mode: 'production',
  output: {
    path: config.PLAINS_DIST,
    publicPath: __dirname,
  },
  plugins: [new VueLoaderPlugin(), new MiniCssExtractPlugin()],
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: 'vue-loader',
      },
      {
        test: /\.js$/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
};
