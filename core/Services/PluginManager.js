const { log } = require('../Utils/Logger');

class PluginManager {
  constructor() {
    this.plugins = {};
  }

  /**
   * Subscribe a worker to the Plains plugin in order to know which plugin
   * should be ran after the task has been run.
   *
   * @param {String} worker The worker that will be subscribed
   * @param {String|Array} plugins Define one or more plugins to subscribe
   * to the defined worker.
   */
  subscribe(worker, plugins) {
    // Make sure we can iterate trough the defined plugins
    const pluginSubscription = (Array.isArray(plugins) ? plugins : [plugins]);

    // Subsribe the worker to defined plugins.
    pluginSubscription.forEach(plugin => {
      if (!this.plugins[plugin] || !Array.isArray(this.plugins[plugin])) {
        this.plugins[plugin] = [];
      }

      // Make sure the actual worker will only registerd once to a plugin.
      this.plugins[plugin] = this.plugins[plugin]
        .filter(item => this.plugins[plugin][worker] != worker)
        .concat(worker);

      log(`Subscribed ${worker} to`, plugin);
    });
  }
}

module.exports = PluginManager;
