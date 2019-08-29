const { error, info, log, success } = require('../Utils/Logger');

class PluginManager {
  constructor() {
    // Object that holds all the plugin subscription instances.
    this.instances = {};

    // Objects that holds all the subscribed task that will mount any plugins.
    this.subscriptions = {};
  }

  /**
   * Subscribe the plugin to the PluginManager instance.
   */
  subscribe(plugin, handler, async) {
    if (this.instances[plugin]) {
      log(`${plugin} has already been subscribed.`);
      return;
    }

    // Ensure that the subscribed  has an actual handler
    if (typeof handler != 'function') {
      error(`The defined for ${plugin} handler is not a function.`)
    }

    this.instances[plugin] = {
      fn: null,
      options: {},
    };

    if (async) {
      this.instances[plugin].fn = () => {
        return new Promise(async (resolve, reject) => {
          this.instances[plugin].resolve = resolve;
          this.instances[plugin].reject = reject;

          await handler();
        }).catch(exception => exception)
      }

      this.instances[plugin].options.async = true;
    } else {
      this.instances[plugin].fn = handler;
    }

    log('Plugin subscribed', plugin);
  }

  /**
   * Initiate the subscribed plugins from the assigned task.
   *
   * @param {String} task The task to get the subscribed plugins from.
   */
  async publish(task, ...args) {
    // Ensure the actual task has been assigned by the PluginManager.
    if (!this.subscriptions[task]) {
      log(`No plugins have been defined for`, task);
      return;
    }

    log('Assigning plugins for', task);

    // Expose the subscribed plugins from the assigned task.
    const plugins = this.subscriptions[task];

    // Ensure that the assigned task has any plugins defined.
    if (!plugins || !plugins.length) {
      error(`${task} has no subscribed plugins.`);
    }

    const queue = Object.keys(this.instances);

    await queue.reduce(
      (previousInstance, instance) =>
        previousInstance.then(async () => {
          log('Assigning', instance);

          if (this.instances[instance].options && this.instances[instance].options.async) {
            await this.instances[instance].fn(args);
          } else {
            this.instances[instance].fn(args);
          }

          log('Assigned plugin', instance);
        }),
      Promise.resolve()
    );

    log('Plugins assigned for', task);
  }

  /**
   * Assigns the defined plugins to the defined task.
   *
   * @param {String} task The actual task to assign the plugin from.
   * @param {String|Array} plugins The subscribed plugins to assign
   * to the given task.
   */
  assign(task, plugins) {
    const instance = this.subscriptions[task] || [];

    const assignee = Array.isArray(plugins)
      ? plugins
      : [plugins];

    // Ensure that the plugin is not assigned twice.
    assignee.forEach(plugin => {
      if (instance.indexOf(plugin) >= 0) {
        return;
      }

      instance.push(plugin);
    });

    // Assign the plugins to the current task.
    this.subscriptions[task] = instance;

    return instance;
  }


  /**
   * Resolves the defined Promise Object if the given plugin has been
   * subscribed as an asyncronous plugin.
   *
   * @param {String} plugin The plugin that should be resolved.
   * @param {Object} args Optional arguments for the actual resolved Promise.
   */
  resolve(plugin, ...args) {
    if (!this.instances[plugin] || !this.instances[plugin].resolve) {
      warning(`Task '${plugin}' is synchronous and won't be resolved.`);
    } else {
      this.instances[plugin].resolve(...args);
    }
  }

  /**
   * Rejects the defined Promise Object if the given plugin has been
   * subscribed as an asynchronous plugin.
   *
   * @param {String} plugin The plugin that should be rejected.
   * @param {Object} args Optional arguments for the actual rejected Promise.
   */
  reject(plugin, ...args) {
    if (!this.instances[plugin].resolve) {
      warning(`Task '${plugin}' is synchronous and won't be rejected.`);
    } else {
      this.instances[plugin].reject(...args);
    }
  }
}

module.exports = PluginManager;
