const fs = require('fs');
const glob = require('glob');
const path = require('path');
const webpackMerge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const logger = require('./logger');

const babelBuilder = require('./builders/babel');
const eslintBuilder = require('./builders/eslint');
const vueBuilder = require('./builders/vue');
const styleBuilder = require('./builders/style');
const svgSpriteBuilder = require('./builders/svgsprite');

module.exports = {
  init(args, env) {
    this.args = args;
    this.env = env;

    logger.info('Defining configuration for Webpack');

    const config = webpackMerge(
      this.getBaseConfig(),
      this.getEntryConfig(),
      this.getTemplateConfig(),
      this.getBuilderConfig()
    );

    logger.success('Webpack configuration successfully defined.');

    return config;
  },

  /**
   * Define the base configuration for Webpack.
   */
  getBaseConfig() {
    const baseConfig = {
      mode: this.env.PLAINS_ENVIRONMENT,
      output: {
        path: this.env.PLAINS_DIST,
        publicPath: '/',
      },
    };

    // Enable the devServer only for development environments.
    if (this.env.PLAINS_ENVIRONMENT === 'development') {
      baseConfig.devServer = {
        contentBase: this.env.PLAINS_DIST,
        host: this.env.PLAINS_HOSTNAME,
        port: this.env.PLAINS_PORT,
      };
    }

    return baseConfig;
  },

  /**
   * Get all entry files for Webpack defined within the Plains templates
   * directory.
   *
   * @returns {Object} Webpack configuration Object with defined entries.
   */
  getEntryConfig() {
    const entries = this.defineEntries();

    const entryConfig = {
      context: this.env.PLAINS_DIST,
      entry: {},
    };

    if (entries.length > 0) {
      entries.forEach(entry => {
        const name = this.defineEntryName(entry);

        // Define the name of the initial entry file.
        entryConfig.entry[name] = [entry];

        // Enable WDS for the current entry.
        if (this.env.PLAINS_ENVIRONMENT === 'development' && this.args.serve) {
          const address = `http://${this.env.PLAINS_HOSTNAME}:${this.env.PLAINS_PORT}`;

          entryConfig.entry[name].unshift(`webpack-dev-server/client?${address}`);
        }
      });
    }

    // Return all queued entry files.
    return entryConfig;
  },

  /**
   * Renders the included template for the given entry file.
   * Generate a static Html page if there is no template file defined within
   * the directory of the current entry.
   */
  getTemplateConfig() {
    const entries = this.defineEntries();

    const templateConfig = {
      plugins: [],
    };

    if (entries.length > 0) {
      entries.forEach(entry => {
        const name = this.defineEntryName(entry);

        // Define the default configuration for HtmlWebpackPlugin.
        const defaults = {
          filename: `${name}.html`,
          inject: true,
        };

        /**
         * Defines the options from the optional json file located within current
         * template directory.
         */
        const options = Object.assign(defaults, this.defineTemplateData(entry));

        // Bundles the current entry file with a static HTML template.
        const page = new HtmlWebpackPlugin(options);

        // Queue the current entry for Webpack.
        templateConfig.plugins.push(page);
      });
    }

    return templateConfig;
  },

  /**
   * Include the required plugins & loaders for basic Webpack resource
   * preprocessing.
   */
  getBuilderConfig() {
    const builderConfig = webpackMerge(
      babelBuilder,
      eslintBuilder,
      svgSpriteBuilder,
      vueBuilder,
      styleBuilder
    );

    return builderConfig;
  },

  /**
   * Define the entry files from a globbing search within the
   * Plains template directory and exclude empty entry files.
   *
   * @returns {Array} Array with all paths to the found entry files.
   */
  defineEntries() {
    const globPath = path.resolve(
      this.env.PLAINS_SRC,
      this.env.PLAINS_TEMPLATES_DIRNAME,
      '*/index.js'
    );

    const entries = glob.sync(globPath).filter(entry => {
      return fs.statSync(entry).size;
    });

    return entries;
  },

  /**
   * Use the relative path without extension from the current entry file.
   *
   * @param {String} entry The path of the current entry file.
   */
  defineEntryName(entry) {
    // Define the extension so it can be removed from the entry path.
    const extension = path.extname(entry);

    /**
     * Make the path of the current entry file relative by removing the
     * working source directory.
     */
    return entry.replace(`${this.env.PLAINS_SRC}/`, '').replace(extension, '');
  },

  /**
   * Define the aditional data for the current entry.
   *
   * @param {String} jsonPath The path to the defined json file from the given entry.
   */
  defineTemplateData(entry) {
    const extension = path.extname(entry);
    const jsonPath = entry.replace(extension, '.json');

    let data = {};

    if (fs.existsSync(jsonPath) && fs.statSync(jsonPath).size) {
      try {
        const file = fs.readFileSync(jsonPath, 'utf8');

        data = JSON.parse(file);
      } catch (error) {
        logger.warning(`The optional json file at '${jsonPath}' is not valid and will be ignored.`);
      }
    }

    return data;
  },
};
