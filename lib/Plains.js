const { error, log, success } = require('./Helpers/Logger');

const Argv = require('./Common/Argv');
const ConfigLoader = require('./Common/ConfigLoader');

const Contractor = require('./Services/Contractor');
const Filesystem = require('./Services/Filesystem');
const Store = require('./Services/Store');

const Cleaner = require('./Workers/Cleaner');
const DataParser = require('./Workers/DataParser');
const SassCompiler = require('./Workers/SassCompiler');
const Watcher = require('./Workers/Watcher');

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

    // Enable worker to clear the build directory.
    this.assignWorker('Cleaner', Cleaner);

    // Expose the component data to the application
    this.assignWorker('DataParser', DataParser);

    // Enable worker to process Sass stylesheets.
    this.assignWorker('SassCompiler', SassCompiler);

    // Watches the source entries.
    this.assignWorker('Watcher', Watcher);

    // Mount the assigned workers.
    this.mountWorkers();
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
    if (!name) {
      error('Unable to assign worker, no name has been defined.');
    }

    if (!Instance) {
      error(`${name} has no handler defined and cannot be assigned as Worker.`);
    }

    const { init } = Instance;

    if (this.workers[name]) {
      error(`Unable to assign worker, ${name} has already been assigned.`);
    }

    this.workers[name] = new Instance(this.services);

    if (typeof this.workers[name].start !== 'function') {
      error(`Unable to assign worker, the given instance has no start handler`);
    }

    log('Worker assigned to Plains', `${name}`);
  }

  /**
   * Mounts the Worker instances that have been assigned to the workers object.
   */
  async mountWorkers() {
    const workers = Object.keys(this.workers);

    if (!workers.length) {
      return;
    }

    await Promise.all(
      workers.map(async worker => {
        if (typeof this.workers[worker].mount !== 'function') {
          return;
        }
        log('Mounting assigned worker', worker);

        return await this.workers[worker].mount();
      })
    );
  }
}

module.exports = Plains;
