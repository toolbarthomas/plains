const Worker = require('./Worker');

class AssetResolver extends Worker {
  constructor(services) {
    super(services, 'sync', true);
  }

  /**
   * Synchronizes the intial static entries to the defined destination directory.
   */
  init() {
    console.log(this.services.FileSystem.source(this.name));
  }
}

module.exports = AssetResolver;
