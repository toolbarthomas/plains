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
    const webpackConfigPath = path.resolve(process.cwd(), "webpack.config.js");
    let webpackConfig = {};

    // Use the defined default configuration of Webpack as base configuration.
    if (fs.existsSync(webpackConfigPath)) {
      // eslint-disable-next-line
      webpackConfig = require(webpackConfigPath);
    }

    // Define all configuration for the defined Plains environment.
    const environmentConfig = this.getEnvironmentConfig();

    // Return the merged Webpack configuration.
    return webpackMerge(webpackConfig, environmentConfig);
  },

  /**
   * Use the Webpack configuration file if `PLAINS_ENVIRONMENT` constant is defined.
   * Webpack will try to load: `webpack.config.${PLAINS_ENVIRONMENT}.js if it exists.
   */
  getEnvironmentConfig() {
    const environmentConfigPath = path.resolve(
      process.cwd(),
      `webpack.config.${config.PLAINS_ENVIRONMENT}.js`
    );

    // Check if the webpack configuration exists for the defined PLAINS_ENVIRONMENT.
    if (!fs.existsSync(environmentConfigPath)) {
      message.warning(
        `The webpack configuration file for "${config.PLAINS_ENVIRONMENT}" could not been found.`
      );

      message.warning(
        `Webpack will ignore the specific configuration for "${config.PLAINS_ENVIRONMENT}".`
      );

      message.warning(
        `Be sure to create a Webpack configuration specific for "${config.PLAINS_ENVIRONMENT}".`
      );

      return {};
    }

    // eslint-disable-next-line
    const environmentConfig = require(environmentConfigPath);

    /**
     * Check if the existing configuration is a valid Javascript Object.
     * Ouput a warning if the configuration file is invalid.
     */
    if (!(environmentConfig instanceof Object) || environmentConfig.constructor !== Object) {
      message.warning(
        `The defined configuration for "${config.PLAINS_ENVIRONMENT}"
        is not a valid configuration object for Webpack.`
      );

      message.warning(
        `Webpack will ignore the specific configuration for "${config.PLAINS_ENVIRONMENT}".`
      );

      return {};
    }

    const entry = this.getEntries();

    if (entry instanceof Object && Object.keys(entry).length > 0) {
      environmentConfig['entry'] = entry;
    }

    return environmentConfig;
  },

  /**
   * Define one or more entry files for Webpack, each entry file is defined as
   * a subdirectory within the `templates` directory in the `PLAINS_SRC` directory.
   */
  getEntries() {
    const templates = glob.sync(`${config.PLAINS_SRC}/templates/*/index.js`);

    const entries = {};

    if (!templates || !templates.length) {
      return entries;
    }

    templates.forEach(template => {
      const stats = fs.statSync(template);

      // Skip empty entry files.
      if (!stats.size) {
        return;
      }

      // Strip out the extension before defining the entry key.
      const extension = path.extname(template);

      // Define the entry key for the current Webpack entry file.
      const name = template.replace(`${config.PLAINS_SRC}/`, "").replace(extension, "");

      // Queue the current entry file
      entries[name] = template;
    });

    // Return all entry files.
    return entries;
  },

  /**
   * Generates a page template for each Webpack entry file.
   */
  getPages() {
    const templates = glob.sync(`${config.PLAINS_SRC}/templates/*/index.html`);

    if (templates.length === 0) {
      return;
    }

    // Store each rendered Webpack Html page.
    const pages = [];

    templates.forEach(template => {
      const filename = template.replace(`${config.PLAINS_SRC}/`, "");
      const extension = path.extname(template);

      // Scopes the related entry file to our template.
      const chunks = [template.replace(`${config.PLAINS_SRC}/`, "").replace(extension, "")];

      const page = new HtmlWebpackPlugin({
        filename,
        template,
        chunks,
      });

      if (!page) {
        return;
      }

      pages.push(page);
    });

    // eslint-disable-next-line consistent-return
    return pages;
  },
};
