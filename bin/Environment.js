const { config } = require('dotenv');
const { join } = require('path');
const { existsSync } = require('fs');

const { error } = require('./Common/Logger');

/**
 * Defines the Plains environment variables from the given dotenv file.
 * Use the default environment configuration for undefined options.
 */
class Environment {
  constructor() {
    /**
     * The default Environment configuration for Plains.
     */
    this.defaults = {
      PLAINS_ENVIRONMENT: 'production',
    };

    /**
     * Defines the custom Environment configuraiton from the optional dotenv
     * file.
     */
    this.custom = {}

    /**
     * The defined Environment configuration to use.
     */
    this.exports = {};

    // Load the optional environment configuration.
    this.define();
  }

  define() {
    const source = join(process.cwd(), '.env');

    const env = existsSync(source) ? config({ path: source }) : {};

    if (env.error) {
      error(env.error);
    }

    const { parsed } = env;

    // Assign the default value for missing or incorrect environment variables.
    Object.keys(this.defaults).forEach(defaultOption => {
      if (
        parsed[defaultOption] &&
        typeof parsed[defaultOption] === typeof this.defaults[defaultOption]
      ) {
        this.exports[defaultOption] = parsed[defaultOption];
      } else {
        this.exports[defaultOption] = this.defaults[defaultOption];
      }
    });

    /**
     * Defines the DEVMODE flag if the current environment has been set
     * to development.
     */
    this.exports.DEVMODE = this.exports.PLAINS_ENVIRONMENT === 'development';
  }

  /**
   * Returns the environment variable it actually exists.
   * An expception will be thrown if the given name is not part of the default
   * environment configuration.
   *
   * @param {String} name The property to return from the environment configuration.
   */
  get(name) {
    if (!this.exports[name] && !this.defaults[name]) {
      error(`The requested environment variable '${name}' does not exist.`);
    }

    return this.exports[name] || this.defaults[name];
  }
}

module.exports = Environment;
