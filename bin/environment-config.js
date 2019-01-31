const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const env = require('dotenv');

module.exports = {
  /**
   * Define the configuration based for the working environment.
   * Plains will use the `production` environment configuration as fallback, if
   * the actual configuration is missing from the working environment.
   */
  init() {
    let config = {};

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
    if (!('PLAINS' in process)) {
      return false;
    }

    return process.PLAINS instanceof Object && process.PLAINS.constructor === Object;
  },

  /**
   * Get the globally defined Plains configuration that has been set for the
   * running application.
   */
  getConfig() {
    return process.PLAINS;
  },

  /**
   * Define the current environment from the optional `dotenv` configuration
   * file.
   *
   * @return {Object} Return the defined environment configuration.
   */
  setConfig() {
    // Prepare the PLAINS configuratiom Object.
    process.PLAINS = {};

    let config = {};

    const dotenvPath = path.resolve(process.cwd(), '.env');

    // Use the default configuration if it doesn't exist.
    const defaults = this.getDefaults();

    /**
     * Create the environment file if the dotenev file doesn't exists and use
     * the default configuration values from `production`.
     */
    if (!fs.existsSync(dotenvPath)) {
      console.log(`The optional environment file is not defined, the default configuration will be used.`);

      config = defaults;
    }

    env.config({
      path: dotenvPath,
    });

    // Thrown an exception if the environment contains any errors.
    if (env.error) {
      throw env.error;
    }

    /**
     * Check if the default configuration keys are actually set from the found
     * dotenv environment file.
     */
    _.forEach(defaults, (value, key) => {
      if (!process.env[key]) {
        console.log(`Using default configuration value for ${key}.`);

        process.env[key] = value;
        process.PLAINS[key] = value;
      }

      config[key] = process.env[key];
    });

    console.log(`Environment configuration set, running under ${process.env.PLAINS_ENVIRONMENT}.`);

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
      PLAINS_PORT: '8080',
    };

    return defaults;
  }
}
