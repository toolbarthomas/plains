const { error, info, warning, success } = require('../Utils/Logger');

class Contractor {
  constructor() {
    this.tasks = {};
  }

  /**
   * Initialize the defined task if it's actually subscribed.
   *
   * @param {String} name The name of the task that will be called.
   * @param {*} data Optional function arguments for the defined task.
   */
  run(name, ...args) {
    if (typeof this.tasks[name] !== 'function') {
      error(`Task '${name} is not defined.'`);
    }

    return this.tasks[name](args);
  }

  /**
   * Assigns a new task for Plains to use.
   *
   * @param {String} name The name of the actual task.
   * @param {Function} handler The function handler that will be used.
   */
  subscribe(name, handler) {
    if (!this.tasks[name] && typeof handler === 'function') {
      info(`Subscribing task: '${name}'...`);

      this.tasks[name] = handler;

      success(`${name} subscribed!`);
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
}

module.exports = Contractor;
