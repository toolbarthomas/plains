const webpack = require("webpack");
const webpackSetup = require("./bin/webpack-setup").init();

// Run webpack with the custom configuration.
webpack(webpackSetup);
