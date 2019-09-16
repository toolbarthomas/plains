const { error, log } = require('./Utils/Logger');

const Argv = require('./Common/Argv');
const ConfigLoader = require('../lib/Common/ConfigLoader');

const Contractor = require('./Services/Contractor');
const Filesystem = require('./Services/Fileystem');
const Store = require('./Services/Store');

const Cleaner = require('./Workers/Cleaner');
const SassCompiler = require('./Workers/SassCompiler');

const StyleOptimizer = require('./Plugins/StyleOptimizer');
const Watcher = require('./Plugins/Watcher');

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
      // PluginManager: new PluginManager(),
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
     * Plugins are simple wrappers that enable communication
     * between Services.
     */
    this.plugins = {
      StyleOptimizer: new StyleOptimizer(this.services),
      Watcher: new Watcher(this.services),
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

    // Assign the actual task to Contractor
    this.services.Contractor.defineTaskQueue(this.args.task);

    // Mount the common workers for the application so it can be initiated.
    Plains.mount(this.workers);

    // Mount the common plugins
    Plains.mount(this.plugins);
  }

  /**
   * Mounts each instance that.
   *
   * @param {Object} instances Object with instances that will be mounted.
   */
  static mount(instances) {
    if (instances instanceof Object) {
      Object.keys(instances).forEach(name => {
        const instance = instances[name];

        if (!instance) {
          error(`Unable to mount undefined: ${name}`);
        }

        if (typeof instance.mount !== 'function') {
          error(`No mount method has been defined for ${name}`);
        }

        log('Mounting', name);

        instance.mount();
      });
    }
  }

  /**
   * Initialize Plains.
   */
  async run() {
    const { task } = this.args;

    if (!task) {
      error('No task has been defined');
    }

    await this.services.Contractor.run();
  }
}

module.exports = Plains;
