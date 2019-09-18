const { error, log, warning } = require('../Utils/Logger');

/**
 * The PluginManager Service is used to assign new Plugins within the Plains
 * instance. The PluginManager should be called after all Contractor tasks have
 * been published.
 */
class PluginManager {
  constructor() {
    // Contains all he Plugin subscriptions.
    this.plugins = new Map();
  }

  /**
   * Subscribes a new Plugin that will be initiated when the
   * PluginManagers runs.
   *
   * @param {String} name The name of the plugin to subscribe.
   * @param {Function} handler The function handler that will be called for this
   * subscription.
   */
  subscribe(name, handler) {
    if (!name) {
      error('A name is required when subscribing a plugin.');
    }

    if (this.plugins.has(name)) {
      error(`${name} already has been subscribed to the PluginManager.`);
    }

    log('Subscribing Plugin');

    // Create the intial plugin instance.
    const instance = {};

    instance.fn = () =>
      new Promise((resolve, reject) => {
        instance.resolve = resolve;
        instance.reject = reject;

        handler();
      });

    // Subscribe the actual plugin.
    this.plugins.set(name, instance);

    log('Plugin subscribed', name);
  }

  /**
   * Returns the Pending Promise of the subscribed Plugin.
   * @param {String} name The actual Plugin to return the Promise from.
   * @param  {...any} args The argument to apply within the Promise.
   */
  publish(name, ...args) {
    if (!name || !this.plugins.has(name)) {
      error([
        `Unable to publish ${name}.`,
        'The plugin has not been subscribed to the PluginManager.',
      ]);
    }

    const { fn } = this.plugins.get(name);

    if (typeof fn !== 'function') {
      warning(`${name} has no handler and will be ignored.`);
    }

    log('Starting plugin', name);

    return fn(args);
  }

  /**
   * Resolves the Promise for the defined plugin.
   * @param {String} name The plugin to resolve.
   * @param {Arglist} args The arguments to apply within the resolve method.
   */
  resolve(name, ...args) {
    if (!this.plugins.has(name)) {
      error([
        `Unable to resolve ${name}.`,
        'The plugin has not been subscribed to the PluginManager.',
      ]);
    }

    const { resolve } = this.plugins.get(name);

    if (typeof resolve !== 'function') {
      error(`No resolve method has been defined for ${name}.`);
    }

    log('Stopping plugin', name);

    resolve(args);
  }

  /**
   * Rejects the Promise for the defined Plugin.
   *
   * @param {String} name The plugin to reject.
   * @param {...any} args The arguments to apply within the reject method.
   */
  reject(name, ...args) {
    if (!this.plugins.has(name)) {
      error([
        `Unable to reject ${name}.`,
        'The plugin has not been subscribed to the PluginManager.',
      ]);
    }

    const { reject } = this.plugins.get(name);

    if (typeof reject !== 'function') {
      error(`No reject method has been defined for ${name}.`);
    }

    reject(args);

    log('Stopping plugin', name);
  }

  /**
   * Publishes all subscribed plugins in a paralell order.
   */
  async run() {
    const queue = [...this.plugins.keys()].map(name => this.publish(name));

    if (!queue || !queue.length) {
      log('No plugins have been mounted for the current environment.');
    } else {
      log('Starting PluginManager...');
      await Promise.all(queue);
    }
  }
}

module.exports = PluginManager;
