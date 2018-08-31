require("./config/environment")();

const _ = require("lodash");

const webpackMerge = require("webpack-merge");
const webpackEntries = require("./config/webpack-entries")();
const webpackPages = require("./config/webpack-pages")();
const webpackEnvironmentConfig = require("./config/webpack-environment-config")();

module.exports = webpackMerge(
  {
    mode: "none",
    entry: webpackEntries,
    plugins: _.merge(webpackPages),
    stats: "minimal"
  },
  webpackEnvironmentConfig
);
