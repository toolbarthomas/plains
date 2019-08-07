const { error } = require('./Utils/Logger');

const Argv = require('./Common/Argv');
const ConfigLoader = require('./Common/ConfigLoader');

const Contractor = require('./Services/Contractor');
const Filesystem = require('./Services/Fileystem');
const Store = require('./Services/Store');

const Cleaner = require('./Workers/Cleaner');
const SassCompiler = require('./Workers/SassCompiler');

/**
 * Implements the core functionality for Plains.
 */
class Plains {
  constructor(options) {
    const { config } = options instanceof Object ? options : {};

    /**
     * Stores the common application Classes.
     */
    this.common = {
      Argv: new Argv(),
      ConfigLoader: new ConfigLoader(config),
    };

    /**
     * Exposes the core Plains services in order to assing worker instance.
     */
    this.services = {
      Contractor: new Contractor(),
      Filesystem: new Filesystem(),
      Store: new Store(),
    };

    /**
     * Assigns the core workers.
     */
    this.workers = {
      Cleaner: new Cleaner(this.services),
      SassCompiler: new SassCompiler(this.services),
    };
  }

  /**
   * Exposes the mandatory environment & application configuration before
   * initializing the new Plains Instance.
   */
  boot() {
    // Expose the processed command line interface arguments.
    this.args = this.common.Argv.define();

    // Expose the application configuration in the Plains instance.
    this.config = this.common.ConfigLoader.define();

    // Throw an Exception if Plains configuration isn't defined.
    if (!this.config) {
      error('Unable to load the configuration for Plains.');
    }

    // Expose the defined configuration for the actual application.
    this.services.Store.create('plains', this.config);

    // Defines a root path for the application workers to process the application assets.
    this.services.Filesystem.defineRoot(this.config.src);

    // Defines the destination path where the processed entries will be written to.
    this.services.Filesystem.defineDestination(this.config.dist);

    // Mount the common worker for the application so it can be initiated.
    Object.keys(this.workers).forEach(name => {
      const worker = this.workers[name] || false;

      if (!worker) {
        error(`Unable to mount undefined worker: ${name}`);
      }

      if (typeof worker.mount !== 'function') {
        error(`No mount method has been defined for: '${name}'.`);
      }

      // Exposes each worker logic into the Plains services.
      worker.mount();
    });
  }

  /**
   * Initialize Plains.
   */
  run() {
    const { task } = this.args;

    if (task) {
      this.services.Contractor.publish(task);
    }
  }
}

module.exports = Plains;
