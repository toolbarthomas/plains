const Argv = require('./Common/Argv');
const ConfigLoader = require('./Common/ConfigLoader');

const Contractor = require('./Services/Contractor');
const Filesystem = require('./Services/Filesystem');
const Store = require('./Services/Store');


class Plains {
  constructor(options) {
    /**
     * Defines the global variables for the running application.
     */
    this.common = {
      Argv: new Argv(),
      ConfigLoader: new ConfigLoader(options || {}),
    };

    /**
     * Services are used to interchange states & data within the running
     * application.
     */
    this.services = {
      Contractor: new Contractor(),
      Filesystem: new Filesystem(),
      Store: new Store(),
    };

    /**
     * Workers are workflows that can subscribed and published by the
     * Contractor service
     */
    this.workers = {};
  }

  /**
   * Bootstraps the Plains instance
   */
  boot() {
    this.argv = this.common.Argv.define();

    // Define the initial application configuration.
    this.config = this.common.ConfigLoader.define();

    // Defines the root path to the sources that will be processed.
    this.services.Filesystem.defineSource(this.config.src);

    /**
     * Defines the destination path where all processed entries will be
     * written to.
     */
    this.services.Filesystem.defineDestination(this.config.dist);

    // Expose the environment specific configuration.
    this.services.Store.commit(this.argv, 'argv');

    // Expose the application configuration.
    this.services.Store.commit(this.config, 'config');

  }

  /**
   * Handler to initiate Plains.
   */
  async start() {
    this.boot();

    // Call the initial hook from the the defined task.
    await this.services.Contractor.publish(this.argv.task);
  }

  /**
   * Assign a new Worker to the workers Object.
   *
   * @param {String} name The name for the assigned worker.
   * @param {Object} Instance The actual class that will be used.
   */
  assignWorker(name, Instance) {
    if (this.workers[name]) {
      error(`Unable to assign worker, ${name} has already been assigned.`);
    }

    if (typeof instance.mount !== 'function') {
      error(`Unable to assign worker, the given instance has no mount handler`);
    }

    log('Assiging Worker', name);

    this.workers[name] = new Instance();
  }
}

module.exports = Plains;
