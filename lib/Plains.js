const Argv = require('./Common/Argv');
const ConfigLoader = require('./Common/ConfigLoader');

const Contractor = require('./Services/Contractor');
const FileSystem = require('./Services/FileSystem');
const Store = require('./Services/Store');

const Cleaner = require('./Workers/Cleaner');
const DataParser = require('./Workers/DataParser');
const FileSync = require('./Workers/FileSync');
const VendorResolver = require('./Workers/VendorResolver');
const ScriptCompiler = require('./Workers/ScriptCompiler');
const SpriteCompiler = require('./Workers/SpriteCompiler');
const StyleCompiler = require('./Workers/StyleCompiler');
const TemplateCompiler = require('./Workers/TemplateCompiler');
const Watcher = require('./Workers/Watcher');

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

    // Define the command line interface configuration.
    this.args = this.common.Argv.define();
    this.services.Store.create('argv', this.args);

    // Define the application configuration.
    this.config = this.common.ConfigLoader.define();
    this.services.Store.create('plains', this.config);

    /**
     * Workers are used to process the actual files defined within
     * the Plains environment.
     */
    this.workers = {
      Cleaner: new Cleaner(this.services),
      DataParser: new DataParser(this.services),
      FileSync: new FileSync(this.services),
      VendorResolver: new VendorResolver(this.services),
      ScriptCompiler: new ScriptCompiler(this.services),
      SpriteCompiler: new SpriteCompiler(this.services),
      StyleCompiler: new StyleCompiler(this.services),
      TemplateCompiler: new TemplateCompiler(this.services),
      Watcher: new Watcher(this.services),
    };
  }

  /**
   * Bootstraps the Plains instance.
   */
  async start() {
    // Define the global application configuration
    // @TODO: Create configuration for each layer: service, plugin etc.

    // Define the root directory where all the entry files are defined.
    this.services.FileSystem.defineSource(this.config.src);

    /**
     * Defines the destination directory where all processed entry files will
     * be written to.
     */
    this.services.FileSystem.defineDestination(this.config.dist);

    // Fire up the initial task.
    await this.services.Contractor.publish(this.args.task);
  }
}

module.exports = Plains;
