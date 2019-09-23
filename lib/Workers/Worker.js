const { error, log } = require('../Utils/Logger');

class Worker {
  constructor(services) {
    this.services = services;
    this.name = this.constructor.name;
    this.config = false;
  }

  /**
   * Assigns the logic for the initial worker before it can be initialized.
   */
  mount() {
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

    // Assign the initial worker to the Contract task queue.
    this.services.Contractor.subscribe(
      this.config && this.config.task ? this.config.task : this.name,
      this.name,
      this.init.bind(this),
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
   *
   */
  init() {
    log('Initiate worker', this.name);

    this.resolve();
  }
}

module.exports = Worker;
