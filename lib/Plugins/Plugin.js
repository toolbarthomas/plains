const { error, log, warning } = require('../Utils/Logger');

class Plugin {
  constructor(services, name, environments) {
    // The services dependencies for the Plugin instance.
    this.services = services;
    // The name of the actual plugin.
    this.name = name;
    // Inherits the intial plugin configuration.
    this.config = false;
    // Defines the compatible environment which the plugin run in.
    this.environments = Array.isArray(environments) ? environments : [];
  }

  /**
   * Assigns the intial variables to the current Plugin instance.
   */
  mount() {
    this.config = this.services.Store.get('plains', 'plugins')[this.name];

    const mode = this.services.Store.get('plains', 'mode');

    if (!this.name) {
      error('Unable to mount plugin, no name has been defined.');
    }

    // Mount the actual plugin after it has been mounted.
    if (this.environments && this.environments.length === 0) {
      this.services.PluginManager.subscribe(this.name, this.init.bind(this));
    } else if (this.environments && this.environments.indexOf(mode) >= 0) {
      this.services.PluginManager.subscribe(this.name, this.init.bind(this));
    } else {
      warning([
        `Unable to mount plugin since ${this.name} is not supported for the current environment: '${mode}'.`,
        `${this.name} is only supported for environments:`,
        ...this.environments,
      ]);
    }
  }

  /**
   * Resolves the Pending Promise for the published Plugin.
   */
  resolve() {
    this.services.PluginManager.resolve(this.name);
  }

  /**
   * Rejects the Pending Promise for the published Plugin.
   */
  reject() {
    this.services.PluginManager.reject(this.name);
  }

  /**
   * Entry handler that should be called by the PluginManager service.
   */
  init() {
    log('Initiate plugin', this.name);
  }
}

module.exports = Plugin;
