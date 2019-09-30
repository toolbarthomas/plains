const { error, info, log, success, warning } = require('../Utils/Logger');

/**
 * Contractor is an Observer class that holds all the worker that will be used
 * when a task is being called.
 */
class Contractor {
  constructor() {
    // Store all subscription within an Object.
    this.subscriptions = {};
    this.hook = false;
  }

  /**
   * Store a new subscription with the defined name & handler in the
   * subscriptions Object.
   *
   * @param {String} name The name that will be used for the subscription.
   * @param {Object|function} handler The intial handler that will be used.
   */
  subscribe(name, handler) {
    // Ensure the subscriptions Object has been created.
    if (!(this.subscriptions instanceof Object)) {
      return error('Unable define a new subscription, the subscriptions instance is not an Object');
    }

    // Only create new subscriptions.
    if (this.subscriptions && this.subscriptions[name] instanceof Object) {
      return warning(
        `Unable to subscribe ${name}, an instance has already been subscribed with this name.`
      );
    }

    // Assign the handlers for the intial subscription.
    const instance = typeof handler === 'function' ? ['publish'] : Object.keys(handler);

    const subscription = {};

    // Assign the new instance handlers.
    instance.forEach(hook => {
      subscription[hook] = {};

      subscription[hook].fn = () =>
        new Promise((resolve, reject) => {
          subscription[hook].resolve = resolve;
          subscription[hook].reject = reject;

          handler[hook]();
        }).catch(exception => error(exception));
    });

    log('Subscribing worker', name);

    // Asssign the actual subscription to the Contractor instance.
    this.subscriptions[name] = subscription;

    // Return the new subscription.
    return subscription;
  }

  /**
   * Assigns the given tasks that have been defined by the Plains instance.
   *
   * @param {String|Array} task The task(s) to assign to the Contractor instance.
   */
  defineTaskQueue(task) {
    const queue = typeof task === 'string' ? task.split(',').filter(t => t.trim()) : task;

    this.hook = queue.filter((initialTask, index) => queue.indexOf(initialTask) === index);
  }

  /**
   * Returns an Array of the defined task queue.
   */
  getTaskQueue() {
    if (!this.hook) {
      error('No task has been defined to the Contractor instance.');
    }

    return this.hook;
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
   * Resolves the subscribed handler if it has been subscribed as an
   * asynchronous function.
   */
  resolve(name, method, ...args) {
    if (!this.subscriptions[name]) {
      return error(`Unable to resolve undefined subscription: ${name}.`);
    }

    if (typeof this.subscriptions[name][method].resolve === 'function') {
      return this.subscriptions[name][method].resolve(args);
    }

    return warning(`No resolve method has been defined for subscription: ${name}`);
  }

  /**
   * Rejects the subscribed handler if it has been subscribed as an asynchronous
   * function.
   */
  reject(name, method, ...args) {
    if (!this.subscriptions[name]) {
      return error(`Unable to reject undefined subscription: ${name}.`);
    }

    if (typeof this.subscriptions[name][method].reject === 'function') {
      return this.subscriptions[name][method].reject(args);
    }

    return warning(`No reject method has been defined for subscription: ${name}`);
  }

  /**
   * Returns the initial handler for the defined subscription lifecycle method.
   *
   * @param {String} name The name of the defined subscription to use.
   * @param {String} method The returns the defined lifecycle method handler.
   */
  handle(name, method) {
    if (
      !this.subscriptions[name] ||
      !this.subscriptions[name][method] ||
      typeof this.subscriptions[name][method].fn !== 'function'
    ) {
      return error(
        `Unable to publish: ${name}, ${method} doest not exists within the subscribed instance`
      );
    }

    return this.subscriptions[name][method].fn();
  }

  /**
   * Initiate the publish function for each defined task.
   *
   * @param {String|Array} task The subscribed tasks that will be published.
   */
  async publish() {
    if (!this.subscriptions) {
      error('Unable to initiate Contractor, no instances have been subscribed');
    }

    // Track the elapsed build time.
    const timestamp = process.hrtime();

    /**
     * Initiate the prePublish method for each subscription within a parallel
     * order.
     */
    await Promise.all(
      Object.keys(this.subscriptions).map(name => {
        return this.handle(name, 'prePublish');
      })
    );

    /**
     * Initiate the publish method for the given subscriptions in a sequential
     * order.
     */
    await this.hook.reduce(
      (instance, name) =>
        instance.then(async () => {
          info(`Starting: ${name}`);
          await this.handle(name, 'publish');
          success(`Finished: ${name}`);
        }),
      Promise.resolve()
    );

    success('Done');

    const duration =
      (process.hrtime(timestamp)[0] * 1000 + process.hrtime(timestamp)[1] / 1e6) / 1000;

    log('Elapsed build time', `${Math.round(duration * 10) / 10}s`);
  }
}

module.exports = Contractor;
