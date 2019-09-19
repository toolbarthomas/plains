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
    await this.services.FileSystem.source(this.name, async (entry, resolve) => {
      await this.services.FileSystem.copy(entry);

      // Resolve the iterated entry.
      resolve();
    });

    // Resolve the initial Worker if all entry definitions have been processed.
    this.resolve();
  }
}

module.exports = FileSync;
