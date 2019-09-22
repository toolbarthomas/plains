const Worker = require('./Worker');

class Watcher extends Worker {
  constructor(services) {
    super(services, 'Watcher', true);
    this.instance;
  }

  async init() {
    const stacks = this.services.FileSystem.list();

    clearTimeout(this.instance);

    this.instance = setTimeout(() => {
      this.resolve();
    }, 5000);
  }
}

module.exports = Watcher;
