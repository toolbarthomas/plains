const path = require('path');

const VueLoaderPlugin = require('vue-loader/lib/plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const env = require('../env').init();

module.exports = {
  plugins: [new VueLoaderPlugin(), new MiniCssExtractPlugin()],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader:
              env.PLAINS_ENVIRONMENT === 'development'
                ? 'vue-style-loader'
                : MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'postcss-loader',
            options: {
              config: {
                path: path.resolve(process.cwd(), 'postcss.config.js'),
              },
            },
          },
        ],
      },
    ],
  },
};
