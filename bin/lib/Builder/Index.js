const { resolve } = require('path');
const merge = require('webpack-merge');

const Loader = require('./Loader');
const Entries = require('./Entries');
const TemplateBuilder = require('./TemplateBuilder');

/**
 * Resource builder for Plains.
 *
 * @param {Object} args Defines the Plains arguments from the CLI.
 * @param {Object} env Define the environment configuration for Plains.
 */
class Builder {
  constructor(args, env) {
    this.args = args;
    this.env = env;

    // Define the global Webpack configuration.
    this.config = {
      mode: env.PLAINS_ENVIRONMENT,
      output: {
        path: resolve(env.PLAINS_DIST),
        publicPath: '/',
      },
    }
  }

  /**
   * Define the Builder configuration for Webpack.
   */
  define() {
    const { args, env } = this;

    // Create all builder instances.
    const instances = [
      new Loader(args, env),
      new Entries(args, env),
      new TemplateBuilder(args, env)
    ]

    // Hook all builder instances within the Webpack configuration.
    instances.forEach(instance => {
      instance.define();

      this.config = merge(this.config, instance.config);
    });

    // Enable Hot Module Reload support within the Webpack devServer.
    if (env.PLAINS_DEVMODE && args.serve) {
      this.config.devServer = {
        host: env.PLAINS_HOSTNAME,
        port: env.PLAINS_PORT
      }
    }
  }
}

module.exports = Builder;
