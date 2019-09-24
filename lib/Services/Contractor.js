const { error, info, log, success, warning } = require('../Utils/Logger');

/**
 * Contractor is an Observer class that holds all the worker that will be used
 * when a task is being called.
 */
class Contractor {
  constructor() {
    // Object with all the worker subscriptions.
    this.tasks = {};
    // Map with all the subscribed plugins.
    this.plugins = new Map();
    this.task = false;
  }

  /**
   * Assigns the given tasks that have been defined by the Plains instance.
   *
   * @param {String|Array} task The task(s) to assign to the Contractor instance.
   */
  defineTaskQueue(task) {
    const queue = typeof task === 'string' ? task.split(',').filter(t => t.trim()) : task;

    this.task = queue.filter((initialTask, index) => queue.indexOf(initialTask) === index);
  }

  /**
   * Returns an Array of the defined task queue.
   */
  getTaskQueue() {
    if (!this.task) {
      error('No task has been defined to the Contractor instance.');
    }

    return this.task;
  }

  /**
   * Returns an array with al the tasks that have been registered to the defined
   * worker.
   * @param {String} worker Get all the tasks from the define worker name.
   */
  getTaskFromWorkerInstance(worker) {
    const tasks = [];

    Object.keys(this.tasks).forEach(name => {
      const task = this.tasks[name];

      if (task.workers && task.workers.indexOf(worker) >= 0) {
        tasks.push(name);
      }
    });

    return tasks;
  }

  /**
   * Subscribes the given worker as task.
   *
   * @param {String} name The name that will be used during the subscription.
   * @param {String} worker The name of the worker class.
   * @param {Function} handler The handler to use during the publish of a worker.
   * @param {Boolean} async Flag that indicator if the handler is asyncronous.
   */
  subscribe(name, worker, handler, async) {
    if (!name) {
      error(`Unable to subscribe anonymous workers`);
    }

    if (this.tasks[name]) {
      error(`Unable to insert duplicate worker, ${name} already has been defined.`);
    }

    const workers = [worker];
    if (this.tasks[name] && this.tasks[name].workers.length) {
      this.tasks[name].workers.forEach(path => {
        if (workers.indexOf(path) < 0) {
          workers.push(path);
        }
      });
    }

    // Subscribe the new Worker.
    this.tasks[name] = {
      workers,
      async: async || false,
      handler: !async
        ? handler
        : () =>
            new Promise((resolve, reject) => {
              this.tasks[name].resolve = resolve;
              this.tasks[name].reject = reject;

              handler();
            }).catch(exception => exception),
    };

    log('Subscribed task', name);
  }

  /**
   * Assign the defined plugin to the subscribed Contractor task that will be
   * called during the postPublish initiation.
   *
   * @param {String} plugin The unique name of the plugin to assign.
   * @param {Array|String} name The tasks to assign the plugin to.
   * @param {Function} handler The function that will be assigned
   */
  assignPlugin(plugin, task, handler) {
    if (!task) {
      error(`Unable to subscribe plugin, no task has been assigned to it.`);
    }

    if (!plugin) {
      error(`Unable to subcribe plugin, no name has been given.`);
    }

    const tasks = Array.isArray(task) ? task : [task];

    // Subscribe the plugin to each defined task.
    tasks.forEach(initialTask => {
      if (!this.tasks[initialTask]) {
        error(`${initialTask} has not been defined as task.`);
      }

      // Merge the new plugins with the subscribed plugins Object.
      const initialPlugins = this.plugins.has(initialTask) ? this.plugins.get(initialTask) : {};

      const plugins = {};
      plugins[plugin] = handler;

      log(`${plugin} plugin subscribed to task`, initialTask);

      this.plugins.set(initialTask, Object.assign(initialPlugins, plugins));
    });
  }

  /**
   * Initialze the defined task if it has been subscribed.
   *
   * @param {String} name The task that will be initiated.
   * @param {Object} args Optional function arguments for the initial handler.
   */
  async publish(name, ...args) {
    if (!this.tasks[name]) {
      error(`Unable to publish ${name}, the given task has not been subscribed.`);
    }

    info(`Starting: ${name}`);

    if (this.tasks[name].async) {
      await this.tasks[name].handler(args);
    } else {
      this.tasks[name].handler(args);
    }

    this.postPublish(name);

    success(`Finished: ${name}`);
  }

  /**
   * Post hook that will be initiated after the publish method has been called.
   *
   * @param {String} task Initiate the plugins that have been subscribed to
   * the defined task.
   */
  postPublish(task) {
    if (!this.plugins.has(task) || !(this.plugins.get(task) instanceof Object)) {
      return;
    }

    const queue = this.plugins.get(task);

    log('Starting plugins for', task);

    Object.keys(queue).forEach(key => {
      const fn = this.plugins.get(task)[key];

      if (typeof fn !== 'function') {
        return;
      }

      log(`Running plugin`, key);

      fn();
    });
  }

  /**
   * Resolves the subscribed handler if it has been subscribed as an
   * asynchronous function.
   */
  resolve(name, ...args) {
    if (!this.tasks[name]) {
      error(`Unable to resolve undefined task, ${name}`);
    }

    if (typeof this.tasks[name].resolve === 'function') {
      this.tasks[name].resolve(args);
    } else {
      warning(`Unable to resolve task, ${name}. The initial handler is not asynchronous.`);
    }
  }

  /**
   * Rejects the subscribed handler if it has been subscribed as an asynchronous
   * function.
   */
  reject(name, ...args) {
    if (!this.tasks[name]) {
      error(`Unable to reject undefined task, ${name}`);
    }

    if (typeof this.tasks[name].reject === 'function') {
      this.tasks[name].reject(args);
    } else {
      warning(`Unable to reject task, ${name}. The initial handler is not asynchronous.`);
    }
  }

  /**
   * Initiate the publish function for each defined task.
   *
   * @param {String|Array} task The subscribed tasks that will be published.
   */
  async run() {
    if (!this.task) {
      error(`No task has been defined for the the current Plains Instance`);
    }

    const timestamp = process.hrtime();

    await this.task.reduce(
      (previousInstance, currentInstance) =>
        previousInstance.then(async () => {
          await this.publish(currentInstance);
        }),
      Promise.resolve()
    );

    success('Completed all tasks.');

    const duration =
      (process.hrtime(timestamp)[0] * 1000 + process.hrtime(timestamp)[1] / 1e6) / 1000;

    log('Compilation time', `${Math.round(duration * 10) / 10}s`);
  }
}

module.exports = Contractor;
