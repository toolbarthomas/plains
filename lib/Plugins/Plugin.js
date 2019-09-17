const { error } = require('../Utils/Logger');

class Plugin {
  constructor(services, name) {
    this.services = services;
    this.name = name;
    this.config = false;
  }

  /**
   * Assigns the intial variables to the current Plugin instance.
   */
  mount() {
    this.config = this.services.Store.get('plains', 'plugins')[this.name];

    if (!this.name) {
      error('Unable to mount plugin, no name has been defined.');
    }
  }
}

module.exports = Plugin;
