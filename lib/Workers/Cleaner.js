const { existsSync } = require('fs');
const { dirname } = require('path');
const rimraf = require('rimraf');

const { log } = require('../Helpers/Logger');

const Worker = require('./Worker');

class Cleaner extends Worker {
  constructor(services) {
    super(services);
  }

  async start() {
    const dist = this.services.Filesystem.resolveDestination();

    if (!existsSync(dist)) {
      this.resolve();
    }

    log('Cleaning up directory', dist);

    return await rimraf(`${dist}/**/*`, () => {
      log('Directory cleaned', dist);

      this.resolve();
    });
  }
}

module.exports = Cleaner;
