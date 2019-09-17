const Worker = require('./Worker');

/**
 * Syncronizes the defined worker entry paths to the destination directory.
 */
class FileSync extends Worker {
  constructor(services) {
    super(services, 'sync', true);
  }

  /**
   * Synchronizes the intial static entries to the defined destination directory.
   */
  async init() {
    const entries = this.services.FileSystem.getStack(this.name);

    await this.services.FileSystem.copy(entries);

    this.resolve();
  }
}

module.exports = FileSync;
