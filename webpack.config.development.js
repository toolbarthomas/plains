const VueLoaderPlugin = require('vue-loader/lib/plugin');

const config = require('./bin/environment-config').init();

module.exports = {
  mode: 'development',
  output: {
    path: config.PLAINS_DIST,
    publicPath: '/',
  },
  devServer: {
    compress: false,
    contentBase: config.PLAINS_DIST,
    host: config.PLAINS_HOSTNAME,
    inline: true,
    open: true,
    port: config.PLAINS_PORT,
    publicPath: '/',
    stats: {
      colors: true,
    },
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
