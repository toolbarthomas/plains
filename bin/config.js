const fs = require('fs');
const glob = require('glob');
const path = require('path');
const webpackMerge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const logger = require('./logger');

const babelLoader = require('./loaders/babel');
const eslintLoader = require('./loaders/eslint');

module.exports = {
  init(args, env) {
    this.args = args;
    this.env = env;

    const config = webpackMerge(
      this.getBaseConfig(),
      this.getEntryConfig(),
      this.getLoaderConfig()
    );

    return config;
  },

  /**
   * Defines the base configuration for Webpack.
   */
  getBaseConfig() {
    const baseConfig = {
      mode: this.env.PLAINS_ENVIRONMENT,
      output: {
        path: this.env.PLAINS_DIST,
        publicPath: '/',
      },
      devServer: {
        host: this.env.PLAINS_HOSTNAME,
        port: this.env.PLAINS_PORT,
      },
    };

    return baseConfig;
  },

  /**
   * Defines the entry configuration for Webpack.
   */
  getEntryConfig() {
    const entries = glob.sync(`${this.env.PLAINS_SRC}/templates/*/index.js`);

    const entryConfig = {
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
        const name = entry.replace(`${this.env.PLAINS_SRC}/`, '').replace(extension, '');

        // Define the path of the optional json file for the current template.
        const jsonPath = entry.replace(extension, '.json');

        const defaults = {
          filename: `${name}.html`,
        };

        /**
         * Defines the options from the optional json file located within current
         * template directory.
         */
        const options = Object.assign(defaults, this.getTemplateData(jsonPath));

        // Create a new HtmlWebpack plugin to create a html file.
        const page = new HtmlWebpackPlugin(options);

        // Queue the current entry file
        entryConfig.entry[name] = [entry];

        // Include the HMR middleware if the Plains is running under the devServer.
        if (this.env.PLAINS_ENVIRONMENT === 'development' && this.args.serve) {
          const address = `${this.env.PLAINS_HOSTNAME}:${this.env.PLAINS_PORT}`;

          entryConfig.entry[name].unshift(`webpack-dev-server/client?//${address}`);
        }

        // Queue the current entry file for Webpack.
        entryConfig.plugins.push(page);
      });
    }

    // Return all entry files.
    return entryConfig;
  },

  /**
   * Define the aditional data the current template.
   *
   * @param {String} jsonPath The path to the defined json file from the given entry.
   */
  getTemplateData(jsonPath) {
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

  /**
   * Define the required Loaders.
   */
  getLoaderConfig() {
    const loaderConfig = {
      module: {
        rules: [babelLoader, eslintLoader],
      },
    };

    return loaderConfig;
  },
};
