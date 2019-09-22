const Worker = require('./Worker');

/**
 * Syncronizes the defined worker entry paths to the destination directory.
 */
class FileSync extends Worker {
  constructor(services) {
    super(services, 'FileSync', true);
  }

  init() {
    this.services.FileSystem.source(this.name, async (entry, resolve) => {
      // Copy the iterated entry.
      await this.services.FileSystem.copy(entry);

      // Resolve the iterated entry.
      resolve();
    }).then(() => {
      // Resolve the initial Worker if all entry definitions have been processed.
      this.resolve();
    });
  }
}

module.exports = FileSync;
