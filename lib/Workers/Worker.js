const { error, log, warning } = require('../Utils/Logger');

class Worker {
  constructor(services, environment) {
    this.services = services;
    this.name = this.constructor.name;
    this.config = this.services.Store.get('plains', 'workers')[this.name];
    this.environment = this.defineWorkerEnvironment(environment);

    this.services.Contractor.subscribe(
      this.config && this.config.task ? this.config.task : this.name,
      {
        prePublish: this.beforeMount.bind(this),
        publish: this.mount.bind(this),
        postPublish: this.afterMount.bind(this),
      }
    );
  }

  /**
   * Function that exposes the related functionality for the defined worker.
   */
  beforeMount() {
    if (!this.name) {
      error('Unable to mount worker, no name has been defined.');
    }

    // Create a new Filesystem stack for initial worker for storing entry files.
    this.services.FileSystem.createStack(this.name);

    // Source the initial entry files to the newly created stack.
    if (this.config && this.config.entry) {
      this.services.FileSystem.insertEntry(this.name, this.config.entry);
    }

    this.services.Contractor.resolve(
      this.config && this.config.task ? this.config.task : this.name,
      'prePublish'
    );
  }

  /**
   * Handles the intial worker.
   */
  async mount() {
    this.resolve();
  }

  /**
   * Function that will be called if the initial handler has been initiated.
   */
  async afterMount() {
    this.services.Contractor.resolve(
      this.config && this.config.task ? this.config.task : this.name,
      'postPublish'
    );
  }

  /**
   * Resolves the initial Promise object for the subscribed Contractor task.
   */
  resolve() {
    this.services.Contractor.resolve(
      this.config && this.config.task ? this.config.task : this.name,
      'publish'
    );
  }

  /**
   * Resolves the initial Promise object for the subscribed Contractor task.
   */
  reject() {
    this.services.Contractor.reject(
      this.config && this.config.task ? this.config.task : this.name,
      'publish'
    );
  }

  /**
   * The initiator method that should be triggered by the Contractor service.
   */
  init() {
    this.resolve();
  }

  /**
   * Defines the specified environment for the initial Worker. Prevents the
   * actual Worker from being mounted if the defined environment does not match
   * with the given environment value.
   *
   * @param {String|Array} environment Mounts the actual Worker if the defined
   * environment(s) matches with the current mode.
   */
  defineWorkerEnvironment(environment) {
    if (environment && Array.isArray(environment)) {
      return environment;
    }

    if (environment && !Array.isArray(environment) && typeof environment === 'string') {
      return [environment];
    }

    warning(`${this.name} has no defined environment mode.`);

    return;
  }
}

module.exports = Worker;
