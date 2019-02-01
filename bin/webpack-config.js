const fs = require('fs');
const glob = require('glob');
const path = require('path');
const webpackMerge = require('webpack-merge');

const HtmlWebpackPlugin = require('html-webpack-plugin');

const logger = './logger';

module.exports = {
  init(PLAINS) {
    this.PLAINS = PLAINS || {};

    this.baseConfig = this.getBaseConfig();
    this.entryConfig = this.getEntryConfig();

    return webpackMerge(this.baseConfig, this.entryConfig);
  },

  /**
   * Define the base configuration from the optional Webpack configuration file.
   */
  getBaseConfig() {
    const baseConfig = {
      mode: this.PLAINS.config.PLAINS_ENVIRONMENT,
      output: {
        path: this.PLAINS.config.PLAINS_DIST,
        publicPath: '/',
      },
      devServer: {
        host: this.PLAINS.config.PLAINS_HOSTNAME,
        port: this.PLAINS.config.PLAINS_PORT,
      },
    };

    return baseConfig;
  },

  /**
   * Define the entry files for Webpack.
   */
  getEntryConfig() {
    const entries = glob.sync(`${this.PLAINS.config.PLAINS_SRC}/templates/*/index.js`);

    const templateConfig = {
      entry: {},
      plugins: [],
    };

    if (entries.length > 0) {
      entries.forEach(entry => {
        const stats = fs.statSync(entry);

        // Skip empty entry files.
        if (!stats.size) {
          return;
        }

        // Strip out the extension before defining the entry key.
        const extension = path.extname(entry);

        // Define the entry key for the current Webpack entry file.
        const name = entry.replace(`${this.PLAINS.config.PLAINS_SRC}/`, '').replace(extension, '');

        // Define the path of the optional json file for the current template.
        const jsonPath = entry.replace(extension, '.json');

        const defaults = {
          filename: `${name}.html`,
        };

        /**
         * Defines the options from the optional json file located within current
         * template directory.
         */
        const options = Object.assign(defaults, this.getTemplateOptions(jsonPath));

        // Create a new HtmlWebpack plugin to create a html file.
        const page = new HtmlWebpackPlugin(options);

        // Queue the current entry file
        templateConfig.entry[name] = [entry];

        // Include the HMR middleware if the Plains is running under the devServer.
        if (this.baseConfig.devServer instanceof Object && this.PLAINS.args.serve) {
          const address = `${this.PLAINS.config.PLAINS_HOSTNAME}:${this.PLAINS.config.PLAINS_PORT}`;

          templateConfig.entry[name].unshift(`webpack-dev-server/client?//${address}`);
        }

        // Queue the current entry file for Webpack.
        templateConfig.plugins.push(page);
      });
    }

    // Return all entry files.
    return templateConfig;
  },

  /**
   * Define any options that are defined for the current template.
   *
   * @param {String} jsonPath The path to the defined json file from the given entry.
   */
  getTemplateOptions(jsonPath) {
    let options = {};

    if (fs.existsSync(jsonPath) && fs.statSync(jsonPath).size) {
      try {
        const file = fs.readFileSync(jsonPath, 'utf8');

        options = JSON.parse(file);
      } catch (error) {
        logger.warning(`The optional json file at '${jsonPath}' is not valid and will be ignored.`);
      }
    }

    return options;
  },
};
