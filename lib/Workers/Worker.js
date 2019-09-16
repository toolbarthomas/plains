const { error, log } = require('../Utils/Logger');

class Worker {
  constructor(services, name, async) {
    this.services = services;
    this.name = name;
    this.async = async || false;
    this.config = false;
  }

  mount() {
    this.config = this.services.Store.get('app', 'workers')[this.name];

    if (!this.name) {
      error('Unable to mount worker, no name has been defined.');
    }

    if (!this.config || !this.config.entry) {
      log('Skipping unconfigured worker', this.name);
      return;
    }

    // Create a new Filesystem stack for initial worker for storing entry files.
    this.services.FileSystem.createStack(this.name);

    // Source the initial entry files to the newly created stack.
    this.services.FileSystem.insertEntry(this.name, this.config.entry);

    // Assign the initial worker to the Contract task queue.
    this.services.Contractor.subscribe(this.name, this.init.bind(this), this.async);
  }

  init() {
    log('Initiate worker', this.name);
  }
}

module.exports = Worker;
