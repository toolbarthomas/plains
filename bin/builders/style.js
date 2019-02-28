const path = require('path');
const _ = require('lodash');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const env = require('../env').init();

module.exports = {
  context: path.resolve(__filename),
  plugins: _.compact([
    env.PLAINS_ENVIRONMENT !== 'development' ? new MiniCssExtractPlugin() : undefined,
  ]),
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader:
              env.PLAINS_ENVIRONMENT !== 'development'
                ? MiniCssExtractPlugin.loader
                : 'vue-style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              modules: Boolean(env.PLAINS_CSS_MODULES),
              localIdentName: env.PLAINS_CSS_MODULES ? '[local]___[hash:base64:5]' : '[local]',
            },
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
