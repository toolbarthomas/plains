const Argv = require('./Argv');
const Builder = require('./Builder');
const Config = require('./Config');
const Environment = require('./Environment');
const Store = require('./Store');

const { error } = require('./Common/Logger');

class Plains {
  constructor(config) {
    /**
     * Expose the arguments defined by the CLI within Plains.
     */
    this.Argv = new Argv();

    /**
     * Expose environment specific variables within Plains.
     */
    this.Environment = new Environment();

    /**
     * Expose the user defined configuration.
     */
    this.Config = new Config(config);

    /**
     * Expose the state for each module to make them interchangeable.
     */
    this.Store = new Store();

    /**
     * Define the builder that will handle the common
     */
    this.Builder = new Builder(this.Argv, this.Environment, this.Config, this.Store);
  }

  /**
   * Initialize Plains.
   */
  async run() {
    let { task } = this.Argv.args;

    if (!task) {
      error('No task has been defined.');
    }

    if (!this.Builder.hasTask(task)) {
      error(`Task '${task}' is not defined.`);
    }

    console.log(task);
  }
}

module.exports = Plains;
