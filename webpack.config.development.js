const path = require("path");
const VueLoaderPlugin = require("vue-loader/lib/plugin");

const config = require("./bin/config").init();

module.exports = {
  mode: "development",
  output: {
    path: config.PLAINS_DIST,
    publicPath: "/",
  },
  devServer: {
    contentBase: config.PLAINS_DIST,
    publicPath: "/",
    compress: false,
    port: 8080,
  },
  plugins: [new VueLoaderPlugin()],
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: "vue-loader",
      },
      {
        test: /\.js$/,
        use: "babel-loader",
      },
      {
        test: /\.css$/,
        use: ["vue-style-loader", "css-loader"],
      },
    ],
  },
};
