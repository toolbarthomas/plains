const fs = require('fs');
const glob = require('glob');
const path = require('path');
const webpackMerge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const Plains = require('./Plains');
const Logger = require('./utils/Logger');

const babelBuilder = require('./builders/babel');
const eslintBuilder = require('./builders/eslint');
const svgSpriteBuilder = require('./builders/svgsprite');
const vueBuilder = require('./builders/vue');
const styleBuilder = require('./builders/style');

class Config {
  constructor(args, env) {
    this.args = args;
    this.env = env;
    this.webpack = {};

    this.init();
  }

  init() {
    Logger.info('Defining configuration for Webpack');

    this.defineBaseConfig();
    this.defineEntryConfig();
    this.defineTemplateConfig();
    this.defineBuilderConfig();

    this.webpack = webpackMerge(
      this.baseConfig,
      this.entryConfig,
      this.templateConfig,
      this.builderConfig
    );

    Logger.success('Webpack configuration successfully defined.');
  }

  /**
   * Define the base configuration for Webpack.
   */
  defineBaseConfig() {
    this.baseConfig = {
      mode: Plains.env.PLAINS_ENVIRONMENT,
      output: {
        path: Plains.env.PLAINS_DIST,
        publicPath: '/',
      },
      module: {
        rules: [
          {
            test: /\.(png|jpg|gif)$/i,
            use: {
              loader: 'file-loader',
              options: {
                outputPath: (url, resourcePath, context) => {
                  const outputPath = path.relative(this.env.PLAINS_SRC, resourcePath);
                  const dirname = path.dirname(outputPath);

                  return path.join(dirname, url);
                },
              },
            },
          },
        ],
      },
    };

    // Enable the devServer only for development environments.
    if (Plains.env.PLAINS_ENVIRONMENT === 'development' && Plains.args.serve) {
      // Remove the resolved path form the destination path.
      this.baseConfig.output.publicPath = path.relative(process.cwd(), this.env.PLAINS_DIST);

      this.baseConfig.devServer = {
        host: Plains.env.PLAINS_HOSTNAME,
        port: Plains.env.PLAINS_PORT,
      };
    }
  }

  /**
   * Define all Webpack entries within the PLAINS_TEMPLATES directory.
   */
  defineEntryConfig() {
    const entries = Config.getWebpackEntries();

    this.entryConfig = {
      context: Plains.env.PLAINS_DIST,
      entry: {},
    };

    if (entries.length > 0) {
      entries.forEach(entry => {
        const name = Config.getEntryName(entry);

        // Define the name of the initial entry file.
        this.entryConfig.entry[name] = [entry];

        // Enable WDS for the current entry.
        if (this.env.PLAINS_ENVIRONMENT === 'development' && this.args.serve) {
          const address = `http://${this.env.PLAINS_HOSTNAME}:${this.env.PLAINS_PORT}`;

          this.entryConfig.entry[name].unshift(`webpack-dev-server/client?${address}`);
        }
      });
    }
  }

  /**
   * Renders the included template for the given entry file.
   * Generate a static Html page if there is no template file defined within
   * the directory of the current entry.
   */
  defineTemplateConfig() {
    const entries = Config.getWebpackEntries();

    if (entries.length > 0) {
      this.templateConfig = {
        plugins: [],
      };

      entries.forEach(entry => {
        const name = Config.getEntryName(entry);

        // Define the default configuration for HtmlWebpackPlugin.
        const defaults = {
          filename: `${name}.html`,
          inject: true,
        };

        /**
         * Defines the options from the optional json file located within current
         * template directory.
         */
        const options = Object.assign(defaults, Config.getTemplateData(entry));

        // Bundles the current entry file with a static HTML template.
        const page = new HtmlWebpackPlugin(options);

        // Queue the current entry for Webpack.
        this.templateConfig.plugins.push(page);
      });
    }
  }

  defineBuilderConfig() {
    this.builderConfig = webpackMerge(
      babelBuilder,
      eslintBuilder,
      svgSpriteBuilder,
      vueBuilder,
      styleBuilder
    );
  }

  /**
   * Define the entry files from a globbing search within the
   * Plains template directory and exclude empty entry files.
   *
   * @returns {Array} Array with all paths to the found entry files.
   */
  static getWebpackEntries() {
    const globPath = path.resolve(
      Plains.env.PLAINS_SRC,
      Plains.env.PLAINS_TEMPLATES_PATH,
      '*/index.js'
    );

    return glob.sync(globPath).filter(entry => {
      return fs.statSync(entry).size;
    });
  }

  /**
   * Define Webpack entry key from the given entry.
   *
   * @param {String} entry The path of the current entry file.
   *
   * @returns {String} The relative path without extension.
   */
  static getEntryName(entry) {
    // Define the extension so it can be removed from the entry path.
    const extension = path.extname(entry);

    /**
     * Make the path of the current entry file relative by removing the
     * working source directory.
     */
    return entry.replace(`${Plains.env.PLAINS_SRC}/`, '').replace(extension, '');
  }

  /**
   * Define the aditional data for the current entry.
   *
   * @param {String} jsonPath The path to the defined json file from the given entry.
   */
  static getTemplateData(entry) {
    const extension = path.extname(entry);
    const jsonPath = entry.replace(extension, '.json');

    let data = {};

    if (fs.existsSync(jsonPath) && fs.statSync(jsonPath).size) {
      try {
        const file = fs.readFileSync(jsonPath, 'utf8');

        data = JSON.parse(file);
      } catch (error) {
        Logger.warning(`The optional json file at '${jsonPath}' is not valid and will be ignored.`);
      }
    }

    return data;
  }
}

module.exports = new Config(Plains.args, Plains.env);
