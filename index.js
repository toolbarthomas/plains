const _ = require("lodash");
const webpack = require("webpack");
const webpackMerge = require("webpack-merge");

const config = require("./bin/config").init();
const webpackEntries = require("./bin/webpack-entries");
const webpackPages = require("./bin/webpack-pages");
const webpackEnvironmentConfig = require("./bin/webpack-environment-config");

/**
 * Set the configuration for Webpack based on the defined environment.
 * Configuration should be defined for each environment by creating an
 * environment specific config file. The suffix of the filename must be the
 * same as the given environment value, for example:
 *
 * `webpack.config.development` should be created if `PLAINS_ENVIRONMENT`
 * is set to `development`.
 */
const webpackConfig = webpackMerge(
  {
    mode: config.PLAINS_ENVIRONMENT,
    entry: webpackEntries.getEntries(),
    plugins: _.merge(webpackPages.getPages()),
    state: "minimimal"
  },
  webpackEnvironmentConfig.getConfig()
);

console.log(webpackPages.getPages());

return;

console.log(webpackConfig);

// Run webpack with the custom configuration.
webpack(webpackConfig);
