const HtmlWebpackPlugin = require("html-webpack-plugin");

const fs = require("fs");
const glob = require("glob");
const path = require("path");
const webpackMerge = require("webpack-merge");

const config = require("./config").init();
const message = require("./message");

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
    const webpackDefaultConfig = {
      mode: "",
      entry: this.getEntries(),
      stats: "minimal",
    };

    // Define all configuration for the defined Plains environment.
    const webpackEnvironmentConfig = this.getEnvironmentConfig();

    // Return the merged Webpack configuration.
    return webpackMerge(
      webpackDefaultConfig,
      webpackEnvironmentConfig
    );
  },

  /**
   * Use the Webpack configuration file if `PLAINS_ENVIRONMENT` constant is defined.
   * Webpack will try to load: `webpack.config.${PLAINS_ENVIRONMENT}.js if it exists.
   */
  getEnvironmentConfig() {
    let environmentConfigPath = `${process.cwd()}/webpack.config.${config.PLAINS_ENVIRONMENT.toLowerCase()}.js`;

    // Check if the webpack configuration exists for the defined PLAINS_ENVIRONMENT.
    if (!fs.existsSync(environmentConfigPath)) {
      message.info(`The webpack configuration file for "${config.PLAINS_ENVIRONMENT}" could not been found.`);

      message.info(`Webpack will ignore the specific configuration for "${config.PLAINS_ENVIRONMENT}".`);

      message.info(`Be sure to create a Webpack configuration specific for "${config.PLAINS_ENVIRONMENT}".`);

      return {};
    }

    let environmentConfig = require(environmentConfigPath);

    // Return the Webpack configuration object if it exists.
    if (environmentConfig instanceof Object && environmentConfig.constructor === "object") {
      return environmentConfig;
    }
    else {
      message.info(`The defined configuration for "${config.PLAINS_ENVIRONMENT}" is not a valid configuration object for Webpack.`);

      message.info(`Webpack will ignore the specific configuration for ${config.PLAINS_ENVIRONMENT}.`);

      return {};
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
