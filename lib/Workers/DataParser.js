const { readFileSync } = require('fs');

const Worker = require('./Worker');

const { error, info } = require('../Helpers/Logger');

class DataParser extends Worker {
  async mount() {
    await this.services.Filesystem.process(this.name, (path, resolve) => {
      let data;

      try {
        info(`Parsing file: ${path}`);
        data = JSON.parse(readFileSync(path));
      } catch (err) {
        error(err);
      }

      const commit = {};
      commit[path] = data;

      this.services.Store.commit(commit, this.name);

      resolve();
    }).then(() => this.resolve());
  }
}

module.exports = DataParser;
