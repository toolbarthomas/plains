const { readFileSync } = require('fs');

const Worker = require('./Worker');
const { error } = require('../Utils/Logger');

class DataParser extends Worker {
  /**
   * Parses all the defined entry JSON
   */
  async beforeMount() {
    super.beforeMount();

    await this.services.FileSystem.source(this.name, (entry, resolve) => {
      let data;

      try {
        data = JSON.parse(readFileSync(entry));
      } catch (err) {
        error(err);
      }

      const commit = {};
      commit[entry] = data;

      this.services.Store.commit(this.name, commit);

      resolve();
    });
  }
}

module.exports = DataParser;
