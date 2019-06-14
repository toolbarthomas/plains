/**
 * Implements the core functionality for Plains.
 */

const Argv = require('./Common/Argv');
const Config = require('./Common/Config');

const Contractor = require('./Services/Contractor');
const Store = require('./Services/Store');
class Plains {
  constructor(options) {
    const { config } = options instanceof Object ? options : {};

    /**
     * Stores the common application Classes.
     */
    this.common = {
      Argv: new Argv(),
      Config: new Config(config),
    };

    /**
     * Assigns the default Plains services.
     */
    this.services = {
      Contractor: new Contractor(),
      Store: new Store(),
    };
  }

  /**
   * Exposes the mandatory environment & application configuration before
   * initializing the new Plains Instance.
   */
  boot() {
    // Expose the processed command line interface arguments.
    this.args = this.common.Argv.define() || {};

    // Expose the actual application configuration.
    this.config = this.common.Config.define();

    // Define a global store to interchange the application states.
    const { defaultStore } = this.config.store || 'app';
    if (defaultStore) {
      this.services.Store.create(defaultStore);
    }
  }

  /**
   * Initialize Plains.
   */
  run() {
    const { task } = this.args;

    if (task) {
      this.services.Contractor.publish(task);
    } else {
      error(`No task has been defined!`);
    }
  }
}

module.exports = Plains;
