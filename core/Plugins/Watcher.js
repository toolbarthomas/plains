const chokidar = require('chokidar');

class Watcher {
  constructor(services) {
    this.services = services;
    this.instances = [];

  }

  init() {
    const entries = this.services.Filesystem.collect('sass');

    console.log(entries);
  }
}

module.exports = Watcher;
