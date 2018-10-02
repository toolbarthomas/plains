const path = require("path");
const VueLoaderPlugin = require("vue-loader/lib/plugin");

const ENV = require("./build/utils/environment");

module.exports = {
  mode: "development",
  output: {
    path: path.join(__dirname, ENV.PLAINS_DIST),
    publicPath: "/"
  },
  devServer: {
    contentBase: path.join(__dirname, ENV.PLAINS_DIST),
    publicPath: "/",
    compress: false,
    port: 8080
  },
  plugins: [new VueLoaderPlugin()],
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: "vue-loader"
      },
      {
        test: /\.js$/,
        use: "babel-loader"
      },
      {
        test: /\.css$/,
        use: ["vue-style-loader", "css-loader"]
      }
    ]
  }
};
