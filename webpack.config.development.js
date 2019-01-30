const VueLoaderPlugin = require('vue-loader/lib/plugin');

const config = require('./bin/environment-config').init();

module.exports = {
  mode: 'development',
  stats: true,
  output: {
    path: config.PLAINS_DIST,
    publicPath: '/',
  },
  devServer: {
    compress: false,
    contentBase: config.PLAINS_DIST,
    inline: true,
    host: config.PLAINS_HOSTNAME,
    open: true,
    publicPath: '/',
    port: config.PLAINS_PORT,
  },
  plugins: [new VueLoaderPlugin()],
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
        use: ['vue-style-loader', 'css-loader'],
      },
    ],
  },
};
