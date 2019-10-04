const Argv = require("./Common/Argv");
const ConfigLoader = require("./Common/ConfigLoader");

const Store = require("./Services/Store");

class Plains {
  constructor() {
    /**
     * Defines the global variables for the running application.
     */
    this.common = {
      Argv: new Argv(),
      ConfigLoader: new ConfigLoader()
    };

    /**
     * Services are used to interchange states & data within the running
     * application.
     */
    this.services = {
      Store: new Store()
    };
  }

  /**
   * Bootstraps the Plains instance
   */
  boot() {
    this.argv = this.common.Argv.define();

    // Define the initial application configuration.
    this.config = this.common.ConfigLoader.define();

    // Expose the environment specific configuration.
    this.services.Store.commit(this.argv, "argv");

    // Expose the application configuration.
    this.services.Store.commit(this.config, "config");

    const foo = this.services.Store.use("config");
    this.services.Store.prune();
    console.log(foo);
  }

  /**
   * Handler to initiate Plains.
   */
  start() {
    this.boot();
  }
}

module.exports = Plains;
