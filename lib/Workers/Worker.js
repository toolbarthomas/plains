const { error, log, warning } = require('../Utils/Logger');

class Worker {
  constructor(services, environment) {
    this.services = services;
    this.name = this.constructor.name;
    this.config = false;
    this.environment = this.defineWorkerEnvironment(environment);
  }

  /**
   * Assigns the logic for the initial worker before it can be initialized.
   */
  mount() {
    const mode = this.services.Store.get('argv', 'mode');

    this.config = this.services.Store.get('plains', 'workers')[this.name];

    if (!this.name) {
      error('Unable to mount worker, no name has been defined.');
    }

    // Create a new Filesystem stack for initial worker for storing entry files.
    this.services.FileSystem.createStack(this.name);

    // Source the initial entry files to the newly created stack.
    if (this.config && this.config.entry) {
      this.services.FileSystem.insertEntry(this.name, this.config.entry);
    }

    /**
     * Define the actual handler for the intial Contractor task if the given
     * worker has been defined for the current environment.
     */
    const handler =
      this.environment && this.environment.indexOf(mode) < 0
        ? () => {
            log(`${this.name} is not supported for the ${mode} environment and will be ignored.`);
          }
        : this.init.bind(this);

    // Assign the initial worker to the Contract task queue.
    this.services.Contractor.subscribe(
      this.config && this.config.task ? this.config.task : this.name,
      this.name,
      handler,
      true
    );
  }

  /**
   * Resolves the initial Promise object for the subscribed Contractor task.
   */
  resolve() {
    this.services.Contractor.resolve(
      this.config && this.config.task ? this.config.task : this.config.name
    );
  }

  /**
   * Resolves the initial Promise object for the subscribed Contractor task.
   */
  reject() {
    this.services.Contractor.reject(
      this.config && this.config.task ? this.config.task : this.config.name
    );
  }

  /**
   * The initiator method that should be triggered by the Contractor service.
   */
  init() {
    log('Initiate worker', this.name);

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
