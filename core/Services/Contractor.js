const { error, info, log, success } = require('../Utils/Logger');

/**
 * Contractor is an Observer class that holds all the worker that will be used
 * when a task is being called.
 */
class Contractor {
  constructor() {
    // Map with all the worker subscriptions.
    this.tasks = new Map();
    this.task = false;
  }

  /**
   * Assigns the given tasks that have been defined by the Plains instance.
   *
   * @param {String|Array} task The task(s) to assign to the Contractor instance.
   */
  defineTaskQueue(task) {
    const queue = task.split(',').filter(t => t.trim());

    this.task = queue.filter(
      (initialTask, index) => queue.indexOf(initialTask) === index
    );
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
   * Subscribes the given worker as task.
   *
   * @param {String} name The name that will be used during the subscription.
   * @param {Function} handler The handler to use during the publish of a worker.
   * @param {Boolean} async Flag that indicator if the handler is asyncronous.
   */
  subscribe(name, handler, async, watch) {
    if (!name) {
      error(`Unable to subscribe anonymous workers`);
    }

    if (this.tasks[name]) {
      error(`Unable to insert duplicate worker, ${name} already has been defined.`);
    }

    log('Subscribing task', name);

    // Subscribe the new Worker.
    this.tasks[name] = {
      async: async || false,
      handler: !async ? handler : () => (
        new Promise(async (resolve, reject) => {
          this.tasks[name].resolve = resolve;
          this.tasks[name].reject = reject;

          await handler();
        }).catch(exception => exception)
      ),
      watch: watch || false,
    }

    log('Subscribed task', name);
  }

  /**
   * Call the subscribed task.
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

    success(`Finished: ${name}`);
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

    await this.task.reduce(
      (previousInstance, currentInstance) =>
        previousInstance.then(async () => {
          await this.publish(currentInstance);
        }),
      Promise.resolve()
    );

    success('Done');
  }
}

module.exports = Contractor;
