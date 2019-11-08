const Worker = require('./Worker');

class Synchronizer extends Worker {
  start() {
    this.services.Filesystem.process(this.name, async (entry, resolve) => {
      await this.services.Filesystem.copy(entry);
      resolve();
    }).then(() => {
      this.resolve();
    });
  }
}

module.exports = Synchronizer;
