const { existsSync } = require('fs');
const rimraf = require('rimraf');

const Worker = require('./Worker');
const { log } = require('../Utils/Logger');

class Cleaner extends Worker {
  constructor(services) {
    super(services, 'clean', true);
  }

  /**
   * Clears the defined FileSystem destination directory.
   */
  async init() {
    const destination = this.services.FileSystem.resolveDestination();

    if (existsSync(destination)) {
      log('Clearing build directory', destination);

      rimraf(`${destination}/**/*`, () => {
        log('Build directory cleared', destination);

        this.resolve();
      });
    } else {
      this.resolve();
    }
  }
}

module.exports = Cleaner;
