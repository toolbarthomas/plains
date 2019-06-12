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
   * Prepare Plains.
   */
  boot() {
    // Defines the processed command line interface arguments.
    this.args = this.common.Argv.define() || {};

    // Defines the actual application configuration.
    this.config = this.common.Config.define();

    // Defines the store for assigning the application state.
    this.services.Store.create('common');

    console.log(this.services.Contractor);
  }

  /**
   * Initialize Plains.
   */
  run() {
    const { task } = this.args;

    console.log(this.services.Contractor);
  }
}

module.exports = Plains;
