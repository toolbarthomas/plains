const Argv = require('./Common/Argv');
const Config = require('./Common/Config');

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
     * Expose the required builders for Plains.
     */
    this.builders = {};
  }

  /**
   * Prepare Plains.
   */
  boot() {
    // Defines the processed command line interface arguments.
    this.args = this.common.Argv.define();

    // Defines the actual application configuration.
    this.config = this.common.Config.define();

    console.log(this);

    console.log('Booting');
  }

  /**
   * Initialize Plains.
   */
  run() {
    console.log('Running');
  }
}

module.exports = Plains;
