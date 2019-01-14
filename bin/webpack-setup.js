const HtmlWebpackPlugin = require("html-webpack-plugin");

const fs = require("fs");
const glob = require("glob");
const path = require("path");
const webpackMerge = require("webpack-merge");

const config = require("./config").init();
const message = require("./message");

const webpackConfig = require(
  path.resolve(process.cwd(), "webpack.config.js")
).resolve({});

console.log(webpackConfig);

module.exports = {

  /**
   * Set the configuration for Webpack based on the defined environment.
   * Configuration should be defined for each environment by creating an
   * environment specific config file. The suffix of the filename must be the
   * same as the given environment value, for example:
   *
   * `webpack.config.development` should be created if `PLAINS_ENVIRONMENT`
   * is set to `development`.
   */
  init() {
    const webpackConfigPath = path.resolve(process.cwd(), "webpack.config.js");
    let webpackConfig = {};

    // Use the defined default configuration of Webpack as base configuration.
    if (fs.existsSync(webpackConfigPath)) {
      webpackConfig = require(webpackConfigPath);
    }

    // Define all configuration for the defined Plains environment.
    const environmentConfig = this.getEnvironmentConfig();

    // Return the merged Webpack configuration.
    return webpackMerge(
      webpackConfig,
      environmentConfig
    );
  },

  /**
   * Use the Webpack configuration file if `PLAINS_ENVIRONMENT` constant is defined.
   * Webpack will try to load: `webpack.config.${PLAINS_ENVIRONMENT}.js if it exists.
   */
  getEnvironmentConfig() {
    const environmentConfigPath = path.resolve(process.cwd(), `webpack.config.${config.PLAINS_ENVIRONMENT}.js`);

    // Check if the webpack configuration exists for the defined PLAINS_ENVIRONMENT.
    if (!fs.existsSync(environmentConfigPath)) {
      message.warning(`The webpack configuration file for "${config.PLAINS_ENVIRONMENT}" could not been found.`);

      message.warning(`Webpack will ignore the specific configuration for "${config.PLAINS_ENVIRONMENT}".`);

      message.warning(`Be sure to create a Webpack configuration specific for "${config.PLAINS_ENVIRONMENT}".`);

      return {};
    }
    else {
      let environmentConfig = require(environmentConfigPath);

      if (environmentConfig instanceof Object && environmentConfig.constructor === "object") {
        return environmentConfig;
      }
      else {
        message.warning(`The defined configuration for "${config.PLAINS_ENVIRONMENT}" is not a valid configuration object for Webpack.`);

        message.warning(`Webpack will ignore the specific configuration for "${config.PLAINS_ENVIRONMENT}".`);

        return {};
      }
    }
  },

  /**
   * Define one or more entry files for Webpack, each entry file is defined as
   * a subdirectory within the `templates` directory in the `PLAINS_SRC` directory.
   */
  getEntries() {
    let templates = glob.sync(`${config.PLAINS_SRC}/templates/*/index.js`);

    let entries = {};

    if (!templates || !templates.length) {
      return entries;
    }

    templates.forEach((template) => {
      let stats = fs.statSync(template);

      // Skip empty entry files.
      if (!stats.size) {
        return;
      }

      // Strip out the extension before defining the entry key.
      let extension = path.extname(template);

      // Define the entry key for the current Webpack entry file.
      let name = template
        .replace(`${config.PLAINS_SRC}/`, "")
        .replace(extension, "");

      // Queue the current entry file
      entries[name] = template;
    });

    // Return all entry files.
    return entries;
  },

  /**
   * Generates the page-template for each valid Webpack entry file.
   */
  getPages() {
    let pages = glob.sync(`${config.PLAINS_SRC}/templates/*/index.html`);

    if (pages.length === 0) {
      return;
    }

    let plugins = [];

    pages.forEach((page) => {
      let filename = page.replace(config.PLAINS_SRC + "/", "");
      let extension = path.extname(page);

      // Scopes the related entry file to our template.
      let chunks = [
        page.replace(config.PLAINS_SRC + "/", "").replace(extension, "")
      ];

      let plugin = new HtmlWebpackPlugin({
        filename: filename,
        template: page,
        chunks: chunks
      });

      if (!plugin) {
        return;
      }

      plugins.push(plugin);
    });

    return plugins;
  }
}
