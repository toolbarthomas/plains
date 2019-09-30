const { existsSync } = require('fs');
const rimraf = require('rimraf');

const Worker = require('./Worker');
const { log } = require('../Utils/Logger');

/**
 * Clears the defined FileSystem destination directory.
 */
class Cleaner extends Worker {
  mount() {
    const path = this.services.FileSystem.resolveDestination();

    if (existsSync(path)) {
      log('Clearing build directory', path);

      rimraf(`${path}/**/*`, () => {
        log('Build directory cleared', path);

        this.resolve();
      });
    } else {
      this.resolve();
    }
  }
}

module.exports = Cleaner;
