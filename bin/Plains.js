const Argv = require('./Argv');
const Builder = require('./Builder');
const Config = require('./Config');
const Environment = require('./Environment');
const Store = require('./Store');

class Plains {
  constructor(config) {
    /**
     * Store the CLI inserted arguments within the Plains object for easy
     * access within the Plains Builder.
     */
    this.Argv = new Argv();

    /**
     * Define the environment variables from the optional dotenv environment
     * file.
     */
    this.Environment = new Environment();

    /**
     * Defines the common configuration.
     */
    this.Config = new Config(config);

    /**
     * Create a new Store instance in order to interchange the data between
     * the various Builders.
     */
    this.Store = new Store();

    /**
     * Create a new Builder instance that handles all processing tasks.
     */
    this.Builder = new Builder(this.Argv, this.Environment, this.Config, this.Store);
  }

  /**
   * Initialize Plains.
   *
   * @param {*} config The custom configuration Object for Plains
   */
  async init() {
    this.Builder.run().then(() => {
      console.log('Done');
    });
  }
}

module.exports = Plains;
