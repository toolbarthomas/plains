const { join, resolve } = require('path')
const { lstatSync, readdirSync } = require('fs')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const { sync } = require('glob');

const { getDirectories } = require('../Helpers');

/**
 * Defines the static templates for Webpack.
 *
 * @param {Object} args Defines the Plains arguments from the CLI.
 * @param {Object} env Define the environment configuration for Plains.
 */
class TemplateBuilder {
  constructor(args, env) {
    this.args = args;
    this.env = env;

    this.config = {
      module: {
        rules: []
      }
    };
  }

  /**
   * Define the TemplateBuilder to process static template files.
   */
  define() {
    const path = join(this.env.PLAINS_SRC, this.env.PLAINS_TEMPLATES_PATH);

    /**
     * Define all template directories and create a render template loader
     * instance for it.
     */
    const templateDirectories = getDirectories(path);

    /**
     * Create a render-template loader instance for each direct twig file
     * within each template directory.
     */
    templateDirectories.forEach(directory => {
      this.hookTemplate(directory);
    });
  }

  /**
   * Prepare each template file within each template directory.
   *
   * @param {String} directory Base path to the current template directory.
   */
  hookTemplate(directory) {
    const glob = sync(`${directory}/*.twig`);

    glob.forEach(path => {
      const config = {
        module: {
          rules: [{
            test: resolve(path),
            use: [{
              loader: 'render-template-loader',
              options: {
                engine: 'twig',
                locals: {
                  title: 'Render Template Loader',
                  desc: 'Rendering templates with a Webpack loader since 2017'
                },
                engineOptions: function (info) {
                  // Ejs wants the template filename for partials rendering.
                  // (Configuring a "views" option can also be done.)
                  return { filename: info.filename }
                }
              }
            }]
          }],
        },
        plugins: [
          new HtmlWebpackPlugin({
            template: resolve(path)
          })
        ],
      }

      // Define the actual template configuration.
      this.config = merge(this.config, config);
    });
  }
}

module.exports = TemplateBuilder;
