const rimraf = require('rimraf');
const { existsSync } = require('fs');
const { dirname } = require('path');
const { log } = require('../Utils/Logger');
const { gray } = require('chalk');

/**
 * Core worker for Plains that clears the defined build directory.
 *
 * @param {Object} services The Plains services instances.
 */
class Cleaner {
  constructor(services) {
    this.services = services;
    this.taskName = 'clean';
  }

  /**
   * Subscribes the cleaner worker to Plains.
   */
  mount() {
    this.services.Contractor.subscribe(this.taskName, this.init.bind(this), true);
  }

  /**
   * Removes all files & directories within the defined Plains build directory.
   */
  init() {
    const entry = this.services.Filesystem.resolveDestination();

    if (!existsSync(entry)) {
      return;
    }

    log('Clearing build directory', entry);

    rimraf(`${entry}/**/*`, () => {
      this.services.Contractor.resolve(this.taskName);

      log(`Directory cleared: ${gray(entry)}`);
    });
  }
}

module.exports = Cleaner;
