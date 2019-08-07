/* eslint no-else-return: "error" */

const { load } = require('module-config-loader');

class ConfigLoader {
  constructor(config) {
    /**
     * Defines the default configuration Object for Plains.
     * The configuration will be used if it has not been adjusted by the custom
     * configuration.
     */
    this.defaults = {
      src: './src', // Defines the source path for Plains.
      dist: './dist', // Defines the Plains destination path.
      workers: {},
    };

    /**
     * Stores the application configuration that has been defined within the
     * optional configuration file defined within the working directory.
     */
    this.externalConfig = load('plains.config.js') || {};

    /**
     * Stores the application configuration that has been defined while creating
     * a new config instance.
     */
    this.inlineConfig = config instanceof Object ? config : {};

    // The actual configuration that will be used.
    this.config = {};
  }

  /**
   * Defines the applications configuration.
   */
  define() {
    // Validates the custom configuration.
    this.config = ConfigLoader.validate(
      this.defaults,
      Object.assign(this.externalConfig, this.inlineConfig)
    );

    // Cache the parsed configuration for the running process.
    return this.config;
  }

  /**
   * Validates the custom configuration by comparing it with the default
   * configuration in a recursive order.
   *
   * @param {*} defaults The iterated default value to use as reference.
   * @param {*} config  The actual config to validate.
   * @param {String} option The name of the configuration option.
   */
  static validate(defaults, config, option) {
    if (defaults && config && defaults.constructor === config.constructor) {
      if (!(defaults instanceof Array) && defaults instanceof Object && config instanceof Object) {
        const filteredConfig = {};
        const mergedConfig = {};

        /**
         * Filter out the options that are undefined according to the default
         * configuration.
         */
        Object.keys(config).forEach(name => {
          if (name != 'workers' || defaults[name] && config[name]) {
            filteredConfig[name] = config[name];
          }
        });

        // Validates each entry within the current (sub)configuration Object.
        Object.keys(defaults).forEach(name => {
          mergedConfig[name] = ConfigLoader.validate(defaults[name], filteredConfig[name], name);
        });

        // Return the filtered and normalized configuration Object,
        return mergedConfig;
      } else if (defaults && config) {
        // Return the current custom configuration value.
        return config;
      } else if (!config) {
        // Return the default configuration if there is no custom configuration.
        return defaults;
      }

      // Make sure that an actual configuration value is returned.
      return defaults;
    } else if (config) {
      if (option) {
        throw Error(`Option: ${option} does not match the configuration schema`);
      }
    }

    return defaults;
  }
}

module.exports = ConfigLoader;
