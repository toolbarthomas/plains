const { error, log, warning } = require('../Helpers/Logger');

class Worker {
  constructor(services, ...options) {
    if (!(services instanceof Object)) {
      error(`No services has been assigned to ${this.constructor.name}`);
    }

    // Assign the core services to the initial Worker.
    this.services = services;

    // The name of the actual Worker.
    this.name = this.constructor.name;

    /**
     *
     */
    this.config = this.services.Store.use('config').workers
      ? this.services.Store.use('config').workers[this.name]
      : {};

    this.options = options || {};

    /**
     * Subscribe the initial Worker to the Contractor service so it can be
     * called within the task queue.
     */
    this.services.Contractor.subscribe(
      this.name,
      this.config && this.config.task ? this.config.task : this.name,
      this.start.bind(this)
    );
  }

  /**
   * Method to initiate the actual Worker.
   */
  start() {
    this.services.Contractor.resolve();
  }

  /**
   * Resolve the subscribed Contractor worker instance.
   *
   * @param {String} name The name of the subscription that will be resolved.
   */
  resolve() {
    this.services.Contractor.resolve(this.name);
  }

  /**
   * Reject the subscribed Contractor worker instance.
   *
   * @param {String} name The name of the subscription that will be rejected.
   */
  reject() {
    this.services.Contractor.reject(this.name);
  }
}

module.exports = Worker;
