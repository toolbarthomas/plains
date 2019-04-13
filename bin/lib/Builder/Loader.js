const { dirname, join, relative } = require('path');
const merge = require('webpack-merge');

/**
 * Define the Webpack Loader configuration.
 *
 * @param {Object} args Defines the Plains arguments from the CLI.
 * @param {Object} env Define the environment configuration for Plains.
 */
class Loader {
  constructor(args, env) {
    this.args = args;
    this.env = env;

    this.config = {};
  }

  define() {
    this.defineFileLoader();
    this.defineBabelLoader();
  }

  defineFileLoader() {
    this.config = merge(this.config, {
      module: {
        rules: [
          {
            test: /\.(png|jpg|gif)$/i,
            use: {
              loader: 'file-loader',
              options: {
                outputPath: (url, resource) => {
                  const path = relative(this.env.PLAINS_SRC, resource);

                  return join(dirname(path), url);
                },
              },
            },
          }
        ]
      }
    });
  }

  defineBabelLoader() {
    this.config = merge(this.config, {
      module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /node_modules/,
            use: 'babel-loader',
          },
        ],
      }
    });
  }
}

module.exports = Loader;
