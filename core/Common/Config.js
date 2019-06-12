const { load } = require('module-config-loader');

class Config {
  constructor(config) {
    /**
     * Store the default configuration values.
     */
    this.defaults = {
      src: './src',
      dist: './dist',
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

    /**
     * The actual configuration that will be used.
     */
    this.exports = {};
  }

  /**
   * Defines the applications configuration.
   */
  define() {
    if (this.config && this.config instanceof Object) {
      return this.config;
    }

    this.config = Object.assign(this.externalConfig, this.inlineConfig);

    // Define the default value for the missing configuration options.
    Object.keys(this.defaults).forEach(name => {
      if (!this.config[name] && this.defaults[name]) {
        this.config[name] = this.defaults[name];
      }
    });

    // Cache the parsed configuration for the running process.
    return this.config;
  }
}

module.exports = Config;
