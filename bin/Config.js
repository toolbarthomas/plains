const { load } = require('module-config-loader');
const { error, info, warning } = require('./Common/Logger');

class Config {
  constructor(config) {
    /**
     * The default configuration for Plains.
     */
    this.defaults = {
      src: './src',
      dist: './dist',
    };

    /**
     * Stores the custom configuration that should be defined within the
     * optional configuration file or during the initialization of Plains.
     */
    this.custom = Config.defineCustomConfig(config);

    /**
     * The actual configuration that will be used.
     */
    this.exports = {};
  }

  /**
   * Define the custom configuration if the config paramater has been defined
   * as an Object. Load the optional Plains configuration otherwise if there
   * is no inline configuration defined.
   */
  static defineCustomConfig(config) {
    if (config && config instanceof Object) {
      return config;
    }

    return load('plains.config.js') || {};
  }

  /**
   * Get the defined configuration from the optional Plains configuration file
   * and cache it within the actual module.
   *
   * @param {String} name The key of the actual configuration Object.
   */
  get(name) {
    // Only proceed if the requested option actually exists.
    if (!this.defaults[name]) {
      error(`'${name}' is not a valid configuration option for Plains`);
    }

    /**
     * Check if the requested configuration option has already been defined
     * before loading it from the external configuration file.
     */
    if (this.exports && this.exports[name]) {
      info(`Loading '${name}' from the cache.`);
      return this.exports[name];
    }

    /**
     * Return the default configuration if there is no value defined from the
     * optional configuration.
     */
    if (!this.custom[name]) {
      return this.defaults[name];
    }

    /**
     * Validate the requested Make sure that the given configuration has all options defined if the
     * parsed configuration is an actual Object.
     */
    this.define(name);

    return this.custom[name];
  }

  /**
   * Helper function to ensure that the parsed configuration matches with the
   * default configuration and also assign any missing options.
   *
   * @param {String} name The key of the actual configuration Object to prepare.
   */
  define(name) {
    if (this.defaults[name] instanceof Object && this.custom[name] instanceof Object) {
      Object.keys(this.defaults[name]).forEach(defaultOption => {
        if (!this.custom[name][defaultOption]) {
          this.custom[name][defaultOption] = this.defaults[name][defaultOption];
        }
      });

      // Cache the parsed configuration for the current process.
      this.exports[name] = this.custom[name];
    } else if (typeof this.defaults[name] !== typeof this.custom[name]) {
      warning(
        `'${name}' does not match with the expected configuration scheme and will be ignored.`
      );

      this.custom[name] = this.defaults[name];
    }
  }

  /**
   * Removes the given option from the cached configuration object.
   *
   * @param {String} name The key of the actual configuration Object to remove.
   */
  prune(name) {
    if (this.exports && this.exports[name]) {
      info(`'${name}' has been removed from the configuration cache.`);
      delete this.exports[name];
    } else {
      info(`Unable to prune '${name}'...`);
    }
  }
}

module.exports = Config;
