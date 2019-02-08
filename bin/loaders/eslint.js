module.exports = {
  test: /\.js$/,
  enforce: 'pre',
  exclude: /node_modules/,
  use: 'eslint-loader',
};
