const Argv = require('./Common/Argv');
const ConfigLoader = require('./Common/ConfigLoader');

const Contractor = require('./Services/Contractor');
const FileSystem = require('./Services/FileSystem');
const Store = require('./Services/Store');

const Cleaner = require('./Workers/Cleaner');
const FileSync = require('./Workers/FileSync');
const VendorResolver = require('./Workers/VendorResolver');
const SassCompiler = require('./Workers/SassCompiler');

class Plains {
  constructor(options) {
    this.options = options || {};

    /**
     * Stores the Core instances for Plains.
     */
    this.common = {
      Argv: new Argv(),
      ConfigLoader: new ConfigLoader(this.options),
    };

    /**
     * Services are used to extend the functionality for Plains like:
     * storing application state & configurations, task & file management.
     */
    this.services = {
      Contractor: new Contractor(),
      FileSystem: new FileSystem(),
      Store: new Store(),
    };

    /**
     * Workers are used to process the actual files defined within
     * the Plains environment.
     */
    this.workers = {
      Cleaner: new Cleaner(this.services),
      FileSync: new FileSync(this.services),
      VendorResolver: new VendorResolver(this.services),
      SassCompiler: new SassCompiler(this.services),
    };

    /**
     * Plugins include environment specific tasks like creating wathcing
     * instances and optimizing assets.
     */
    this.plugins = {};
  }

  /**
   * Bootstraps the Plains instance.
   */
  boot() {
    // Define the initial CLI arguments.
    this.args = this.common.Argv.define();

    // Define the custom configuration.
    this.config = this.common.ConfigLoader.define();

    // Define the global application configuration
    // @TODO: Create configuration for each layer: service, plugin etc.
    this.services.Store.create('plains', this.config);

    // Define the root directory where all the entry files are defined.
    this.services.FileSystem.defineRoot(this.config.src);

    /**
     * Defines the destination directory where all processed entry files will
     * be written to.
     */
    this.services.FileSystem.defineDestination(this.config.dist);

    // Mount each Worker instance.
    Object.keys(this.workers).forEach(name => {
      const worker = this.workers[name];

      if (typeof worker.mount === 'function') {
        worker.mount();
      }
    });

    // Prepares the Contractor task queue.
    this.services.Contractor.defineTaskQueue(this.args.task);
  }

  /**
   * Initialize the Plains instance.
   */
  async run() {
    await this.services.Contractor.run();
  }
}

module.exports = Plains;
