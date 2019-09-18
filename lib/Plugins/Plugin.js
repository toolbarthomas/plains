const { error, log } = require('../Utils/Logger');

class Plugin {
  constructor(services, name) {
    this.services = services;
    this.name = name;
    this.config = false;
  }

  /**
   * Assigns the intial variables to the current Plugin instance.
   */
  mount() {
    this.config = this.services.Store.get('plains', 'plugins')[this.name];

    if (!this.name) {
      error('Unable to mount plugin, no name has been defined.');
    }

    // Subscribe the intial Plugin to the PluginManager.
    this.services.PluginManager.subscribe(this.name, this.init.bind(this));
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
