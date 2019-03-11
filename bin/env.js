const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const env = require('dotenv');

const logger = require('./logger');

module.exports = {
  /**
   * Define the configuration based for the working environment.
   * Plains will use the `production` environment configuration as fallback, if
   * the actual configuration is missing from the working environment.
   *
   * @return {Object} The defined environment configuration.
   */
  init(args) {
    let config = {};

    // Inherit the optional CLI parameters.
    this.args = args;

    if (this.hasConfig()) {
      config = this.getConfig();
    } else {
      config = this.setConfig();
    }

    return config;
  },

  /**
   * Check if the global configuration for Plains has been defined.
   *
   * @return {Boolean} Returns true if the configuration for Plains exists.
   */
  hasConfig() {
    if (!('PLAINS' in process) || !('config' in process.PLAINS)) {
      return false;
    }

    return process.PLAINS.config instanceof Object && process.PLAINS.config.constructor === Object;
  },

  /**
   * Get the globally defined Plains configuration that has been set for the
   * running application.
   *
   * @return {Object} Returns the defined configuration if already set.
   */
  getConfig() {
    return process.PLAINS.config;
  },

  /**
   * Define the current environment from the optional `dotenv` configuration
   * file.
   *
   * @return {Object} Return the defined environment configuration.
   */
  setConfig() {
    let config = {};

    const dotenvPath = path.resolve(process.cwd(), '.env');

    // Define the default configuration if it doesn't exist.
    const defaults = this.getDefaults();

    /**
     * Use the default environment configuration form `production` if the dotenev
     * file doesn't exists.
     */
    if (!fs.existsSync(dotenvPath)) {
      if (this.args.verbose) {
        logger.warning(
          'The optional environment file is not defined, the default configuration will be used.'
        );
      }

      config = defaults;
    }

    const environment = env.config({
      path: dotenvPath,
    });

    if (environment.error) {
      logger.error(environment.error);
    }

    logger.info('Defining environment configuration...');

    /**
     * Check if the default configuration keys are actually set from the found
     * dotenv environment file.
     */
    _.forEach(defaults, (value, key) => {
      if (!environment.parsed[key]) {
        if (this.args && this.args.verbose) {
          logger.warning(`Using default configuration value for ${key}`);
        }

        environment.parsed[key] = value;
      }
    });

    /**
     * Merge the parsed environment variables & config defaults to use within
     * the workflow.
     */
    _.merge(config, environment.parsed);

    // Make sure the source & destination paths are absolute
    const absolutePaths = ['PLAINS_SRC', 'PLAINS_DIST', 'PLAINS_PACKAGE_PATH'];

    absolutePaths.forEach(currentPath => {
      config[currentPath] = path.resolve(process.cwd(), config[currentPath]);
    });

    logger.success(`Environment configuration defined for ${process.env.PLAINS_ENVIRONMENT}!`);

    // Make the defined environment configuration global available.
    process.PLAINS = { config };

    return config;
  },

  /**
   * Returns the default configuration values for Plains.
   *
   * @return {Object} The default environment configuration.
   */
  getDefaults() {
    const defaults = {
      PLAINS_ENVIRONMENT: 'production',
      PLAINS_SRC: './src',
      PLAINS_DIST: './dist',
      PLAINS_PACKAGE_PATH: './node_modules',
      PLAINS_HOSTNAME: '127.0.0.1',
      PLAINS_PORT: 8080,
      PLAINS_CSS_MODULES: true,
      PLAINS_BASE_DIRNAME: 'base',
      PLAINS_RESOURCES_DIRNAME: 'resources',
      PLAINS_TEMPLATES_DIRNAME: 'templates',
    };

    return defaults;
  },
};
