const Argv = require('./Common/Argv');
const ConfigLoader = require('./Common/ConfigLoader');

const Contractor = require('./Services/Contractor');
const Store = require('./Services/Store');

class Plains {
  constructor() {
    /**
     * Defines the global variables for the running application.
     */
    this.common = {
      Argv: new Argv(),
      ConfigLoader: new ConfigLoader(),
    };

    /**
     * Services are used to interchange states & data within the running
     * application.
     */
    this.services = {
      Contractor: new Contractor(),
      Store: new Store(),
    };
  }

  /**
   * Bootstraps the Plains instance
   */
  async boot() {
    this.argv = this.common.Argv.define();

    // Define the initial application configuration.
    this.config = this.common.ConfigLoader.define();

    // Expose the environment specific configuration.
    this.services.Store.commit(this.argv, 'argv');

    // Expose the application configuration.
    this.services.Store.commit(this.config, 'config');

    this.services.Contractor.subscribe('Plains', 'default', this.foo.bind(this));

    // Call the initial hook from the the defined task.
    await this.services.Contractor.publish(this.argv.task);
  }

  foo() {
    console.log('foo');
    this.services.Contractor.resolve('Plains');
  }

  /**
   * Handler to initiate Plains.
   */
  start() {
    this.boot();
  }
}

module.exports = Plains;
