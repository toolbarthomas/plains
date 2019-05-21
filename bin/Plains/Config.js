const { load } = require('module-config-loader');
const Logger = require('./Common/Logger');

class Config {
  constructor() {
    /**
     * Defines the default configuration for Plains.
     */
    this.defaults = {
      src: './src',
      dist: './dist',
    };

    /**
     * Stores the external defined configuration.
     */
    this.parsed = {};

    /**
     * The actual configuration that will be used.
     */
    this.config = {};
  }

  /**
   * Get the defined configuration from the optional Plains configuration file
   * and cache it within the actual module.
   *
   * @param {String} option The key of the actual configuration Object.
   */
  get(option) {
    // Only proceed if the requested option actually exists.
    if (!this.defaults[option]) {
      Logger.error(`'${option}' is not a valid configuration option for Plains`);
    }

    /**
     * Check if the requested configuration option has already been defined
     * before loading it from the external configuration file.
     */
    if (this.config && this.config[option]) {
      Logger.info(`Loading '${option}' from the cache.`);
      return this.config[option];
    }

    // Load the configuration file from the current working directory.
    this.parsed = Object.assign(this.parsed, load('plains.config.js'));

    /**
     * Return the default configuration if there is no value defined from the
     * optional configuration.
     */
    if (!this.parsed[option]) {
      return this.defaults[option];
    }

    /**
     * Make sure that the given configuration has all options defined if the
     * parsed configuration is an actual Object.
     */
    this.prepare(option);

    return this.parsed[option];
  }

  /**
   * Helper function to ensure that the parsed configuration matches with the
   * default configuration and also assign any missing default configuration.
   *
   * @param {String} option The key of the actual configuration Object.
   */
  prepare(option) {
    if (this.defaults[option] instanceof Object && this.parsed[option] instanceof Object) {
      Object.keys(this.defaults[option]).forEach(defaultOption => {
        if (!this.parsed[option][defaultOption]) {
          this.parsed[option][defaultOption] = this.defaults[option][defaultOption];
        }
      });

      // Cache the parsed configuration for the current process.
      this.config[option] = this.parsed[option];
    } else if (typeof this.defaults[option] !== typeof this.parsed[option]) {
      Logger.warning(
        `'${option}' does not match with the expected configuration scheme and will be ignored.`
      );

      this.parsed[option] = this.defaults[option];
    }
  }

  /**
   * Removes the defined option from the cached configuration.
   *
   * @param {String} option The key of the actual configuration Object.
   */
  prune(option) {
    if (this.config && this.config[option]) {
      Logger.info(`'${option}' has been removed from the configuration cache.`);
      delete this.config[option];
    }
  }
}

module.exports = Config;
