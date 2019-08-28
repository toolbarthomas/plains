const { error, log } = require('./Utils/Logger');

const Argv = require('./Common/Argv');
const ConfigLoader = require('./Common/ConfigLoader');

const Contractor = require('./Services/Contractor');
const Filesystem = require('./Services/Fileystem');
const Store = require('./Services/Store');

const Cleaner = require('./Workers/Cleaner');
const SassCompiler = require('./Workers/SassCompiler');

const Server = require('./Plugins/Server');

/**
 * Implements the core functionality for Plains.
 */
class Plains {
  constructor(options) {
    /**
     * Stores the common application Classes.
     */
    this.common = {
      Argv: new Argv(),
      ConfigLoader: new ConfigLoader(options || {}),
    };

    /**
     * Services are the core classes that will be used by Plains.
     * A service provides logic to enable communication between workers & plugins.
     */
    this.services = {
      Contractor: new Contractor(),
      Filesystem: new Filesystem(),
      Store: new Store(),
    };

    /**
     * Workers are the base Classes to transform resources like stylesheets
     * and images.
     */
    this.workers = {
      Cleaner: new Cleaner(this.services),
      SassCompiler: new SassCompiler(this.services),
    };

    /**
     * Plugins provides environment specific functionalities like a devServer
     * for development and minification for production.
     */
    this.plugins = {
      Server: new Server(this.services)
    }
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

    // Mount the common workers for the application so it can be initiated.
    Object.keys(this.workers).forEach(name => {
      const worker = this.workers[name] || false;

      if (!worker) {
        error(`Unable to mount undefined worker: ${name}`);
      }

      if (typeof worker['mount'] !== 'function') {
        error(`No mount method has been defined for worker: ${name}`);
      }

      log('Mounting worker', name);

      // Exposes each worker logic into the Plains services.
      worker.mount();
    });

    // Mount the environment specific plugins.
    Object.keys(this.plugins).forEach(name => {
      const plugin = this.plugins[name];

      if (typeof plugin['mount'] !== 'function') {
        return;
      }

      log('Mounting plugin', name);

      plugin.mount();
    });
  }

  /**
   * Initialize Plains.
   */
  async run() {
    const { task } = this.args;

    // Run the defined task.
    if (task) {
      await this.services.Contractor.publish(task);
    }

    Object.keys(this.plugins).forEach(name => {
      const plugin = this.plugins[name];

      if (typeof plugin['mount'] !== 'function') {
        return;
      }

      plugin.mount();
    });
  }
}

module.exports = Plains;
