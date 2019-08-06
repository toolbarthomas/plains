const rimraf = require('rimraf');

class Cleaner {
  constructor(services) {
    this.services = services;
    this.taskName = 'clean';
  }

  mount() {
    this.services.Contractor.subscribe(this.taskName, this.init.bind(this), true);
  }

  init() {
    // Source each stack from the Filesystem.
    const entries = this.services.Filesystem.source();

    // Don't run the Cleaner if there are no sources defined.
    if (!entries.length) {
      this.services.Contractor.resolve(this.taskName);
    }

    // Remove each file from stack.
    entries.forEach(entry => {
      // Use the queue to resolve the actual Cleaner after all entries have been removed.
      let queue = 0;

      rimraf(entry, () => {
        // Increase the current queue after the current entry has been removed.
        queue += 1;

        // Resolve the subsribed Promise when all entries have been removed.
        if (queue >= entries.length) {
          this.services.Contractor.resolve(this.taskName);
        }
      });
    });
  }
}

module.exports = Cleaner;
