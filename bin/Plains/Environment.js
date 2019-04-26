const { config } = require('dotenv');
const { join } = require('path');
const { existsSync } = require('fs');

const { error, info, success } = require('./Common/Logger');

const Store = require('./Store');

/**
 * Defines the Plains environment variables from the given dotenv file.
 * Use the default environment configuration for undefined options.
 */
class Environment {
  constructor() {
    this.defaults = {
      PLAINS_ENVIRONMENT: 'production',
      PLAINS_SRC: './src',
      PLAINS_DIST: './dist',
      PLAINS_PACKAGE_PATH: './node_modules',
      PLAINS_HOSTNAME: '127.0.0.1',
      PLAINS_PORT: 8080,
      PLAINS_CSS_MODULES: true,
      PLAINS_BASE_PATH: 'base',
      PLAINS_TEMPLATES_PATH: 'templates',
      PLAINS_RESOURCES_DIRNAME: 'resources',
    };

    Store.store = 'foo';
  }

  /**
   * Get the actual environment from the dotenv source file.
   *
   * @returns {Object} The defined environment configuration.
   */
  get env() {
    // Define the path to the dotenv environment file.
    const source = join(process.cwd(), '.env');

    const env = existsSync(source) ? config({ path: source }) : {};

    // Make sure the actual parsed object exists.
    const parsed = env.parsed || {};

    // Throw an exception if the parsed configuration is invalid.
    if (env.error) {
      error(env.error);
    }

    info(`Defining the environment configuration for Plains.`);

    // Inherit any missing option from the defaults Object.
    Object.keys(this.defaults).forEach(option => {
      if (!parsed[option]) {
        parsed[option] = this.defaults[option];
      }
    });

    // Enable DEVMODE flag if the current environment is set to 'development'.
    parsed.PLAINS_DEVMODE = parsed.PLAINS_ENVIRONMENT === 'development';

    success(`Environment configuration defined for ${parsed.PLAINS_ENVIRONMENT}!`);

    return parsed;
  }
}

module.exports = Environment;
