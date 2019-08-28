const { error, info, log, success, warning } = require('../Utils/Logger');

/**
 * Observer class that handles the task management for Plains.
 */
class Contractor {
  constructor() {
    this.tasks = {};
  }

  /**
   * Assigns a new task for Plains to use.
   *
   * @param {String} name The name of the actual task.
   * @param {Function} handler The function handler that will be used.
   * @param {Boolean} async Creates a new Promise object for the given handler.
   */
  subscribe(name, handler, async) {
    if (!this.tasks[name] && typeof handler === 'function') {
      log('Subscribing task', name);

      /**
       * Define a new Object for the given task where the actual command where
       * the actual command and parameters will be defined.,
       */
      this.tasks[name] = {
        fn: null,
        options: {},
      };

      /**
       * Create a new Promise Object if the given task has been marked as an
       * asynchronous function.
       */
      if (async) {
        this.tasks[name].fn = () => {
          return new Promise(async (resolve, reject) => {
            this.tasks[name].resolve = resolve;
            this.tasks[name].reject = reject;

            await handler();
          });
        };

        this.tasks[name].options.async = true;
      } else {
        this.tasks[name].fn = handler;
      }
    } else {
      error(`Task '${name} already has been defined.'`);
    }
  }

  /**
   * Removes the defined subscribed task.
   *
   * @param {String} name Matches the name of the task the will be removed.
   */
  unsubscribe(name) {
    if (this.tasks[name]) {
      this.task[name] = null;

      success(`Task '${name}' removed successfully.`);
    } else {
      warning(`Task '${name}' is undefined and cannot be removed.'`);
    }
  }

  /**
   * Initialize the defined subscribed task.
   *
   * @param {String} name Defines the names of the tasks to run.
   * @param {Object} args Optional function arguments for the defined task.
   */
  async publish(name, ...args) {
    const queue = name ? name.split(',').filter(t => t.trim()) : false;

    if (Array.isArray(queue)) {
      // Make sure that all task run in a synchronous order.
      await queue.reduce(
        (previousTask, task) =>
          previousTask.then(async () => {
            if (!this.tasks[task]) {
              error(`Task: '${task}' does not exists.`);
            }

            info(`Starting: ${task}`);

            if (this.tasks[task].options && this.tasks[task].options.async) {
              await this.tasks[task].fn(args);
            } else {
              this.tasks[task].fn(args);
            }

            success(`Finished: ${task}`);
          }),
        Promise.resolve()
      );

      success('Done');
    }
  }

  /**
   * Resolves the defined Promise Object if the given taskname has been
   * subscribed as an asyncronous task.
   *
   * @param {String} name The taskname that will be resolved.
   * @param {Object} args Optional arguments for the actual resolved Promise.
   */
  resolve(name, ...args) {
    if (!this.tasks[name] || !this.tasks[name].resolve) {
      warning(`Task '${name}' is synchronous and won't be resolved.`);
    } else {
      this.tasks[name].resolve(...args);
    }
  }

  /**
   * Rejects the defined Promise Object if the given taskname has been
   * subscribed as an asynchronous task.
   *
   * @param {String} name The taskname that will be rejected.
   * @param {Object} args Optional arguments for the actual rejected Promise.
   */
  reject(name, ...args) {
    if (!this.tasks[name].resolve) {
      warning(`Task '${name}' is synchronous and won't be rejected.`);
    } else {
      this.tasks[name].reject(...args);
    }
  }
}

module.exports = Contractor;
