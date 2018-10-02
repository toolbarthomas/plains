const _ = require("lodash");
const path = require("path");

const webpackMerge = require("webpack-merge");

const webpackEntries = require(path.resolve(__dirname, "./build/webpack-entries"))();
const webpackPages = require(path.resolve(__dirname, "./build/webpack-pages"))();
const webpackEnvironmentConfig = require(path.resolve(__dirname, "./build/webpack-environment-config"))();

module.exports = webpackMerge(
  {
    mode: "none",
    entry: webpackEntries,
    plugins: _.merge(webpackPages),
    stats: "minimal"
  },
  webpackEnvironmentConfig
);
